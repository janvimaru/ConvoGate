from datetime import date, datetime
import json
import requests
import os
import re
import time
import random
from dotenv import load_dotenv

# Try to find .env file in parent directories if not already loaded in environment
if not os.getenv("GROQ_API_KEY") or not os.getenv("GEMINI_API_KEY"):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(4):
        env_path = os.path.join(current_dir, ".env")
        if os.path.exists(env_path):
            load_dotenv(env_path)
            break
        current_dir = os.path.dirname(current_dir)

# ==========================================
#  GEMINI-POWERED FESTIVAL OPERATIONS
#  (Force Reload - Verified)
# ==========================================

# Try loading from environment first, then fallback to hardcoded
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or 'AIzaSyD4-Mk3Xw_TDQcwp4Y1lTKaZPAou9gtfRI'
CACHE_FILE = os.path.join(os.path.dirname(
    __file__), 'festival_data_cache.json')
# Using a stable model. 2.5-flash is often better for free tier limits than 2.0
MODEL_NAME = "gemini-2.0-flash"

# Fallback Greetings (Only used if API completely fails/timeouts)
FALLBACK_GREETINGS = [
    "Wishing you a celebration filled with light, laughter, and endless joy! 🎉✨",
    "May this festival bring peace, prosperity, and happiness to your life. 🙏💫",
    "Sending you warm wishes on this special occasion. Have a wonderful time! 💖🌟",
    "Hope your day is as bright and beautiful as the festival lights! 🪔✨",
    "Celebrate with joy and creating beautiful memories. Happy Festival! 🎇🎊"
]

# Static Fallbacks for 2026 (Used if Gemini API is rate-limited/429)
STATIC_FESTIVALS_2026 = {
    "January": [
        {"name": "Lohri", "date": "2026-01-13",
            "category": "Harvest", "color": "#FF4500", "emoji": "🔥"},
        {"name": "Makar Sankranti", "date": "2026-01-14",
            "category": "Harvest", "color": "#FFD700", "emoji": "🪁"},
        {"name": "Pongal", "date": "2026-01-15",
            "category": "Harvest", "color": "#008000", "emoji": "🍚"},
        {"name": "Vasant Panchami", "date": "2026-01-23",
            "category": "Religious", "color": "#FFD700", "emoji": "📚"},
        {"name": "Republic Day", "date": "2026-01-26",
            "category": "National", "color": "#FF9933", "emoji": "🇮🇳"}
    ],
    "February": [
        {"name": "Maha Shivaratri", "date": "2026-02-16",
            "category": "Religious", "color": "#4682B4", "emoji": "🔱"}
    ],
    "March": [
        {"name": "Holi", "date": "2026-03-04",
            "category": "Religious", "color": "#FF4500", "emoji": "🎨"},
        {"name": "Gudi Padwa", "date": "2026-03-19",
            "category": "Religious", "color": "#32CD32", "emoji": "🌸"},
        {"name": "Eid al-Fitr", "date": "2026-03-21",
            "category": "Religious", "color": "#10B981", "emoji": "🌙"},
        {"name": "Rama Navami", "date": "2026-03-27",
            "category": "Religious", "color": "#FFD700", "emoji": "🏹"}
    ],
    "April": [
        {"name": "Hanuman Jayanti", "date": "2026-04-02",
            "category": "Religious", "color": "#FF4500", "emoji": "🐒"},
        {"name": "Good Friday", "date": "2026-04-03",
            "category": "Religious", "color": "#783500", "emoji": "✝️"},
        {"name": "Ambedkar Jayanti", "date": "2026-04-14",
            "category": "National", "color": "#0000FF", "emoji": "⚖️"},
        {"name": "Baisakhi", "date": "2026-04-14",
            "category": "Harvest", "color": "#FFD700", "emoji": "🌾"},
        {"name": "Bengali New Year", "date": "2026-04-15",
            "category": "Cultural", "color": "#FF0000", "emoji": "🎭"},
        {"name": "Akshaya Tritiya", "date": "2026-04-19",
            "category": "Religious", "color": "#FFD700", "emoji": "💰"}
    ],
    "May": [
        {"name": "Buddha Purnima", "date": "2026-05-01",
            "category": "Religious", "color": "#FFFFFF", "emoji": "☸️"},
        {"name": "May Day", "date": "2026-05-01",
            "category": "National", "color": "#FF0000", "emoji": "🏗️"},
        {"name": "Angarki Chaturthi", "date": "2026-05-05",
            "category": "Religious", "color": "#FF9933", "emoji": "🐘"},
        {"name": "Shani Jayanti", "date": "2026-05-16",
            "category": "Religious", "color": "#000000", "emoji": "⚖️"},
        {"name": "Eid al-Adha / Bakrid", "date": "2026-05-28",
            "category": "Religious", "color": "#059669", "emoji": "🐐"}
    ],
    "June": [
        {"name": "Rath Yatra", "date": "2026-06-25",
            "category": "Religious", "color": "#ec4899", "emoji": "🛕"}
    ],
    "July": [
        {"name": "Guru Purnima", "date": "2026-07-29",
            "category": "Religious", "color": "#eab308", "emoji": "🙏"}
    ],
    "August": [
        {"name": "Independence Day", "date": "2026-08-15",
            "category": "National", "color": "#10b981", "emoji": "🇮🇳"},
        {"name": "Raksha Bandhan", "date": "2026-08-28",
            "category": "Religious", "color": "#ec4899", "emoji": "🎀"}
    ],
    "September": [
        {"name": "Onam", "date": "2026-09-02",
            "category": "Harvest", "color": "#8BC34A", "emoji": "🌾"},
        {"name": "Krishna Janmashtami", "date": "2026-09-04",
            "category": "Religious", "color": "#3b82f6", "emoji": "🦚"},
        {"name": "Ganesh Chaturthi", "date": "2026-09-14",
            "category": "Religious", "color": "#f97316", "emoji": "🐘"}
    ],
    "October": [
        {"name": "Gandhi Jayanti", "date": "2026-10-02",
            "category": "National", "color": "#10b981", "emoji": "🕊️"},
        {"name": "Navratri", "date": "2026-10-11",
            "category": "Religious", "color": "#FFC0CB", "emoji": "🕊️"},
        {"name": "Maha Navami", "date": "2026-10-19",
            "category": "Religious", "color": "#eab308", "emoji": "🌺"},
        {"name": "Dussehra", "date": "2026-10-20",
            "category": "Religious", "color": "#f59e0b", "emoji": "🏹"},
        {"name": "Karva Chauth", "date": "2026-10-29",
            "category": "Religious", "color": "#ec4899", "emoji": "🌙"}
    ],
    "November": [
        {"name": "Diwali", "date": "2026-11-08",
            "category": "Religious", "color": "#eab308", "emoji": "🪔"},
        {"name": "Bhai Dooj", "date": "2026-11-10",
            "category": "Religious", "color": "#f97316", "emoji": "✨"},
        {"name": "Guru Nanak Jayanti", "date": "2026-11-24",
            "category": "Religious", "color": "#eab308", "emoji": "☬"}
    ],
    "December": [
        {"name": "Christmas", "date": "2026-12-25",
            "category": "Religious", "color": "#ef4444", "emoji": "🎄"}
    ]
}

# Master list of correct/verified dates for 2026 to detect and reject AI hallucinations
VERIFIED_FESTIVALS_2026 = {
    "lohri": "2026-01-13",
    "makar sankranti": "2026-01-14",
    "pongal": "2026-01-15",
    "vasant panchami": "2026-01-23",
    "republic day": "2026-01-26",
    "maha shivaratri": "2026-02-16",
    "shivaratri": "2026-02-16",
    "holi": "2026-03-04",
    "gudi padwa": "2026-03-19",
    "ugadi": "2026-03-19",
    "eid al-fitr": "2026-03-21",
    "ramzan eid": "2026-03-21",
    "rama navami": "2026-03-26",
    "ram navami": "2026-03-26",
    "hanuman jayanti": "2026-04-02",
    "good friday": "2026-04-03",
    "ambedkar jayanti": "2026-04-14",
    "baisakhi": "2026-04-14",
    "bengali new year": "2026-04-15",
    "akshaya tritiya": "2026-04-19",
    "buddha purnima": "2026-05-01",
    "may day": "2026-05-01",
    "angarki chaturthi": "2026-05-05",
    "shani jayanti": "2026-05-16",
    "eid al-adha": "2026-05-28",
    "bakrid": "2026-05-28",
    "rath yatra": "2026-06-25",
    "guru purnima": "2026-07-29",
    "independence day": "2026-08-15",
    "raksha bandhan": "2026-08-28",
    "rakhi": "2026-08-28",
    "krishna janmashtami": "2026-09-04",
    "janmashtami": "2026-09-04",
    "onam": "2026-09-02",
    "ganesh chaturthi": "2026-09-14",
    "gandhi jayanti": "2026-10-02",
    "navratri": "2026-10-11",
    "maha navami": "2026-10-19",
    "dussehra": "2026-10-20",
    "vijayadashami": "2026-10-20",
    "karva chauth": "2026-10-29",
    "diwali": "2026-11-08",
    "deepavali": "2026-11-08",
    "bhai dooj": "2026-11-10",
    "guru nanak jayanti": "2026-11-24",
    "christmas": "2026-12-25"
}


def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}


def save_cache(cache_data):
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Cache write error: {e}")


def extract_json_from_text(text):
    """Robustly extract JSON array or object from text"""
    # 1. Try Direct Clean (Most common for Gemini)
    try:
        cleaned = text.replace('```json', '').replace('```', '').strip()
        if cleaned.startswith('json'):
            cleaned = cleaned[4:].strip()
        return json.loads(cleaned)
    except:
        pass

    # 2. Try Regex Extraction
    try:
        # Find valid JSON array or object
        match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
    except:
        pass

    return None


def generate_text_content(prompt, cache_key=None):
    """Direct REST API call to Gemini with Retry + Caching"""

    # 1. Check File Cache (API Response Cache)
    cache = load_cache()
    if cache_key and cache_key in cache:
        print(f"[Cache] Using cached API result for: {cache_key}")
        return cache[cache_key]

    # 2. Call API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"

    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,  # Lower temp for more deterministic/stable JSON
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 2048
        }
    }

    headers = {"Content-Type": "application/json"}

    # Retry logic for 429s
    max_retries = 5
    for attempt in range(max_retries + 1):
        try:
            print(
                f"[API] Calling Gemini API ({MODEL_NAME}, Attempt {attempt+1})...")
            response = requests.post(url, json=data, headers=headers)

            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    parts = result['candidates'][0].get(
                        'content', {}).get('parts', [])
                    if parts:
                        text = parts[0]['text']

                        # Save to Cache
                        if cache_key:
                            cache[cache_key] = text
                            save_cache(cache)

                        return text
                return None

            elif response.status_code == 429:
                # Use default wait time or parse from response
                wait_time = (attempt + 1) * 5  # Slower backoff: 5, 10, 15...

                try:
                    err_json = response.json()
                    # Try to find retryDelay in error details
                    if 'error' in err_json and 'details' in err_json['error']:
                        for detail in err_json['error']['details']:
                            if 'metadata' in detail and 'retryDelay' in detail['metadata']:
                                rd = detail['metadata']['retryDelay']
                                if rd.endswith('s'):
                                    # Add 1s buffer
                                    wait_time = float(rd[:-1]) + 1
                                    print(
                                        f"[Delay] Reviewing retryDelay: {rd} -> Waiting {wait_time:.2f}s")
                                    break
                except:
                    pass

                print(f"[Warning] Quota exceeded (429). Waiting {wait_time:.2f}s...")
                time.sleep(wait_time)
                continue

            else:
                print(
                    f"[Error] Gemini API Error: {response.status_code} - {response.text[:200]}")
                # For 404 (Model not found), try fallback model
                if response.status_code == 404:
                    print("[Warning] Model not found, switching to gemini-2.0-flash for retry")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
                    continue
                break

        except Exception as e:
            print(f"[Error] Connection error: {e}")
            break

    return None


def get_gemini_festivals(year=None, month=None):
    """Get festivals from Gemini API, falling back to Groq API or static dataset if needed"""
    if not year:
        year = date.today().year
    if not month:
        month = date.today().strftime("%B")

    cache_key = f"festivals_{year}_{month}"
    print(f"[Festivals] Getting festivals for {month} {year} via API...")

    prompt = f"""List major Indian festivals, national holidays (such as Independence Day, Republic Day, Gandhi Jayanti), and important public/harvest holidays in {year} for the month of {month}.
    
    Return a STRICT JSON array where each item has:
    - name: Festival or holiday name
    - date: YYYY-MM-DD
    - description: Short description
    - category: Type (e.g., Religious, National, Harvest, Cultural)
    - color: Hex color
    - emoji: Emoji

    Example: [{{"name": "Diwali", "date": "{year}-11-01", "description": "Festival of lights", "category": "Religious", "color": "#FF9933", "emoji": "🪔"}}]
    
    Return ONLY JSON. No markdown formatting. If no festivals/holidays, return []."""

    # Check cache first
    cache = load_cache()
    json_str = cache.get(cache_key)
    festivals = []

    if json_str:
        extracted = extract_json_from_text(json_str)
        if isinstance(extracted, list):
            festivals = extracted
        elif isinstance(extracted, dict) and "festivals" in extracted:
            festivals = extracted["festivals"]

    # 1. Try Gemini API if not cached
    if not festivals:
        json_str = generate_text_content(prompt, cache_key)
        if json_str:
            extracted = extract_json_from_text(json_str)
            if isinstance(extracted, list):
                festivals = extracted

    # 2. Try Groq API fallback if Gemini failed
    if not festivals:
        groq_key = os.getenv("GROQ_API_KEY") or os.getenv("Groq_API_Key")
        if groq_key:
            print("[Groq] Calling Groq API for festivals list...")
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "response_format": {"type": "json_object"}
            }
            try:
                response = requests.post(url, json=data, headers=headers, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    
                    extracted = extract_json_from_text(content)
                    if isinstance(extracted, list):
                        festivals = extracted
                    elif isinstance(extracted, dict) and "festivals" in extracted:
                        festivals = extracted["festivals"]
                    
                    if festivals:
                        # Save to Cache
                        cache[cache_key] = json.dumps(festivals)
                        save_cache(cache)
                        print("[Groq SUCCESS] Festivals successfully fetched via Groq!")
            except Exception as e:
                print(f"[Groq ERROR] Connection error calling Groq for festivals: {e}")

    # Merge with verified static fallbacks for 2026 to ensure 100% correct dates for main celebrations
    if year == 2026 and month in STATIC_FESTIVALS_2026:
        static_festivals = STATIC_FESTIVALS_2026[month]
        if not festivals:
            print(f"[Fallback] Using static fallback for {month} {year}")
            festivals = static_festivals
        else:
            print(f"[Fallback] Merging verified static dates with API results for {month} {year}...")
            static_names = {f['name'].lower().strip() for f in static_festivals}
            merged = list(static_festivals)
            for fest in festivals:
                name = fest.get('name', '').lower().strip()
                # 1. If it matches a static fallback name exactly, skip it (static takes priority)
                if name in static_names:
                    continue
                # 2. If it is a known master festival but the API returned a wrong/hallucinated date, reject it
                if name in VERIFIED_FESTIVALS_2026:
                    correct_date = VERIFIED_FESTIVALS_2026[name]
                    if fest.get('date') != correct_date:
                        print(f"[Fallback] Rejected API-hallucinated date {fest.get('date')} for '{fest.get('name')}'; correct date is {correct_date}")
                        continue
                merged.append(fest)
            festivals = merged

    # Format for frontend
    formatted_festivals = {}
    for fest in festivals:
        if 'date' in fest and 'name' in fest:
            formatted_festivals[fest['date']] = {
                'name': fest['name'],
                'color': fest.get('color', '#FF9933'),
                'emoji': fest.get('emoji', '🎉'),
                'description': fest.get('description', ''),
                'category': fest.get('category', '')
            }

    return {
        'success': True,
        'year': year,
        'month': month,
        'festivals': formatted_festivals,
        'count': len(formatted_festivals)
    }


def generate_smart_greeting(festival_id=None, festival_name=None, tone='Happy'):
    """Generate greetings using Groq API (if GROQ_API_KEY is configured) or Gemini API"""
    if not festival_name:
        return {"success": False, "error": "Festival name required"}

    groq_key = os.getenv("GROQ_API_KEY") or os.getenv("Groq_API_Key")
    
    # Use separate cache keys for Groq and Gemini to avoid collision
    if groq_key:
        cache_key = f"groq_greeting_{festival_name}_{tone}"
    else:
        cache_key = f"gemini_greeting_{festival_name}_{tone}"

    # Prompt requesting a clean JSON object structure (perfect for Groq json_object format and Gemini)
    prompt = f"""Generate 3 unique {tone} greetings for {festival_name}.
    Each message must be 3-4 lines long with emojis.
    Return a JSON object with a "greetings" key containing an array of 3 strings.
    Example: {{ "greetings": ["Message 1", "Message 2", "Message 3"] }}
    Return ONLY JSON."""

    greetings = []
    source = "fallback"

    def parse_greetings(content_str):
        if not content_str:
            return None
        extracted = extract_json_from_text(content_str)
        if isinstance(extracted, list):
            return extracted
        if isinstance(extracted, dict):
            if "greetings" in extracted:
                return extracted["greetings"]
            if "messages" in extracted:
                return extracted["messages"]
        return None

    # Try cache first
    cache = load_cache()
    if cache_key in cache:
        print(f"[Cache] Using cached API result for: {cache_key}")
        cached_greetings = parse_greetings(cache[cache_key])
        if cached_greetings:
            return {
                "success": True,
                "messages": cached_greetings,
                "source": "groq-ai" if groq_key else "gemini-ai"
            }

    # If Groq Key is present, try Groq API first
    if groq_key:
        print("[Groq] Calling Groq API for greetings...")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_object"}
        }

        try:
            response = requests.post(url, json=data, headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Cache response
                cache[cache_key] = content
                save_cache(cache)
                
                parsed = parse_greetings(content)
                if parsed:
                    greetings = parsed
                    source = "groq-ai"
            else:
                print(f"[Groq ERROR] Groq API Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"[Groq ERROR] Connection error calling Groq: {e}")

    # Fallback to Gemini if Groq is not configured or fails
    if not greetings:
        print("[Gemini] Calling Gemini API for greetings...")
        # Since we might have switched to Gemini, use the Gemini cache key for Gemini API
        gemini_cache_key = f"gemini_greeting_{festival_name}_{tone}"
        
        # Check Gemini cache first
        if gemini_cache_key in cache:
            print(f"[Cache] Using cached Gemini result for: {gemini_cache_key}")
            cached_greetings = parse_greetings(cache[gemini_cache_key])
            if cached_greetings:
                return {
                    "success": True,
                    "messages": cached_greetings,
                    "source": "gemini-ai"
                }

        json_str = generate_text_content(prompt, gemini_cache_key)
        if json_str:
            parsed = parse_greetings(json_str)
            if parsed:
                greetings = parsed
                source = "gemini-ai"

    # Global fallback templates
    if not greetings:
        print("[Warning] Using fallback greeting templates (AI failed)")
        greetings = random.sample(FALLBACK_GREETINGS, 3)
        greetings = [g.replace("Festival", festival_name) for g in greetings]
        source = "fallback"

    return {
        "success": True,
        "messages": greetings,
        "source": source
    }


def generate_festival_card_designs(festival_name):
    """Generate card designs from API"""
    if not festival_name:
        return {"success": False, "error": "Name required"}

    cache_key = f"card_design_{festival_name}"

    prompt = f"""Generate 3 unique card designs for {festival_name}.
    Return STRICT JSON array of objects with keys: design_style, primary_color, accent_color, pattern_description, icon.
    Return ONLY JSON."""

    json_str = generate_text_content(prompt, cache_key)
    designs = []

    if json_str:
        extracted = extract_json_from_text(json_str)
        if isinstance(extracted, list):
            designs = extracted

    return {"success": True, "card_designs": designs}


# Legacy Stubs
def get_active_festival(check_date=None):
    return {"found": False}


def get_upcoming_festivals():
    return {"success": True, "festivals": []}


def get_festival_dashboard_data():
    return {"found": False, "status": "none"}


def manage_contribution(action, group_id, user_id=None,
                        amount=None, status=None):
    return {"success": False}

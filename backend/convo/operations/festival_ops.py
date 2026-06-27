from datetime import date, datetime
import json
import requests
import os
import re
import time
import random

# ==========================================
#  GEMINI-POWERED FESTIVAL OPERATIONS
#  (Force Reload - Verified)
# ==========================================

GEMINI_API_KEY = 'AIzaSyD4-Mk3Xw_TDQcwp4Y1lTKaZPAou9gtfRI'
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
        {"name": "Republic Day", "date": "2026-01-26",
            "category": "National", "color": "#FF9933", "emoji": "🇮🇳"}
    ],
    "February": [
        {"name": "Vasant Panchami", "date": "2026-02-01",
            "category": "Religious", "color": "#FFD700", "emoji": "📚"},
        {"name": "Maha Shivaratri", "date": "2026-02-16",
            "category": "Religious", "color": "#4682B4", "emoji": "🔱"}
    ],
    "March": [
        {"name": "Holi", "date": "2026-03-04",
            "category": "Religious", "color": "#FF4500", "emoji": "🎨"},
        {"name": "Gudi Padwa", "date": "2026-03-19",
            "category": "Religious", "color": "#32CD32", "emoji": "🌸"},
        {"name": "Rama Navami", "date": "2026-03-27",
            "category": "Religious", "color": "#FFD700", "emoji": "🏹"}
    ],
    "April": [
        {"name": "Hanuman Jayanti", "date": "2026-04-02",
            "category": "Religious", "color": "#FF4500", "emoji": "🐒"},
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
            "category": "Religious", "color": "#000000", "emoji": "⚖️"}
    ]
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
        print(f"⚡ Using cached API result for: {cache_key}")
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
                f"📡 Calling Gemini API ({MODEL_NAME}, Attempt {attempt+1})...")
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
                                        f"🕒 Reviewing retryDelay: {rd} -> Waiting {wait_time:.2f}s")
                                    break
                except:
                    pass

                print(f"⚠️ Quota exceeded (429). Waiting {wait_time:.2f}s...")
                time.sleep(wait_time)
                continue

            else:
                print(
                    f"❌ Gemini API Error: {response.status_code} - {response.text[:200]}")
                # For 404 (Model not found), try fallback model
                if response.status_code == 404:
                    print("⚠️ Model not found, switching to gemini-2.0-flash for retry")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
                    continue
                break

        except Exception as e:
            print(f"❌ Connection error: {e}")
            break

    return None


def get_gemini_festivals(year=None, month=None):
    """Get festivals strictly from Gemini API"""
    if not year:
        year = date.today().year
    if not month:
        month = date.today().strftime("%B")

    cache_key = f"festivals_{year}_{month}"
    print(f"📅 Getting festivals for {month} {year} via API...")

    prompt = f"""List major Indian festivals in {year} for the month of {month}.
    
    Return a STRICT JSON array where each item has:
    - name: Festival name
    - date: YYYY-MM-DD
    - description: Short description
    - category: Type
    - color: Hex color
    - emoji: Emoji

    Example: [{{"name": "Diwali", "date": "{year}-11-01", "description": "Lights", "category": "Religious", "color": "#FF9933", "emoji": "🪔"}}]
    
    Return ONLY JSON. No markdown formatting. If no festivals, return []."""

    json_str = generate_text_content(prompt, cache_key)
    festivals = []

    if json_str:
        extracted = extract_json_from_text(json_str)
        if isinstance(extracted, list):
            festivals = extracted
        else:
            print(f"❌ Failed to parse JSON: {json_str[:100]}")

    # CRITICAL FALLBACK: If AI fails or returns empty, check our static 2026 data
    if not festivals and year == 2026 and month in STATIC_FESTIVALS_2026:
        print(f"📦 Using static fallback for {month} {year}")
        festivals = STATIC_FESTIVALS_2026[month]

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
    """Generate greetings using Gemini API"""
    if not festival_name:
        return {"success": False, "error": "Festival name required"}

    cache_key = f"greeting_{festival_name}_{tone}"

    prompt = f"""Generate 3 unique {tone} greetings for {festival_name}.
    Each message must be 3-4 lines long with emojis.
    Return STRICT JSON array of 3 strings.
    Example: ["Message 1", "Message 2", "Message 3"]
    Return ONLY JSON."""

    json_str = generate_text_content(prompt, cache_key)
    greetings = []

    if json_str:
        extracted = extract_json_from_text(json_str)
        if isinstance(extracted, list):
            greetings = extracted

    # Fallback only if API fails completely to return valid JSON
    if not greetings:
        print("⚠️ Using fallback greeting templates (API failed)")
        greetings = random.sample(FALLBACK_GREETINGS, 3)
        greetings = [g.replace("Festival", festival_name) for g in greetings]

    return {
        "success": True,
        "messages": greetings,
        "source": "gemini-ai" if json_str else "fallback"
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

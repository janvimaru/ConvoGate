import os
import json
import re
from datetime import datetime
import sys
import requests

# Fixed API Key and Model
GEMINI_API_KEY = 'AIzaSyD4-Mk3Xw_TDQcwp4Y1lTKaZPAou9gtfRI'
DEFAULT_MODEL = "gemini-2.0-flash"


def generate_text_content(prompt, model_name=DEFAULT_MODEL):
    """Generates text content using REST API (Standardized)"""

    # Use REST API directly to avoid version/package conflicts
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"

    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.9,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 2048
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            print(
                f"❌ REST API Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error calling Gemini: {e}")
        return None


def generate_festivals_from_gemini(year, month):
    prompt = f"""List all major Indian festivals in {year} for the month of {month}.

Return a valid JSON array where each festival has:
- name: Festival name
- date: Specific date in YYYY-MM-DD format
- description: Brief 1-line description
- category: Festival category (Religious, National, Harvest, etc.)
- color: Hex color code representing the festival
- emoji: Single relevant emoji

Return ONLY the JSON array, no other text."""

    try:
        response_text = generate_text_content(prompt)
        if response_text:
            cleaned = response_text.replace(
                '```json', '').replace('```', '').strip()
            # Handle potential markdown artifacts
            if cleaned.startswith('json'):
                cleaned = cleaned[4:].strip()

            festivals = json.loads(cleaned)
            return festivals
    except Exception as e:
        print(f"❌ Error parsing festivals: {e}")

    return []


def generate_festival_greetings_from_gemini(festival_name, festival_date, tone="Happy"):
    prompt = f"""Generate 3 completely unique greetings for {festival_name} (celebrated on {festival_date}) with a {tone} tone.

Each greeting MUST be 4-5 lines long with emojis.
Return ONLY a JSON array with 3 strings."""

    try:
        response_text = generate_text_content(prompt)
        if response_text:
            cleaned = response_text.replace(
                '```json', '').replace('```', '').strip()
            # Handle potential markdown artifacts
            if cleaned.startswith('json'):
                cleaned = cleaned[4:].strip()

            greetings = json.loads(cleaned)
            return greetings
    except Exception as e:
        print(f"❌ Error parsing greetings: {e}")

    return []


def generate_festival_theme_from_gemini(festival_name):
    prompt = f"""Generate a beautiful theme design for {festival_name} festival.

Return a JSON object with:
- colors: Object with primary, secondary, accent hex colors
- bg_gradient: CSS gradient string
- img_concept: Main image concept description
- thought: One line inspirational thought
- tags: Array of 5-7 relevant tags

Return ONLY the JSON object."""

    try:
        response_text = generate_text_content(prompt)
        if response_text:
            cleaned = response_text.replace(
                '```json', '').replace('```', '').strip()
            # Handle potential markdown artifacts
            if cleaned.startswith('json'):
                cleaned = cleaned[4:].strip()

            theme = json.loads(cleaned)
            return theme
    except Exception as e:
        print(f"❌ Error parsing theme: {e}")

    return None

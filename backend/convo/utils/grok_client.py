import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url="https://api.x.ai/v1"
)


def grok_generate_text(prompt, temperature=0.9):
    response = client.chat.completions.create(
        # Use the latest Grok 4.1 Fast model
        # Choose the variant that suits your need:
        # - "grok-4-1-fast-reasoning" for complex tasks requiring deep logic
        # - "grok-4-1-fast-non-reasoning" for simple, fast queries
        model="grok-4-1-fast-reasoning",  # <-- UPDATED MODEL NAME
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature,
    )
    return response.choices[0].message.content

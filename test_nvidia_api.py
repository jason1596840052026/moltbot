import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")
model = "meta/llama-3.1-8b-instruct"

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

payload = {
    "model": model,
    "messages": [
        {"role": "user", "content": "請用繁體中文簡短回答：測試成功。"}
    ],
    "temperature": 0.2,
    "max_tokens": 200
}

resp = requests.post(url, headers=headers, json=payload, timeout=60)

print("model:", model)
print("status:", resp.status_code)
print(resp.text)
print("request-id:", resp.headers.get("x-request-id"))
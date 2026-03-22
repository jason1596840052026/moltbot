import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "https://molbot-frontend.vercel.app",
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:3000",
                "http://localhost:3000"
            ]
        }
    }
)

API_KEY = os.getenv("NVIDIA_API_KEY")
MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"


@app.route("/")
def home():
    return jsonify({
        "ok": True,
        "message": "molbot backend is running"
    }), 200


@app.route("/health")
def health():
    return jsonify({
        "ok": True,
        "status": "ok"
    }), 200


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({
            "ok": False,
            "error": "message is required"
        }), 400

    if not API_KEY:
        return jsonify({
            "ok": False,
            "error": "NVIDIA_API_KEY is not set"
        }), 500

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    system_prompt = (
        "你是 molbot，一個使用繁體中文回覆的 AI 助手。"
        "請清楚、自然、簡潔地回答使用者問題。"
    )

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        "temperature": 0.3,
        "max_tokens": 300
    }

    try:
        resp = requests.post(NVIDIA_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        result = resp.json()

        content = result["choices"][0]["message"]["content"]

        return jsonify({
            "ok": True,
            "reply": content,
            "model": MODEL
        }), 200

    except requests.RequestException as e:
        return jsonify({
            "ok": False,
            "error": f"NVIDIA API request failed: {str(e)}"
        }), 500
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": f"unexpected error: {str(e)}"
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)


import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

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
    history = data.get("history", [])

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
        "請根據目前實際能力回答，不要虛構自己具備的功能。"
        "如果你沒有對話記憶、無法查看歷史訊息、或不確定自己的模型資訊，必須直接說明限制。"
        "不要聲稱自己是 OpenAI、GPT-3.5、GPT-4，除非目前設定明確如此。"
        "回答請清楚、自然、分段。"
        "若內容較長，請主動使用條列或分段，避免一次輸出過長。"
    )

    messages = [{"role": "system", "content": system_prompt}]

    for msg in history:
        role = msg.get("role")
        content = msg.get("content", "").strip()
        if role in ["user", "assistant"] and content:
            messages.append({
                "role": role,
                "content": content
            })

    messages.append({
        "role": "user",
        "content": user_message
    })

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 2000
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
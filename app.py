import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://molbot-frontend.vercel.app",
]

CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

API_KEY = os.getenv("NVIDIA_API_KEY")
MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

SYSTEM_PROMPT = (
    "你是 molbot，一個以繁體中文回覆的 AI 助理。"
    "請直接、清楚、自然地回答。"
    "若資訊不足，就明確說明資料不足。"
    "不要捏造你沒有做過的事，也不要假裝自己有長期記憶。"
)

CONTINUE_PROMPT = "請接續上一則回答，從中斷處繼續，不要重複前文。"
MAX_HISTORY = 10


def normalize_text(value):
    return value.strip() if isinstance(value, str) else ""


def clean_history_items(history):
    if not isinstance(history, list):
        return []

    clean_history = []

    for item in history:
        if not isinstance(item, dict):
            continue

        role = normalize_text(item.get("role"))
        content = normalize_text(item.get("content"))

        if role in ["user", "assistant"] and content:
            clean_history.append({
                "role": role,
                "content": content
            })

    return clean_history[-MAX_HISTORY:]


@app.route("/")
def home():
    return jsonify({"message": "molbot backend is running"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}

        message = normalize_text(data.get("message"))
        history = data.get("history", [])
        is_continue_request = data.get("continue") is True

        if not message and not is_continue_request:
            return jsonify({
                "error": "message is required",
                "error_type": "bad_request"
            }), 400

        clean_history = clean_history_items(history)

        if is_continue_request:
            message = (
                "請接續你上一則尚未完成的回答，從中斷處繼續，"
                "直接延續內容，避免重複前面已經說過的內容。"
            )
        elif message == CONTINUE_PROMPT:
            message = (
                "請接續你上一則尚未完成的回答，從中斷處繼續，"
                "直接延續內容，避免重複前面已經說過的內容。"
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(clean_history)
        messages.append({"role": "user", "content": message})

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": messages,
            "temperature": 0.6,
            "top_p": 0.9,
            "max_tokens": 800,
        }

        response = requests.post(
            NVIDIA_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        if response.status_code != 200:
            return jsonify({
                "error": "Model request failed",
                "error_type": "upstream_api_error",
                "details": response.text
            }), response.status_code

        result = response.json()
        reply = (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not reply:
            return jsonify({
                "error": "Model returned empty reply",
                "error_type": "empty_reply"
            }), 502

        return jsonify({
            "reply": reply,
            "model": MODEL,
            "can_continue": True
        })

    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Model request timed out",
            "error_type": "timeout"
        }), 504

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Failed to reach upstream model service",
            "error_type": "network_error",
            "details": str(e)
        }), 502

    except Exception as e:
        return jsonify({
            "error": str(e),
            "error_type": "internal_error"
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
import os
import logging
import requests
import threading
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError


load_dotenv()

app = Flask(__name__)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
DEBUG_MODE = os.getenv("FLASK_DEBUG", "false").lower() == "true"

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))

ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5502",
    "http://localhost:5500",
    "http://localhost:5502",
    "https://molbot-frontend.vercel.app"
]

CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

API_KEY = os.getenv("NVIDIA_API_KEY")
MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")
TELEGRAM_ALLOWED_CHAT_ID = os.getenv("TELEGRAM_ALLOWED_CHAT_ID", "").strip()
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
DISCORD_APPLICATION_ID = os.getenv("DISCORD_APPLICATION_ID", "")
DISCORD_PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY", "")
DISCORD_ALLOWED_GUILD_ID = os.getenv("DISCORD_ALLOWED_GUILD_ID", "")
DISCORD_ALLOWED_CHANNEL_ID = os.getenv("DISCORD_ALLOWED_CHANNEL_ID", "")

SYSTEM_PROMPT = (
    "你是 molbot，一個以繁體中文回覆的 AI 助理。"
    "請直接、清楚、自然地回答。"
    "若資訊不足，就明確說明資料不足。"
    "不要捏造你沒有做過的事，也不要假裝自己有長期記憶。"
)

CONTINUE_PROMPT = "請接續上一則回答，從中斷處繼續，不要重複前文。"
MAX_HISTORY = 10

# Telegram 第一版：先用記憶體保存聊天上下文
# 注意：Render 重啟後會消失，這一版先求最小可用
TELEGRAM_CHAT_SESSIONS = {}

DISCORD_CHAT_SESSIONS = {}


def limit_discord_text(text, limit=1900):
    text = normalize_text(text)

    if len(text) <= limit:
        return text

    return text[: limit - 20].rstrip() + "\n\n[內容較長，已截斷]"


def get_discord_session_key(guild_id, channel_id, user_id):
    return f"{guild_id}:{channel_id}:{user_id}"


def get_discord_history(session_key):
    return DISCORD_CHAT_SESSIONS.get(session_key, [])


def save_discord_history(session_key, history):
    DISCORD_CHAT_SESSIONS[session_key] = clean_history_items(history)


def edit_discord_original_response(interaction_token, content):
    if not DISCORD_APPLICATION_ID:
        print("DISCORD_APPLICATION_ID is missing")
        return

    if not interaction_token:
        print("interaction_token is missing")
        return

    url = (
        f"https://discord.com/api/v10/webhooks/"
        f"{DISCORD_APPLICATION_ID}/{interaction_token}/messages/@original"
    )

    payload = {
        "content": limit_discord_text(content)
    }

    headers = {
        "User-Agent": "molbot/1.5 (Render; Discord interaction edit)"
    }

    response = requests.patch(
        url,
        json=payload,
        headers=headers,
        timeout=30
    )

    print("Discord edit status:", response.status_code)
    print("Discord edit body:", response.text)

    response.raise_for_status()


def handle_discord_ask_async(interaction_token, session_key, user_message):
    try:
        history = get_discord_history(session_key)

        reply = request_model_reply(
            message=user_message,
            history=history,
            is_continue_request=False
        )

        updated_history = history + [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": reply}
        ]
        save_discord_history(session_key, updated_history)

        edit_discord_original_response(interaction_token, reply)

    except Exception:
        app.logger.exception("Discord ask failed")
        edit_discord_original_response(
            interaction_token,
            "系統暫時無法處理這次請求，請稍後再試。"
        )


def handle_discord_continue_async(interaction_token, session_key):
    try:
        history = get_discord_history(session_key)

        if not history:
            edit_discord_original_response(
                interaction_token,
                "目前沒有可接續的內容。"
            )
            return

        reply = request_model_reply(
            message="",
            history=history,
            is_continue_request=True
        )

        updated_history = history + [
            {"role": "assistant", "content": reply}
        ]
        save_discord_history(session_key, updated_history)

        edit_discord_original_response(interaction_token, reply)

    except Exception:
        app.logger.exception("Discord continue failed")
        edit_discord_original_response(
            interaction_token,
            "系統暫時無法接續回覆，請稍後再試。"
        )

def verify_discord_signature(req):
    if not DISCORD_PUBLIC_KEY:
        return False

    signature = req.headers.get("X-Signature-Ed25519", "")
    timestamp = req.headers.get("X-Signature-Timestamp", "")
    body = req.get_data(as_text=True)

    if not signature or not timestamp or not body:
        return False

    try:
        verify_key = VerifyKey(bytes.fromhex(DISCORD_PUBLIC_KEY))
        verify_key.verify(
            f"{timestamp}{body}".encode("utf-8"),
            bytes.fromhex(signature)
        )
        return True
    except (BadSignatureError, ValueError):
        return False

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


def should_allow_continue(reply: str) -> bool:
    text = normalize_text(reply)

    if not text:
        return False

    stripped = text.strip()

    incomplete_endings = (
        "：", "、", ",", "，", "（", "(", "-", "—"
    )

    if stripped.endswith(incomplete_endings):
        return True

    if len(stripped) >= 1400:
        return True

    if stripped[-1] not in "。！？!?」』）)】":
        return True

    lowered = stripped.lower()

    continue_hints = [
        "未完待續",
        "待續",
        "下次繼續",
        "下回繼續",
        "剩下",
        "後面還有",
        "還有幾點",
        "還有以下",
        "先講前",
        "先說前",
        "如果你想知道剩下",
        "我可以繼續介紹",
        "我可以繼續說明",
        "我可以接著講",
        "需要的話我再繼續",
        "若你想知道後續",
        "如果你準備好",
        "接下來我可以",
    ]

    if any(hint in stripped for hint in continue_hints):
        return True

    import re

    numbered_points = re.findall(r"(?:^|\n)\s*(\d+)\.", stripped)
    if numbered_points:
        numbers = [int(n) for n in numbered_points]
        max_number = max(numbers)

        if max_number in (1, 2, 3, 4):
            if any(keyword in stripped for keyword in ["前兩點", "前三點", "前四點", "剩下", "其餘", "另外"]):
                return True

    return False


def build_continue_instruction():
    return (
        "請接續你上一則尚未完成的回答，從中斷處繼續，"
        "直接延續內容，避免重複前面已經說過的內容。"
    )


def build_messages(message, history=None, is_continue_request=False):
    clean_history = clean_history_items(history or [])

    final_message = normalize_text(message)

    if is_continue_request or final_message == CONTINUE_PROMPT:
        final_message = build_continue_instruction()

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(clean_history)
    messages.append({"role": "user", "content": final_message})

    return messages


def request_model_reply(message, history=None, is_continue_request=False):
    if not API_KEY:
        raise RuntimeError("NVIDIA_API_KEY is missing")

    messages = build_messages(
        message=message,
        history=history,
        is_continue_request=is_continue_request
    )

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
        app.logger.error(
            "Model request failed: status=%s",
            response.status_code,
        )
        raise RuntimeError("upstream_model_error")

    result = response.json()
    reply = (
        result.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )

    if not reply:
        raise RuntimeError("Model returned empty reply")

    return reply


def send_telegram_message(chat_id, text):
    if not TELEGRAM_BOT_TOKEN:
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": chat_id,
        "text": text
    }

    requests.post(url, json=payload, timeout=30)


def get_telegram_history(chat_id):
    return TELEGRAM_CHAT_SESSIONS.get(str(chat_id), [])


def save_telegram_history(chat_id, history):
    TELEGRAM_CHAT_SESSIONS[str(chat_id)] = clean_history_items(history)


def handle_telegram_text(chat_id, text):
    text = normalize_text(text)
    history = get_telegram_history(chat_id)

    if not text:
        return

    if text == "/start":
        send_telegram_message(
            chat_id,
            "你好，我是 molbot。\n你現在可以直接輸入問題。\n可用指令：/reset、/continue"
        )
        return

    if text == "/reset":
        save_telegram_history(chat_id, [])
        send_telegram_message(chat_id, "已清除這個 Telegram 對話的暫存上下文。")
        return

    if text == "/continue":
        if not history:
            send_telegram_message(chat_id, "目前沒有可接續的內容。")
            return

        reply = request_model_reply(
            message="",
            history=history,
            is_continue_request=True
        )

        updated_history = history + [
            {"role": "assistant", "content": reply}
        ]
        save_telegram_history(chat_id, updated_history)
        send_telegram_message(chat_id, reply)
        return

    reply = request_model_reply(
        message=text,
        history=history,
        is_continue_request=False
    )

    updated_history = history + [
        {"role": "user", "content": text},
        {"role": "assistant", "content": reply}
    ]
    save_telegram_history(chat_id, updated_history)
    send_telegram_message(chat_id, reply)

@app.route("/discord/interactions", methods=["POST"])
def discord_interactions():
    if not verify_discord_signature(request):
        return jsonify({"error": "invalid request signature"}), 401

    payload = request.get_json(silent=True) or {}

    if payload.get("type") == 1:
        return jsonify({"type": 1}), 200

    if payload.get("type") != 2:
        return jsonify({
            "type": 4,
            "data": {
                "content": "目前只支援 slash commands。"
            }
        }), 200

    guild_id = str(payload.get("guild_id", ""))
    channel_id = str(payload.get("channel_id", ""))
    interaction_token = str(payload.get("token", ""))

    if DISCORD_ALLOWED_GUILD_ID and guild_id != DISCORD_ALLOWED_GUILD_ID:
        return jsonify({
            "type": 4,
            "data": {
                "content": "這個 server 尚未開放使用 molbot。"
            }
        }), 200

    if DISCORD_ALLOWED_CHANNEL_ID and channel_id != DISCORD_ALLOWED_CHANNEL_ID:
        return jsonify({
            "type": 4,
            "data": {
                "content": "請到指定頻道使用 molbot。"
            }
        }), 200

    member = payload.get("member", {}) if isinstance(payload.get("member"), dict) else {}
    member_user = member.get("user", {}) if isinstance(member.get("user"), dict) else {}
    user_obj = payload.get("user", {}) if isinstance(payload.get("user"), dict) else {}
    user_id = str(member_user.get("id") or user_obj.get("id") or "unknown")

    session_key = get_discord_session_key(guild_id, channel_id, user_id)

    data = payload.get("data", {})
    command_name = data.get("name", "")
    options = data.get("options", []) or []

    option_map = {}
    for item in options:
        option_map[item.get("name")] = item.get("value")

    if command_name == "ask":
        user_message = str(option_map.get("message", "") or "").strip()

        if not user_message:
            return jsonify({
                "type": 4,
                "data": {
                    "content": "請輸入問題內容。"
                }
            }), 200

        threading.Thread(
            target=handle_discord_ask_async,
            args=(interaction_token, session_key, user_message),
            daemon=True
        ).start()

        return jsonify({"type": 5}), 200

    if command_name == "reset":
        save_discord_history(session_key, [])
        return jsonify({
            "type": 4,
            "data": {
                "content": "已清除這個 Discord 對話的暫存上下文。"
            }
        }), 200

    if command_name == "continue":
        history = get_discord_history(session_key)

        if not history:
            return jsonify({
                "type": 4,
                "data": {
                    "content": "目前沒有可接續的內容。"
                }
            }), 200

        threading.Thread(
            target=handle_discord_continue_async,
            args=(interaction_token, session_key),
            daemon=True
        ).start()

        return jsonify({"type": 5}), 200

    return jsonify({
        "type": 4,
        "data": {
            "content": f"未知指令：{command_name}"
        }
    }), 200
    
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

        reply = request_model_reply(
            message=message,
            history=history,
            is_continue_request=is_continue_request
        )

        return jsonify({
            "reply": reply,
            "model": MODEL,
            "can_continue": should_allow_continue(reply)
        })

    except requests.exceptions.Timeout:
        app.logger.exception("Model request timed out")
        return jsonify({
            "error": "模型回應逾時，請稍後再試。",
            "error_type": "timeout"
        }), 504
        
    except requests.exceptions.RequestException:
        app.logger.exception("Failed to reach upstream model service")
        return jsonify({
            "error": "目前無法連線到模型服務，請稍後再試。",
            "error_type": "network_error"
        }), 502

    except RuntimeError as e:
        if str(e) == "upstream_model_error":
            app.logger.exception("Upstream model returned non-200 response")
            return jsonify({
                "error": "目前模型服務暫時不可用，請稍後再試。",
                "error_type": "upstream_error"
            }), 502

        app.logger.exception("Runtime error in /chat")
        return jsonify({
            "error": "系統發生錯誤，請稍後再試。",
            "error_type": "internal_error"
        }), 500

    except Exception:
        app.logger.exception("Unexpected error in /chat")
        return jsonify({
            "error": "系統發生錯誤，請稍後再試。",
            "error_type": "internal_error"
        }), 500


@app.route("/telegram/webhook/<secret>", methods=["POST"])
def telegram_webhook(secret):
    try:
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_WEBHOOK_SECRET:
            return jsonify({"ok": False, "error": "telegram is not configured"}), 500

        if secret != TELEGRAM_WEBHOOK_SECRET:
            return jsonify({"ok": False, "error": "forbidden"}), 403

        data = request.get_json(silent=True) or {}
        message_obj = data.get("message") or data.get("edited_message") or {}

        chat = message_obj.get("chat", {}) if isinstance(message_obj, dict) else {}
        chat_id = str(chat.get("id", "")).strip()
        text = normalize_text(message_obj.get("text"))

        if not chat_id:
            return jsonify({"ok": True, "ignored": "no_chat_id"})

        if TELEGRAM_ALLOWED_CHAT_ID and chat_id != TELEGRAM_ALLOWED_CHAT_ID:
            return jsonify({"ok": True, "ignored": "unauthorized_chat"})

        if not text:
            send_telegram_message(chat_id, "目前第一版只支援純文字訊息。")
            return jsonify({"ok": True, "ignored": "non_text_message"})

        handle_telegram_text(chat_id, text)

        return jsonify({"ok": True})

    except Exception:
        app.logger.exception("Telegram webhook failed")
        return jsonify({
            "ok": False,
            "error": "internal_error"
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=DEBUG_MODE)
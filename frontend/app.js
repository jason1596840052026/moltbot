const API_URL = "https://moltbot-ckvn.onrender.com/chat";
// 本地測試時可改成：const API_URL = "http://127.0.0.1:5000/chat";

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const continueBtn = document.getElementById("continueBtn");
const clearBtn = document.getElementById("clearBtn");
const modelInfo = document.getElementById("modelInfo");

const CONTINUE_PROMPT = "請接續上一則回答，從中斷處繼續，不要重複前文。";
const STORAGE_KEY = "molbot_chat_history";

let chatHistory = [];
let isLoading = false;
let lastAssistantReply = "";

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
}

function loadHistory() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        chatHistory = JSON.parse(saved);
        chatHistory.forEach(item => {
            appendMessage(item.role, item.content, item.role);
            if (item.role === "assistant") {
                lastAssistantReply = item.content;
            }
        });

        if (lastAssistantReply) {
            continueBtn.disabled = false;
        }
    } catch (error) {
        console.error("Failed to load history:", error);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function appendMessage(sender, text, type = "") {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${type}`;

    const senderEl = document.createElement("div");
    senderEl.className = "sender";
    senderEl.textContent = sender;

    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = text;

    messageEl.appendChild(senderEl);
    messageEl.appendChild(textEl);
    chatBox.appendChild(messageEl);

    scrollToBottom();
}

function appendSystemMessage(text) {
    appendMessage("系統", text, "system");
}

function appendErrorMessage(text) {
    appendMessage("錯誤", text, "error");
}

function setLoadingState(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    clearBtn.disabled = loading;
    continueBtn.disabled = loading || !lastAssistantReply;
    messageInput.disabled = loading;
}

function getTrimmedHistory() {
    return chatHistory
        .filter(item => item && item.role && item.content && item.content.trim() !== "")
        .slice(-10);
}

async function sendMessage(message, options = { showUserBubble: true }) {
    if (isLoading) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
        appendErrorMessage("請先輸入訊息。");
        return;
    }

    if (options.showUserBubble) {
        appendMessage("你", trimmedMessage, "user");
        chatHistory.push({ role: "user", content: trimmedMessage });
        saveHistory();
    }

    setLoadingState(true);
    appendSystemMessage("molbot 思考中...");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: trimmedMessage,
                history: getTrimmedHistory()
            })
        });

        const systemMessages = [...chatBox.querySelectorAll(".message.system")];
        if (systemMessages.length > 0) {
            systemMessages[systemMessages.length - 1].remove();
        }

        let data = {};
        try {
            data = await response.json();
        } catch {
            appendErrorMessage("伺服器回傳格式異常。");
            return;
        }

        if (!response.ok || data?.error) {
            if (data?.error_type === "timeout") {
                appendErrorMessage("模型回應逾時，請稍後再試。");
            } else if (data?.error_type === "upstream_api_error") {
                appendErrorMessage("模型暫時無法回覆，請稍後再試。");
            } else if (data?.error_type === "bad_request") {
                appendErrorMessage("請求內容有誤，請重新輸入。");
            } else {
                appendErrorMessage(data?.message || "伺服器回應失敗，請稍後再試。");
            }
            return;
        }

        const reply = (data.reply || "").trim();
        const model = data.model || "-";

        if (!reply) {
            appendErrorMessage("模型沒有成功回傳內容。");
            return;
        }

        modelInfo.textContent = `模型：${model}`;
        appendMessage("molbot", reply, "assistant");

        chatHistory.push({ role: "assistant", content: reply });
        lastAssistantReply = reply;
        continueBtn.disabled = false;
        saveHistory();

    } catch (error) {
        const systemMessages = [...chatBox.querySelectorAll(".message.system")];
        if (systemMessages.length > 0) {
            systemMessages[systemMessages.length - 1].remove();
        }

        console.error(error);
        appendErrorMessage("無法連線到伺服器，請確認後端是否啟動或稍後再試。");
    } finally {
        setLoadingState(false);
    }
}

function handleSend() {
    const message = messageInput.value;
    if (!message.trim()) {
        appendErrorMessage("請先輸入訊息。");
        return;
    }

    messageInput.value = "";
    sendMessage(message, { showUserBubble: true });
}

function handleContinue() {
    if (!lastAssistantReply || isLoading) return;
    appendSystemMessage("已請求續答...");
    sendMessage(CONTINUE_PROMPT, { showUserBubble: false });
}

function handleClear() {
    if (isLoading) return;

    chatBox.innerHTML = "";
    chatHistory = [];
    lastAssistantReply = "";
    modelInfo.textContent = "模型：-";
    continueBtn.disabled = true;
    localStorage.removeItem(STORAGE_KEY);
}

sendBtn.addEventListener("click", handleSend);
continueBtn.addEventListener("click", handleContinue);
clearBtn.addEventListener("click", handleClear);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
    }
});

loadHistory();

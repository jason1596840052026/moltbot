const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const messageInput = document.getElementById("messageInput");
const chatArea = document.getElementById("chatArea");
const statusText = document.getElementById("statusText");
const modelText = document.getElementById("modelText");

const API_URL = "https://moltbot-ckvn.onrender.com/chat";
let chatHistory = [];

function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    chatArea.scrollTop = chatArea.scrollHeight;

    return wrapper;
}

function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    messageInput.disabled = isLoading;
    statusText.textContent = isLoading ? "狀態：送出中..." : "狀態：待命中";
}

function clearChat() {
    chatHistory = [];
    chatArea.innerHTML = `
        <div class="message ai">
            <div class="bubble">
                你好，我是 molbot。聊天已清空，可以重新開始。
            </div>
        </div>
    `;
    statusText.textContent = "狀態：待命中";
    modelText.textContent = "模型：尚未取得";
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        statusText.textContent = "狀態：請先輸入訊息";
        return;
    }

    const historyToSend = chatHistory.slice(-10);

    appendMessage("user", message);
    messageInput.value = "";
    setLoading(true);

    const loadingMessage = appendMessage("ai", "molbot 思考中...");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                history: historyToSend
            })
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            loadingMessage.querySelector(".bubble").textContent =
                "請求失敗：" + (data.error || "發生未知錯誤");
            statusText.textContent = "狀態：請求失敗";
            return;
        }

        loadingMessage.querySelector(".bubble").textContent =
            data.reply || "沒有取得回覆";

        chatHistory.push({
            role: "user",
            content: message
        });

        chatHistory.push({
            role: "assistant",
            content: data.reply || "沒有取得回覆"
        });

        modelText.textContent = `模型：${data.model || "未知"}`;
        statusText.textContent = "狀態：成功";
    } catch (error) {
        loadingMessage.querySelector(".bubble").textContent =
            "前端請求失敗：" + error.message;
        statusText.textContent = "狀態：連線失敗";
    } finally {
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

sendBtn.addEventListener("click", sendMessage);
clearBtn.addEventListener("click", clearChat);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
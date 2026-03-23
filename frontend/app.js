const API_BASE_URL = "https://moltbot-ckvn.onrender.com";
const STORAGE_KEY = "molbot_messages_v1";
const MAX_HISTORY = 10;

const elements = {
  chatForm: document.getElementById("chatForm"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),
  continueBtn: document.getElementById("continueBtn"),
  clearBtn: document.getElementById("clearBtn"),
  messages: document.getElementById("messages") || document.getElementById("chatBox"),
  statusText: document.getElementById("statusText"),
  modelName: document.getElementById("modelName") || document.getElementById("modelInfo"),
};

const state = {
  messages: [],
  isSending: false,
  canContinue: false,
  lastUserMessage: "",
  lastAssistantMessage: "",
};

function setStatus(text) {
  if (elements.statusText) {
    elements.statusText.textContent = text || "";
  }
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    state.messages = parsed;
    const lastUser = [...state.messages].reverse().find(msg => msg.role === "user");
    const lastAssistant = [...state.messages].reverse().find(msg => msg.role === "assistant");

    state.lastUserMessage = lastUser?.content || "";
    state.lastAssistantMessage = lastAssistant?.content || "";
    state.canContinue = !!state.lastAssistantMessage;
  } catch (error) {
    console.error("loadMessages error:", error);
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderMessages() {
  if (!elements.messages) return;

  elements.messages.innerHTML = state.messages
    .map(msg => {
      const roleClass = msg.role === "user" ? "user" : "assistant";
      const roleLabel = msg.role === "user" ? "你" : "Molbot";
      return `
        <div class="message ${roleClass}">
          <div class="message-role">${roleLabel}</div>
          <div class="message-content">${escapeHtml(msg.content).replace(/\n/g, "<br>")}</div>
        </div>
      `;
    })
    .join("");

  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function syncUiState() {
  const hasInput = !!elements.messageInput?.value.trim();
  const hasMessages = state.messages.length > 0;

  if (elements.sendBtn) {
    elements.sendBtn.disabled = state.isSending || !hasInput;
    elements.sendBtn.textContent = state.isSending ? "發送中..." : "送出";
  }

  if (elements.continueBtn) {
    elements.continueBtn.disabled = state.isSending || !state.canContinue;
    elements.continueBtn.textContent = state.isSending ? "處理中..." : "續答";
  }

  if (elements.clearBtn) {
    elements.clearBtn.disabled = state.isSending || !hasMessages;
  }

  if (elements.messageInput) {
    elements.messageInput.disabled = state.isSending;
  }
}

function getRecentHistory() {
  return state.messages.slice(-MAX_HISTORY);
}

function appendMessage(role, content) {
  state.messages.push({ role, content });
  saveMessages();
  renderMessages();

  if (role === "user") {
    state.lastUserMessage = content;
  }

  if (role === "assistant") {
    state.lastAssistantMessage = content;
    state.canContinue = !!content;
  }
}

function replaceLastAssistantMessage(content) {
  for (let i = state.messages.length - 1; i >= 0; i--) {
    if (state.messages[i].role === "assistant") {
      state.messages[i].content = content;
      state.lastAssistantMessage = content;
      state.canContinue = !!content;
      saveMessages();
      renderMessages();
      return;
    }
  }

  appendMessage("assistant", content);
}

async function sendChatRequest(message) {
  const payload = {
    message,
    history: getRecentHistory(),
  };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "無法連線到伺服器，請確認後端是否啟動或稍後再試。";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}

async function sendMessage() {
  if (state.isSending) return;

  const userText = elements.messageInput?.value.trim();
  if (!userText) return;

  state.isSending = true;
  syncUiState();
  setStatus("發送中...");

  appendMessage("user", userText);
  elements.messageInput.value = "";
  syncUiState();

  try {
    const data = await sendChatRequest(userText);
    const reply = data.reply || "【資料不足，無法確認】";
    appendMessage("assistant", reply);

    if (elements.modelName && data.model) {
      elements.modelName.textContent = data.model;
    }

    setStatus("完成");
  } catch (error) {
    console.error("sendMessage error:", error);
    appendMessage("assistant", `錯誤：${error.message}`);
    setStatus("發送失敗");
  } finally {
    state.isSending = false;
    syncUiState();
  }
}

async function continueReply() {
  if (state.isSending) return;
  if (!state.canContinue) return;
  if (!state.lastAssistantMessage) return;

  state.isSending = true;
  syncUiState();
  setStatus("續答中...");

  try {
    const continuePrompt = "請延續你上一則回覆，直接從中斷處接續，避免重複前文。";
    const data = await sendChatRequest(continuePrompt);
    const newReply = data.reply || "";

    if (newReply) {
      const mergedReply = `${state.lastAssistantMessage}\n${newReply}`;
      replaceLastAssistantMessage(mergedReply);
    }

    if (elements.modelName && data.model) {
      elements.modelName.textContent = data.model;
    }

    setStatus("續答完成");
  } catch (error) {
    console.error("continueReply error:", error);
    appendMessage("assistant", `錯誤：${error.message}`);
    setStatus("續答失敗");
  } finally {
    state.isSending = false;
    syncUiState();
  }
}

function clearChat() {
  if (state.isSending) return;

  state.messages = [];
  state.canContinue = false;
  state.lastUserMessage = "";
  state.lastAssistantMessage = "";

  localStorage.removeItem(STORAGE_KEY);
  renderMessages();
  setStatus("已清空聊天");
  syncUiState();
}

function bindEvents() {
  if (elements.chatForm) {
    elements.chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage();
    });
  }

  if (elements.sendBtn) {
    elements.sendBtn.addEventListener("click", (event) => {
      event.preventDefault();
      sendMessage();
    });
  }

  if (elements.continueBtn) {
    elements.continueBtn.addEventListener("click", (event) => {
      event.preventDefault();
      continueReply();
    });
  }

  if (elements.clearBtn) {
    elements.clearBtn.addEventListener("click", (event) => {
      event.preventDefault();
      clearChat();
    });
  }

  if (elements.messageInput) {
    elements.messageInput.addEventListener("input", syncUiState);

    elements.messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  }
}

function init() {
  loadMessages();
  renderMessages();
  bindEvents();
  syncUiState();
  setStatus("就緒");
}

init();
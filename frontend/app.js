// console.log("app.js loaded - qwen test");
// const API_BASE_URL = "https://moltbot-ckvn.onrender.com";
const API_BASE_URL = "http://127.0.0.1:5000";
const STORAGE_KEY = "molbot_messages_v1";
const MAX_HISTORY = 10;

const CONTINUE_PROMPT = "請接續上一則回答，從中斷處繼續，不要重複前文。";

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
  pendingStatusEl: null,
};

function normalizeText(value) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

function normalizeForCompare(value) {
  return normalizeText(value)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/[，。！？；：、,.!?;:]/g, "")
    .trim();
}

function splitIntoParagraphs(value) {
  return normalizeText(value)
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      role: typeof item.role === "string" ? item.role.trim() : "",
      content: normalizeText(item.content),
    }))
    .filter((item) => ["user", "assistant", "system"].includes(item.role) && item.content)
    .slice(-MAX_HISTORY);
}

function setStatus(text) {
  if (elements.statusText) {
    elements.statusText.textContent = text || "";
  }
}

function renderTransientError(message) {
  if (!elements.messages) return;

  const el = document.createElement("div");
  el.className = "message-row assistant";
  el.innerHTML = `
    <div class="message-role">系統</div>
    <div class="message assistant">
      <div class="message-content">${escapeHtml(`錯誤：${message}`)}</div>
    </div>
  `;

  elements.messages.appendChild(el);
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function saveMessages() {
  state.messages = cleanMessages(state.messages);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.messages = [];
      return;
    }

    const parsed = JSON.parse(raw);
    state.messages = cleanMessages(parsed);

    const lastUser = [...state.messages].reverse().find((msg) => msg.role === "user");
    const lastAssistant = [...state.messages].reverse().find((msg) => msg.role === "assistant");

    state.lastUserMessage = lastUser?.content || "";
    state.lastAssistantMessage = lastAssistant?.content || "";
    state.canContinue = !!state.lastAssistantMessage;
  } catch (error) {
    console.error("loadMessages error:", error);
    state.messages = [];
    state.lastUserMessage = "";
    state.lastAssistantMessage = "";
    state.canContinue = false;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getRoleClass(role) {
  return role === "user" ? "user" : "assistant";
}

function getRoleLabel(role) {
  if (role === "user") return "你";
  if (role === "system") return "系統";
  return "Molbot";
}

function renderMessages() {
  if (!elements.messages) return;

  elements.messages.innerHTML = state.messages
    .map((msg) => {
      const roleClass = getRoleClass(msg.role);
      const roleLabel = getRoleLabel(msg.role);

      return `
        <div class="message-row ${roleClass}">
          <div class="message-role">${roleLabel}</div>
          <div class="message ${roleClass}">
            <div class="message-content">${escapeHtml(msg.content).replace(/\n/g, "<br>")}</div>
          </div>
        </div>
      `;
    })
    .join("");

  if (state.pendingStatusEl) {
    elements.messages.appendChild(state.pendingStatusEl);
  }

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
  return cleanMessages(state.messages);
}

function appendMessage(role, content) {
  const text = normalizeText(content);
  if (!text) return;

  state.messages.push({ role, content: text });
  state.messages = cleanMessages(state.messages);

  if (role === "user") {
    state.lastUserMessage = text;
  }

  if (role === "assistant") {
    state.lastAssistantMessage = text;
    state.canContinue = true;
  }

  saveMessages();
  renderMessages();
  syncUiState();
}

function replaceLastAssistantMessage(content) {
  const text = normalizeText(content);
  if (!text) return;

  for (let i = state.messages.length - 1; i >= 0; i--) {
    if (state.messages[i].role === "assistant") {
      state.messages[i].content = text;
      state.lastAssistantMessage = text;
      state.canContinue = true;
      saveMessages();
      renderMessages();
      syncUiState();
      return;
    }
  }

  appendMessage("assistant", text);
}

function showPendingStatus(text = "思考中...") {
  removePendingStatus();

  const el = document.createElement("div");
  el.className = "message-row assistant";
  el.dataset.pending = "true";
  el.innerHTML = `
    <div class="message-role">Molbot</div>
    <div class="message assistant pending-message">
      <div class="message-content">${escapeHtml(text)}</div>
    </div>
  `;

  state.pendingStatusEl = el;

  if (elements.messages) {
    elements.messages.appendChild(el);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }
}

function removePendingStatus() {
  if (state.pendingStatusEl && state.pendingStatusEl.parentNode) {
    state.pendingStatusEl.parentNode.removeChild(state.pendingStatusEl);
  }
  state.pendingStatusEl = null;
}

function removeOverlap(previousText, newText) {
  const prev = normalizeText(previousText);
  const next = normalizeText(newText);

  if (!prev || !next) return next;

  if (next === prev) return "";
  if (next.startsWith(prev)) return next.slice(prev.length).trim();

  const prevNormalized = normalizeForCompare(prev);
  const nextNormalized = normalizeForCompare(next);

  if (nextNormalized === prevNormalized) return "";

  const maxCheck = Math.min(prev.length, next.length, 240);

  for (let len = maxCheck; len >= 20; len--) {
    const prevTail = prev.slice(-len);
    const nextHead = next.slice(0, len);
    if (prevTail === nextHead) {
      return next.slice(len).trim();
    }
  }

  const prevParagraphs = splitIntoParagraphs(prev);
  const nextParagraphs = splitIntoParagraphs(next);

  if (prevParagraphs.length > 0 && nextParagraphs.length > 0) {
    const prevTailParagraphs = prevParagraphs.slice(-2).map(normalizeForCompare);
    let cutIndex = 0;

    for (let i = 0; i < Math.min(2, nextParagraphs.length); i++) {
      const candidate = normalizeForCompare(nextParagraphs[i]);
      if (prevTailParagraphs.includes(candidate)) {
        cutIndex = i + 1;
      } else {
        break;
      }
    }

    if (cutIndex > 0) {
      return nextParagraphs.slice(cutIndex).join("\n").trim();
    }
  }

  const prevSentences = prev
    .split(/(?<=[。！？!?；;\n])/)
    .map((part) => part.trim())
    .filter(Boolean);

  const nextSentences = next
    .split(/(?<=[。！？!?；;\n])/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (prevSentences.length > 0 && nextSentences.length > 0) {
    const recentPrev = prevSentences.slice(-2).map(normalizeForCompare);
    let duplicateCount = 0;

    for (const sentence of nextSentences.slice(0, 2)) {
      const normalizedSentence = normalizeForCompare(sentence);
      if (recentPrev.includes(normalizedSentence)) {
        duplicateCount += 1;
      } else {
        break;
      }
    }

    if (duplicateCount > 0) {
      return nextSentences.slice(duplicateCount).join("").trim();
    }
  }

  return next;
}

async function sendChatRequest(message, isContinue = false) {
  const payload = {
    message: normalizeText(message),
    history: getRecentHistory(),
    continue: isContinue,
  };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.message ||
      data.error ||
      "無法連線到伺服器，請確認後端是否啟動或稍後再試。";
    throw new Error(errorMessage);
  }

  return data;
}

async function sendMessage() {
  if (state.isSending) return;

  const userText = normalizeText(elements.messageInput?.value);
  if (!userText) return;

  state.isSending = true;
  syncUiState();
  setStatus("發送中...");

  removePendingStatus();

  elements.messageInput.value = "";

  appendMessage("user", userText);
  syncUiState();

  showPendingStatus("思考中...");

  try {
    const data = await sendChatRequest(userText, false);
    const reply = normalizeText(data.reply || "【資料不足，無法確認】");

    removePendingStatus();

    if (!reply) {
      throw new Error("模型未回傳內容");
    }

    appendMessage("assistant", reply);

    if (elements.modelName && data.model) {
      // console.log("model element id:", elements.modelName.id);
      // console.log("before update:", elements.modelName.textContent);
      // console.log("new model from API:", data.model);
      elements.modelName.textContent = data.model;
      // console.log("after update:", elements.modelName.textContent);
    }

    state.canContinue = !!data.can_continue;
    setStatus("完成");
  } catch (error) {
    console.error("sendMessage error:", error);
    removePendingStatus();
    renderTransientError(error.message);
    state.canContinue = !!state.lastAssistantMessage;
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

  removePendingStatus();
  showPendingStatus("續答中...");

  try {
    const previousAssistant = state.lastAssistantMessage;
    const data = await sendChatRequest(CONTINUE_PROMPT, true);
    const rawReply = normalizeText(data.reply || "");

    removePendingStatus();

    if (!rawReply) {
      throw new Error("模型未回傳續答內容");
    }

    const dedupedReply = removeOverlap(previousAssistant, rawReply);

    if (!dedupedReply) {
      setStatus("續答完成，但未追加新內容");
      return;
    }

    const mergedReply = `${previousAssistant}\n${dedupedReply}`.trim();
    replaceLastAssistantMessage(mergedReply);

    if (elements.modelName && data.model) {
      console.log("model element id:", elements.modelName.id);
      console.log("before update:", elements.modelName.textContent);
      console.log("new model from API:", data.model);
      elements.modelName.textContent = data.model;
      console.log("after update:", elements.modelName.textContent);
    }

    state.canContinue = !!data.can_continue;
    setStatus("續答完成");
  } catch (error) {
    console.error("continueReply error:", error);
    removePendingStatus();
    renderTransientError(error.message);
    state.canContinue = !!state.lastAssistantMessage;
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

  removePendingStatus();
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
      if (event.isComposing) return;
      if (event.key !== "Enter") return;

      const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        return;
      }

      if (!event.shiftKey) {
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
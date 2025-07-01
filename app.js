// Webhook NDG Community Council (mis à jour)
fetch(WEBHOOK_URL, {https://n8n.srv843989.hstgr.cloud/webhook/550c50cd-0f54-42b3-b750-7dabf877f47c}
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: text, lang: currentLang }),
  mode: "cors"
})

const langTexts = {
  en: {
    title: "Hello! How can I assist you today?",
    presets: [
      "What services does the Community Council offer?",
      "How can I get involved in local events?"
    ],
    input: "Type your message...",
    botFirst: "Ask me anything about NDG Community Council.",
    sending: "Sending..."
  },
  fr: {
    title: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    presets: [
      "Quels services offre le Conseil communautaire ?",
      "Comment puis-je participer aux événements locaux ?"
    ],
    input: "Tapez votre message...",
    botFirst: "Posez-moi toutes vos questions sur le Conseil communautaire NDG.",
    sending: "Envoi en cours..."
  }
};
let currentLang = "en";
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const mainTitle = document.getElementById("main-title");

function scrollToBottom() { chatWindow.scrollTop = chatWindow.scrollHeight; }
function updateLanguage(lang) {
  currentLang = lang;
  document.getElementById("btn-en").classList.toggle("active", lang === "en");
  document.getElementById("btn-fr").classList.toggle("active", lang === "fr");
  mainTitle.textContent = langTexts[lang].title;
  document.querySelectorAll(".quick-btn").forEach((btn, i) => {
    btn.textContent = langTexts[lang].presets[i];
  });
  chatInput.placeholder = langTexts[lang].input;
}
document.getElementById("btn-en").onclick = () => updateLanguage("en");
document.getElementById("btn-fr").onclick = () => updateLanguage("fr");
document.querySelectorAll(".quick-btn").forEach((btn, i) => {
  btn.onclick = () => { sendMessage(langTexts[currentLang].presets[i]); };
});
function sendMessage(text) {
  addMessage(text, true);
  chatInput.value = "";
  addMessage(langTexts[currentLang].sending, false);
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message: text, lang: currentLang })
  })
    .then(async resp => {
      let data;
      try { data = await resp.json(); } catch (e) { data = {}; }
      const bubbles = chatWindow.querySelectorAll(".bubble");
      if (bubbles.length) {
        const lastBubble = bubbles[bubbles.length - 1];
        if (lastBubble.textContent === langTexts[currentLang].sending) {
          lastBubble.textContent = data.reply || data.text || "No reply.";
        }
      }
      scrollToBottom();
    })
    .catch(() => {
      const bubbles = chatWindow.querySelectorAll(".bubble");
      if (bubbles.length) {
        const lastBubble = bubbles[bubbles.length - 1];
        if (lastBubble.textContent === langTexts[currentLang].sending) {
          lastBubble.textContent = "An error occurred.";
        }
      }
    });
}
function addMessage(text, user = true) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message message ${user ? "user" : "bot"}`;
  msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
  chatWindow.appendChild(msgDiv);
  scrollToBottom();
}
window.onload = () => {
  chatWindow.innerHTML = '';
  addMessage(langTexts[currentLang].botFirst, false);
  scrollToBottom();
};
document.getElementById('send-btn').onclick = function(e){
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  sendMessage(text);
  return false;
};
chatInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    sendMessage(text);
  }
});

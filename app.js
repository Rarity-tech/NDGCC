const translations = {
  en: {
    send: 'Send',
    reset: 'Reset chat',
    placeholder: 'Type your message'
  },
  fr: {
    send: 'Envoyer',
    reset: 'Réinitialiser',
    placeholder: 'Entrez votre message'
  }
};

let lang = 'en';

function init() {
  lang = localStorage.getItem('language') || 'en';
  updateLanguageUI();
  loadHistory();
}

function updateLanguageUI() {
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  document.getElementById('send-btn').textContent = translations[lang].send;
  document.getElementById('reset-btn').textContent = translations[lang].reset;
  document.getElementById('user-input').placeholder = translations[lang].placeholder;
}

function setLanguage(l) {
  if (lang === l) return;
  lang = l;
  updateLanguageUI();
}

function loadHistory() {
  const container = document.getElementById('chat-container');
  container.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
  if (history.length === 0) {
    const greeting = lang === 'en'
      ? 'Hi! I\u2019m the NDG Community Council assistant. How can I help you?'
      : 'Bonjour\u202f! Je suis l\u2019IA du Conseil communautaire de NDG. Comment puis-je vous aider\u202f?';
    addMessage(greeting, 'ai', false);
    saveMessage(greeting, 'ai');
  } else {
    history.forEach(m => addMessage(m.text, m.sender, false));
  }
  container.scrollTop = container.scrollHeight;
}

function saveMessage(text, sender) {
  const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
  history.push({ text, sender });
  localStorage.setItem('chat_history', JSON.stringify(history));
}

function addMessage(text, sender, save = true) {
  const container = document.getElementById('chat-container');
  const msg = document.createElement('div');
  msg.className = 'message ' + sender;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  if (save) saveMessage(text, sender);
}

function sendMessage(evt) {
  evt.preventDefault();
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage(text, 'user');

  fetch('https://n8n.srv843989.hstgr.cloud/webhook/550c50cd-0f54-42b3-b750-7dabf877f47c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
    .then(r => r.json())
    .then(data => {
      if (data && data.response) {
        addMessage(data.response, 'ai');
      } else {
        throw new Error('Bad response');
      }
    })
    .catch(() => {
      const err = lang === 'en' ? 'Error connecting to server.' : 'Erreur de connexion au serveur.';
      addMessage(err, 'ai');
    });
}

function resetChat() {
  localStorage.removeItem('chat_history');
  loadHistory();
}

document.getElementById('input-area').addEventListener('submit', sendMessage);
document.getElementById('en-btn').addEventListener('click', () => setLanguage('en'));
document.getElementById('fr-btn').addEventListener('click', () => setLanguage('fr'));
document.getElementById('reset-btn').addEventListener('click', resetChat);

window.addEventListener('DOMContentLoaded', init);

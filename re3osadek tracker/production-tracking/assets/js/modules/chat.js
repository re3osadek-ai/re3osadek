/* ========================================
   💬 REAOSADEK - Chat Module
   ======================================== */

import { STAGES } from '../config.js';
import {
  $, qs, qsa, showToast, createElement, removeElement,
  debounce, scrollTo, escapeHtml
} from '../utils/helpers.js';
import { formatRelativeTime, formatTime, formatStage } from '../utils/formatters.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { getCurrentUser } from './auth.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let chatState = {
  clients: [],
  filteredClients: [],
  activeClient: null,
  activeStage: null,
  messages: [],
  roleFilter: 'all',
  searchQuery: '',
};

// ═══════════════════════════════════════
// 🚀 Initialization
// ═══════════════════════════════════════

/**
 * Initialize Chat module
 */
export async function initChat() {
  console.log('💬 Initializing Chat module...');
  
  try {
    // Load clients
    await loadClients();
    
    // Render client list
    renderClientList();
    
    // Bind events
    bindChatEvents();
    
    // Show welcome message
    showWelcomeMessage();
    
    console.log('✅ Chat module initialized');
  } catch (error) {
    console.error('❌ Error initializing Chat:', error);
    showToast('حدث خطأ أثناء تحميل المحادثات', 'error');
  }
}

/**
 * Load clients from API
 */
async function loadClients() {
  const [clients, projects] = await Promise.all([
    api.getClients(),
    api.getProjects(),
  ]);
  
  // Enrich clients with project count
  chatState.clients = clients.map(client => {
    const clientProjects = projects.filter(p => p.clientCode === client.code);
    return {
      ...client,
      projectCount: clientProjects.length,
      lastActivity: clientProjects.length > 0 
        ? Math.max(...clientProjects.map(p => new Date(p.updatedAt).getTime()))
        : null,
    };
  });
  
  chatState.filteredClients = [...chatState.clients];
}

// ═══════════════════════════════════════
// 🎨 Rendering
// ═══════════════════════════════════════

/**
 * Render client list
 */
function renderClientList() {
  const clientList = $('chatClientList');
  if (!clientList) return;
  
  clientList.innerHTML = '';
  
  if (chatState.filteredClients.length === 0) {
    clientList.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">👥</div>
        <div class="chat-empty-title">لا يوجد عملاء</div>
      </div>
    `;
    return;
  }
  
  chatState.filteredClients.forEach(client => {
    const clientItem = createClientItem(client);
    clientList.appendChild(clientItem);
  });
}

/**
 * Create client item element
 */
function createClientItem(client) {
  const isActive = chatState.activeClient?.code === client.code;
  const initials = getInitials(client.name);
  const isOnline = client.lastActivity && (Date.now() - client.lastActivity < 30 * 60 * 1000);
  
  const item = createElement('div', {
    className: `chat-client-item ${isActive ? 'active' : ''}`,
    dataset: { clientCode: client.code },
    onclick: () => selectClient(client.code),
  });
  
  const avatar = createElement('div', {
    className: `chat-client-avatar ${isOnline ? 'online' : ''}`,
  }, [initials]);
  
  const info = createElement('div', { className: 'chat-client-info' }, [
    createElement('div', { className: 'chat-client-name' }, [client.name]),
    createElement('div', { className: 'chat-client-code' }, [client.code]),
    createElement('div', { className: 'chat-client-last-message' }, [
      `${client.projectCount} ${client.projectCount === 1 ? 'مشروع' : 'مشاريع'}`
    ]),
  ]);
  
  const meta = createElement('div', { className: 'chat-client-meta' }, [
    createElement('span', { className: 'chat-client-time' }, [
      client.lastActivity ? formatRelativeTime(new Date(client.lastActivity)) : '—'
    ]),
  ]);
  
  item.appendChild(avatar);
  item.appendChild(info);
  item.appendChild(meta);
  
  return item;
}

/**
 * Get initials from name
 */
function getInitials(name) {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Show welcome message
 */
function showWelcomeMessage() {
  const messagesArea = $('chatMessagesArea');
  if (!messagesArea) return;
  
  messagesArea.innerHTML = `
    <div class="chat-empty">
      <div class="chat-empty-icon">💬</div>
      <div class="chat-empty-title">Welcome to Production Chat</div>
      <div class="chat-empty-description">
        Select a client and stage to start messaging
      </div>
    </div>
  `;
}

/**
 * Render messages
 */
async function renderMessages() {
  if (!chatState.activeClient || !chatState.activeStage) {
    showWelcomeMessage();
    return;
  }
  
  const messagesArea = $('chatMessagesArea');
  if (!messagesArea) return;
  
  messagesArea.innerHTML = '';
  
  // Load messages from API
  chatState.messages = await api.getMessages(
    chatState.activeClient.code,
    chatState.activeStage
  );
  
  if (chatState.messages.length === 0) {
    messagesArea.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <div class="chat-empty-title">لا توجد رسائل</div>
        <div class="chat-empty-description">
          ابدأ المحادثة بإرسال رسالة
        </div>
      </div>
    `;
    return;
  }
  
  // Render messages
  chatState.messages.forEach(message => {
    const messageElement = createMessageElement(message);
    messagesArea.appendChild(messageElement);
  });
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Create message element
 */
function createMessageElement(message) {
  const currentUser = getCurrentUser();
  const isSent = message.sender === currentUser?.username;
  
  const messageDiv = createElement('div', {
    className: `chat-message ${isSent ? 'sent' : ''}`,
  });
  
  const avatar = createElement('div', {
    className: 'chat-message-avatar',
  }, [isSent ? 'أنت' : getInitials(chatState.activeClient.name)]);
  
  const content = createElement('div', { className: 'chat-message-content' }, [
    createElement('div', { className: 'chat-message-sender' }, [
      isSent ? 'أنت' : chatState.activeClient.name
    ]),
    createElement('div', { className: 'chat-message-bubble' }, [
      escapeHtml(message.text)
    ]),
    createElement('div', { className: 'chat-message-time' }, [
      formatTime(new Date(message.time))
    ]),
  ]);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  return messageDiv;
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
  const messagesArea = $('chatMessagesArea');
  if (messagesArea) {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind all chat events
 */
function bindChatEvents() {
  // Search
  const searchInput = $('chatSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // Role filter
  qsa('.chat-role-btn').forEach(btn => {
    btn.addEventListener('click', handleRoleFilter);
  });
  
  // Stage selector
  const stageSelect = $('chatStageSelect');
  if (stageSelect) {
    stageSelect.addEventListener('change', handleStageChange);
  }
  
  // Send message
  const sendBtn = $('chatSendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }
  
  // Input enter key
  const chatInput = $('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }
  
  // Emoji button (placeholder)
  const emojiBtn = $('emojiBtn');
  if (emojiBtn) {
    emojiBtn.addEventListener('click', () => {
      showToast('الإيموجي قيد التطوير', 'info');
    });
  }
}

/**
 * Handle search
 */
function handleSearch(e) {
  chatState.searchQuery = e.target.value.toLowerCase();
  applyFilters();
}

/**
 * Handle role filter
 */
function handleRoleFilter(e) {
  const btn = e.currentTarget;
  const role = btn.textContent.trim().toLowerCase();
  
  // Update active state
  qsa('.chat-role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  chatState.roleFilter = role === 'الكل' ? 'all' : role;
  applyFilters();
}

/**
 * Apply filters
 */
function applyFilters() {
  let filtered = [...chatState.clients];
  
  // Search filter
  if (chatState.searchQuery) {
    filtered = filtered.filter(client =>
      client.name.toLowerCase().includes(chatState.searchQuery) ||
      client.code.toLowerCase().includes(chatState.searchQuery)
    );
  }
  
  // Role filter (placeholder - can be enhanced later)
  if (chatState.roleFilter !== 'all') {
    // For now, just filter by project count
    filtered = filtered.filter(c => c.projectCount > 0);
  }
  
  chatState.filteredClients = filtered;
  renderClientList();
}

/**
 * Select client
 */
async function selectClient(clientCode) {
  const client = chatState.clients.find(c => c.code === clientCode);
  if (!client) return;
  
  chatState.activeClient = client;
  
  // Update UI
  updateActiveClientUI();
  
  // Render client list
  renderClientList();
  
  // If stage is already selected, load messages
  if (chatState.activeStage) {
    await renderMessages();
  }
}

/**
 * Update active client UI
 */
function updateActiveClientUI() {
  if (!chatState.activeClient) return;
  
  const avatar = $('chatActiveAvatar');
  const name = $('chatActiveName');
  const status = $('chatActiveStatus');
  
  if (avatar) avatar.textContent = getInitials(chatState.activeClient.name);
  if (name) name.textContent = `${chatState.activeClient.name} - ${chatState.activeClient.code}`;
  if (status) {
    const isOnline = chatState.activeClient.lastActivity && 
                     (Date.now() - chatState.activeClient.lastActivity < 30 * 60 * 1000);
    status.className = `chat-main-status ${isOnline ? 'online' : ''}`;
    status.innerHTML = `
      <span class="chat-main-status-dot"></span>
      <span>${isOnline ? 'متصل الآن' : 'غير متصل'}</span>
    `;
  }
}

/**
 * Handle stage change
 */
async function handleStageChange(e) {
  const stageId = e.target.value;
  
  if (!stageId) {
    chatState.activeStage = null;
    showWelcomeMessage();
    return;
  }
  
  if (!chatState.activeClient) {
    showToast('يرجى اختيار عميل أولاً', 'warning');
    e.target.value = '';
    return;
  }
  
  chatState.activeStage = stageId;
  await renderMessages();
}

/**
 * Handle send message
 */
async function handleSendMessage() {
  const chatInput = $('chatInput');
  if (!chatInput) return;
  
  const messageText = chatInput.value.trim();
  
  if (!messageText) {
    showToast('يرجى كتابة رسالة', 'warning');
    return;
  }
  
  if (!chatState.activeClient || !chatState.activeStage) {
    showToast('يرجى اختيار عميل ومرحلة', 'warning');
    return;
  }
  
  const currentUser = getCurrentUser();
  
  try {
    // Send message via API
    const newMessage = await api.sendMessage(
      chatState.activeClient.code,
      chatState.activeStage,
      {
        sender: currentUser?.username || 'admin',
        text: messageText,
      }
    );
    
    // Add to local state
    chatState.messages.push(newMessage);
    
    // Render message
    const messagesArea = $('chatMessagesArea');
    if (messagesArea) {
      // Remove welcome message if exists
      const welcome = messagesArea.querySelector('.chat-empty');
      if (welcome) welcome.remove();
      
      const messageElement = createMessageElement(newMessage);
      messagesArea.appendChild(messageElement);
      
      // Scroll to bottom
      scrollToBottom();
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    showToast('تم إرسال الرسالة', 'success');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    showToast('حدث خطأ أثناء إرسال الرسالة', 'error');
  }
}

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * Get active client
 */
export function getActiveClient() {
  return chatState.activeClient;
}

/**
 * Get active stage
 */
export function getActiveStage() {
  return chatState.activeStage;
}

/**
 * Clear chat
 */
export function clearChat() {
  chatState.activeClient = null;
  chatState.activeStage = null;
  chatState.messages = [];
  
  const stageSelect = $('chatStageSelect');
  if (stageSelect) stageSelect.value = '';
  
  showWelcomeMessage();
  updateActiveClientUI();
}

// ═══════════════════════════════════════
// 🎯 Register Page Callback
// ═══════════════════════════════════════

registerPageCallback('initChat', initChat);

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  initChat,
  getActiveClient,
  getActiveStage,
  clearChat,
};
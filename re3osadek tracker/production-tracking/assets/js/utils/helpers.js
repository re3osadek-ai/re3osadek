/* ========================================
   🛠️ REAOSADEK - Helper Functions
   ======================================== */

   import { UI } from '../config.js';
// ═══════════════════════════════════════
// 🎯 DOM Helpers
// ═══════════════════════════════════════

/**
 * Get element by ID (with error handling)
 */
export function $(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`⚠️ Element with id "${id}" not found`);
  }
  return element;
}

/**
 * Query selector (first match)
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all (all matches)
 */
export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create element with attributes and children
 */
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

/**
 * Remove element safely
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Toggle class on element
 */
export function toggleClass(element, className, force) {
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * Show element
 */
export function show(element, display = 'block') {
  if (element) {
    element.style.display = display;
    element.classList.remove('d-none');
  }
}

/**
 * Hide element
 */
export function hide(element) {
  if (element) {
    element.style.display = 'none';
    element.classList.add('d-none');
  }
}

/**
 * Scroll to element smoothly
 */
export function scrollTo(element, offset = 0) {
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ═══════════════════════════════════════
// 💾 Storage Helpers
// ═══════════════════════════════════════

/**
 * Save to localStorage (with JSON serialization)
 */
export function saveToStorage(key, data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('❌ Error saving to storage:', error);
    return false;
  }
}

/**
 * Load from localStorage (with JSON parsing)
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('❌ Error loading from storage:', error);
    return defaultValue;
  }
}

/**
 * Remove from localStorage
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('❌ Error removing from storage:', error);
    return false;
  }
}

/**
 * Clear all localStorage
 */
export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    return false;
  }
}

/**
 * Save to sessionStorage
 */
export function saveToSession(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('❌ Error saving to session:', error);
    return false;
  }
}

/**
 * Load from sessionStorage
 */
export function loadFromSession(key, defaultValue = null) {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('❌ Error loading from session:', error);
    return defaultValue;
  }
}

// ═══════════════════════════════════════
// 🔢 Number Helpers
// ═══════════════════════════════════════

/**
 * Format number with commas
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency (EGP)
 */
export function formatCurrency(amount, currency = 'EGP') {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Clamp number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generate random number between min and max
 */
export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Round to specific decimal places
 */
export function round(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// ═══════════════════════════════════════
// 📝 String Helpers
// ═══════════════════════════════════════

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize each word
 */
export function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength = 50, suffix = '...') {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert to slug (URL-friendly)
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str) {
  if (!str) return '';
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, entity => map[entity]);
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Generate initials from name
 */
export function getInitials(name, maxLength = 2) {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// ═══════════════════════════════════════
// 📅 Date Helpers
// ═══════════════════════════════════════

/**
 * Format date to display string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISODate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Get relative time (e.g., "منذ 5 دقائق")
 */
export function timeAgo(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  
  const intervals = [
    { label: 'سنة', seconds: 31536000 },
    { label: 'شهر', seconds: 2592000 },
    { label: 'أسبوع', seconds: 604800 },
    { label: 'يوم', seconds: 86400 },
    { label: 'ساعة', seconds: 3600 },
    { label: 'دقيقة', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `منذ ${count} ${interval.label}${count > 1 ? '' : ''}`;
    }
  }
  
  return 'الآن';
}

/**
 * Check if date is today
 */
export function isToday(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d > new Date();
}

/**
 * Get days difference between two dates
 */
export function daysBetween(date1, date2) {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ═══════════════════════════════════════
// 📦 Array Helpers
// ═══════════════════════════════════════

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    (groups[value] = groups[value] || []).push(item);
    return groups;
  }, {});
}

/**
 * Sort array by key
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key];
    const valueB = typeof key === 'function' ? key(b) : b[key];
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Get unique values from array
 */
export function unique(array, key = null) {
  if (!key) return [...new Set(array)];
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array randomly
 */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Find item by ID in array
 */
export function findById(array, id, key = 'id') {
  return array.find(item => item[key] === id);
}

/**
 * Remove item from array by ID
 */
export function removeById(array, id, key = 'id') {
  return array.filter(item => item[key] !== id);
}

// ═══════════════════════════════════════
// 🎯 Object Helpers
// ═══════════════════════════════════════

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Check if object is empty
 */
export function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from object
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key];
    return result;
  }, {});
}

/**
 * Omit specific keys from object
 */
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ═══════════════════════════════════════
// ⏱️ Timing Helpers
// ═══════════════════════════════════════

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep (async delay)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function
 */
export async function retry(fn, attempts = 3, delay = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(delay);
    }
  }
}

// ═══════════════════════════════════════
// 🔐 Validation Helpers
// ═══════════════════════════════════════

/**
 * Check if value is email
 */
export function isEmail(str) {
  if (!str) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(str);
}

/**
 * Check if value is phone number
 */
export function isPhone(str) {
  if (!str) return false;
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(str) && str.replace(/\D/g, '').length >= 8;
}

/**
 * Check if value is URL
 */
export function isURL(str) {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is number
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// ═══════════════════════════════════════
// 🎨 UI Helpers
// ═══════════════════════════════════════

/**
 * Show toast notification
 */
export function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.warn('⚠️ Toast container not found');
    return;
  }
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  const toast = createElement('div', {
    className: `toast toast-${type}`,
  }, [
    createElement('span', { className: 'toast-icon' }, [icons[type] || icons.info]),
    createElement('div', { className: 'toast-content' }, [
      createElement('div', { className: 'toast-message' }, [message]),
    ]),
    createElement('button', {
      className: 'toast-close',
      onclick: () => removeElement(toast),
    }, ['✕']),
  ]);
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => removeElement(toast), 300);
  }, duration);
}

/**
 * Show loading overlay
 */
export function showLoading(text = 'جاري التحميل...') {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  
  const loadingText = overlay.querySelector('.loading-text');
  if (loadingText) loadingText.textContent = text;
  
  overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Open modal
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById(`${modalId}Backdrop`);
  
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  if (backdrop) backdrop.classList.add('active');
}

/**
 * Close modal
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById(`${modalId}Backdrop`);
  
  if (modal) modal.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Confirm dialog
 */
export function confirmDialog(message, title = 'تأكيد') {
  return new Promise(resolve => {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم النسخ بنجاح', 'success');
    return true;
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    showToast('فشل النسخ', 'error');
    return false;
  }
}

// ═══════════════════════════════════════
// 🔢 ID Generators
// ═══════════════════════════════════════

/**
 * Generate UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate short ID
 */
export function generateShortId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate timestamp-based ID
 */
export function generateTimestampId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ═══════════════════════════════════════
// 📥 File Helpers
// ═══════════════════════════════════════

/**
 * Download file from data
 */
export function downloadFile(data, filename, mimeType = 'text/plain') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Read file as text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════
// 🌐 URL Helpers
// ═══════════════════════════════════════

/**
 * Get URL parameter
 */
export function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Set URL parameter
 */
export function setUrlParam(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url);
}

/**
 * Remove URL parameter
 */
export function removeUrlParam(name) {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.pushState({}, '', url);
}

// ═══════════════════════════════════════
// 🎯 Event Helpers
// ═══════════════════════════════════════

/**
 * Add event listener with auto-cleanup
 */
export function on(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }
  return () => {};
}

/**
 * Emit custom event
 */
export function emit(eventName, detail = {}) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Listen for custom event
 */
export function listen(eventName, handler) {
  document.addEventListener(eventName, handler);
  return () => document.removeEventListener(eventName, handler);
}

// ═══════════════════════════════════════
// 🎨 Export All
// ═══════════════════════════════════════

export default {
  // DOM
  $, qs, qsa, createElement, removeElement, toggleClass, show, hide, scrollTo,
  // Storage
  saveToStorage, loadFromStorage, removeFromStorage, clearStorage,
  saveToSession, loadFromSession,
  // Numbers
  formatNumber, formatCurrency, formatPercentage, clamp, randomBetween, round,
  // Strings
  capitalize, capitalizeWords, truncate, slugify, escapeHtml, unescapeHtml,
  isEmpty, getInitials,
  // Dates
  formatDate, toISODate, timeAgo, isToday, isPast, isFuture, daysBetween,
  // Arrays
  groupBy, sortBy, unique, chunk, shuffle, findById, removeById,
  // Objects
  deepClone, deepMerge, isObject, isEmptyObject, pick, omit,
  // Timing
  debounce, throttle, sleep, retry,
  // Validation
  isEmail, isPhone, isURL, isNumber,
  // UI
  showToast, showLoading, hideLoading, openModal, closeModal,
  confirmDialog, copyToClipboard,
  // IDs
  generateUUID, generateShortId, generateTimestampId,
  // Files
  downloadFile, formatFileSize, readFileAsText, readFileAsDataURL,
  // URLs
  getUrlParam, setUrlParam, removeUrlParam,
  // Events
  on, emit, listen,
};
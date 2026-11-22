/* ========================================
   🔴 REAOSADEK - Shortages Module
   ======================================== */

import { STAGES, PRIORITY } from '../config.js';
import {
  $, qs, qsa, showToast, showLoading, hideLoading,
  openModal, closeModal, createElement, escapeHtml
} from '../utils/helpers.js';
import {
  formatStage, formatStatus, formatPriority,
  formatRelativeTime, formatDateAr
} from '../utils/formatters.js';
import { validateShortageForm } from '../utils/validators.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { getCurrentUser } from './auth.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let shortagesState = {
  shortages: [],
  filteredShortages: [],
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byStage: {},
  },
  filters: {
    stage: 'all',
    status: 'all',
    priority: 'all',
    search: '',
  },
  editingShortage: null, // For edit mode
};

// ═══════════════════════════════════════
// 🚀 Initialization
// ═══════════════════════════════════════

/**
 * Initialize Shortages module
 */
export async function initShortages() {
  console.log('🔴 Initializing Shortages module...');
  
  try {
    showLoading('جاري تحميل النواقص...');
    
    // Load data
    await loadShortagesData();
    
    // Render UI
    renderShortages();
    updateStatsUI();
    updateSidebarBadge();
    
    // Bind events
    bindShortagesEvents();
    
    hideLoading();
    console.log('✅ Shortages module initialized');
  } catch (error) {
    console.error('❌ Error initializing Shortages:', error);
    hideLoading();
    showToast('حدث خطأ أثناء تحميل النواقص', 'error');
  }
}

/**
 * Load shortages data from API
 */
async function loadShortagesData() {
  const [shortages, stats] = await Promise.all([
    api.getShortages(),
    api.getShortageStats(),
  ]);
  
  shortagesState.shortages = shortages;
  shortagesState.stats = stats;
  shortagesState.filteredShortages = [...shortages];
}

// ═══════════════════════════════════════
// 🎨 Rendering
// ═══════════════════════════════════════

/**
 * Render all shortages UI
 */
function renderShortages() {
  renderShortagesTable();
  renderStageCards();
}

/**
 * Render shortages table
 */
function renderShortagesTable() {
  const tbody = $('shortagesTableBody');
  if (!tbody) return;
  
  const data = shortagesState.filteredShortages;
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center p-lg text-muted">
          <div class="empty-state-icon">✅</div>
          <div class="mt-sm">لا توجد نواقص</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = data.map(shortage => createShortageRow(shortage)).join('');
  
  // Update table count
  const countElement = qs('.shortages-table-count');
  if (countElement) {
    countElement.textContent = data.length;
  }
}

/**
 * Create a single shortage row HTML
 */
function createShortageRow(shortage) {
  const statusClass = getStatusClass(shortage.status);
  const priorityClass = `shortage-priority ${shortage.priority}`;
  const rowClass = shortage.status === 'resolved' ? 'resolved' : 
                   shortage.status === 'pending' ? 'pending' : '';
  
  return `
    <tr class="${rowClass}" data-shortage-id="${shortage.id}">
      <td>
        <div class="shortage-client-info">
          <span class="shortage-client-code">${escapeHtml(shortage.clientCode)}</span>
        </div>
      </td>
      <td>
        <div class="shortage-client-info">
          <span class="shortage-client-name">${escapeHtml(getClientName(shortage.clientCode))}</span>
        </div>
      </td>
      <td><span class="badge badge-${shortage.stage}">${formatStage(shortage.stage)}</span></td>
      <td>
        <div class="shortage-details">
          <div class="shortage-description">${escapeHtml(shortage.description)}</div>
          ${shortage.item ? `<div class="shortage-item">البند: ${escapeHtml(shortage.item)}</div>` : ''}
        </div>
      </td>
      <td>
        <span class="${priorityClass}">
          <span class="shortage-priority-icon"></span>
          ${formatPriority(shortage.priority)}
        </span>
      </td>
      <td>
        <span class="shortage-status ${shortage.status}">
          <span class="shortage-status-dot"></span>
          ${formatStatus(shortage.status)}
        </span>
      </td>
      <td>
        <div class="shortage-date">
          <span class="shortage-date-main">${formatDateAr(shortage.createdAt)}</span>
          <span class="shortage-date-relative">${formatRelativeTime(shortage.createdAt)}</span>
        </div>
      </td>
      <td>
        <div class="shortage-actions">
          ${shortage.status !== 'resolved' ? `
            <button class="shortage-action-btn resolve" 
                    onclick="window.resolveShortage('${shortage.id}')" 
                    title="حل">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
          <button class="shortage-action-btn" 
                  onclick="window.editShortage('${shortage.id}')" 
                  title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
          <button class="shortage-action-btn delete" 
                  onclick="window.deleteShortage('${shortage.id}')" 
                  title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Render stage cards
 */
function renderStageCards() {
  STAGES.forEach(stage => {
    const count = shortagesState.stats.byStage[stage.id] || 0;
    const card = qs(`.shortages-stage-card.stage-${stage.id}`);
    
    if (card) {
      // Update count
      const countElement = card.querySelector('.shortages-stage-count');
      if (countElement) countElement.textContent = count;
      
      // Toggle has-shortages class
      if (count > 0) {
        card.classList.add('has-shortages');
      } else {
        card.classList.remove('has-shortages');
      }
    }
  });
}

/**
 * Update stats UI
 */
function updateStatsUI() {
  const { total, pending, resolved } = shortagesState.stats;
  
  // Hero stats
  const totalEl = $('shortagesTotal');
  const pendingEl = $('shortagesPending');
  const resolvedEl = $('shortagesResolved');
  
  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (resolvedEl) resolvedEl.textContent = resolved;
}

/**
 * Update sidebar badge
 */
function updateSidebarBadge() {
  const badge = $('shortagesBadge');
  if (badge) {
    const pending = shortagesState.stats.pending + shortagesState.stats.inProgress;
    badge.textContent = pending;
    badge.style.display = pending > 0 ? 'flex' : 'none';
  }
}

/**
 * Get client name by code
 */
function getClientName(clientCode) {
  // Will be populated when clients are loaded
  return clientCode;
}

/**
 * Get CSS class for status
 */
function getStatusClass(status) {
  const classes = {
    'pending': 'pending',
    'in-progress': 'in-progress',
    'resolved': 'resolved',
    'critical': 'critical',
  };
  return classes[status] || '';
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind all shortages events
 */
function bindShortagesEvents() {
  // Add shortage button
  const addBtn = $('addShortageBtn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddShortage);
  }
  
  // Modal close buttons
  qsa('[data-close-modal="shortageModal"]').forEach(btn => {
    btn.addEventListener('click', () => closeModal('shortageModal'));
  });
  
  // Modal backdrop click
  const backdrop = $('shortageModalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => closeModal('shortageModal'));
  }
  
  // Save button in modal
  const saveBtn = qs('#shortageModal .btn-primary');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveShortage);
  }
  
  // Priority selector
  qsa('.shortage-priority-option').forEach(option => {
    option.addEventListener('click', handlePrioritySelect);
  });
  
  // Filters
  const filterSelects = qsa('.shortages-filter-select');
  filterSelects.forEach((select, index) => {
    select.addEventListener('change', (e) => {
      if (index === 0) shortagesState.filters.stage = e.target.value.toLowerCase();
      else if (index === 1) shortagesState.filters.status = e.target.value;
      else if (index === 2) shortagesState.filters.priority = e.target.value.toLowerCase();
      applyFilters();
    });
  });
  
  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('shortageModal');
    }
  });
}

/**
 * Handle add shortage button click
 */
function handleAddShortage() {
  // Reset form
  shortagesState.editingShortage = null;
  resetShortageForm();
  
  // Update modal title
  const modalTitle = qs('#shortageModal .modal-title');
  if (modalTitle) {
    modalTitle.textContent = '🔴 إضافة نقص جديد';
  }
  
  // Open modal
  openModal('shortageModal');
}

/**
 * Handle priority selection
 */
function handlePrioritySelect(e) {
  const option = e.currentTarget;
  qsa('.shortage-priority-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
}

/**
 * Handle save shortage
 */
async function handleSaveShortage() {
  const form = $('shortageForm');
  if (!form) return;
  
  // Get form data
  const inputs = form.querySelectorAll('input, select, textarea');
  const data = {
    clientCode: inputs[0]?.value.trim(),
    stage: inputs[1]?.value,
    priority: qs('.shortage-priority-option.selected')?.classList.contains('low') ? 'low' :
              qs('.shortage-priority-option.selected')?.classList.contains('high') ? 'high' : 'medium',
    description: inputs[2]?.value.trim(),
  };
  
  // Validate
  const validation = validateShortageForm(data);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    showToast(firstError, 'error');
    return;
  }
  
  try {
    showLoading('جاري الحفظ...');
    
    if (shortagesState.editingShortage) {
      // Update existing
      await api.updateShortage(shortagesState.editingShortage.id, data);
      showToast('تم تحديث النقص بنجاح', 'success');
    } else {
      // Create new
      const currentUser = getCurrentUser();
      data.createdBy = currentUser?.username || 'admin';
      await api.createShortage(data);
      showToast('تم إضافة النقص بنجاح', 'success');
    }
    
    // Close modal
    closeModal('shortageModal');
    
    // Reload data
    await loadShortagesData();
    renderShortages();
    updateStatsUI();
    updateSidebarBadge();
    
    hideLoading();
  } catch (error) {
    console.error('❌ Error saving shortage:', error);
    hideLoading();
    showToast('حدث خطأ أثناء الحفظ', 'error');
  }
}

/**
 * Reset shortage form
 */
function resetShortageForm() {
  const form = $('shortageForm');
  if (!form) return;
  
  form.reset();
  
  // Reset priority selector
  qsa('.shortage-priority-option').forEach(opt => opt.classList.remove('selected'));
  const mediumOption = qs('.shortage-priority-option.medium');
  if (mediumOption) mediumOption.classList.add('selected');
}

/**
 * Apply filters
 */
function applyFilters() {
  let filtered = [...shortagesState.shortages];
  
  // Stage filter
  if (shortagesState.filters.stage && shortagesState.filters.stage !== 'all') {
    filtered = filtered.filter(s => s.stage === shortagesState.filters.stage);
  }
  
  // Status filter
  if (shortagesState.filters.status && shortagesState.filters.status !== 'الكل') {
    const statusMap = {
      'معلق': 'pending',
      'قيد الحل': 'in-progress',
      'تم الحل': 'resolved',
    };
    const statusValue = statusMap[shortagesState.filters.status];
    if (statusValue) {
      filtered = filtered.filter(s => s.status === statusValue);
    }
  }
  
  // Priority filter
  if (shortagesState.filters.priority && shortagesState.filters.priority !== 'all') {
    filtered = filtered.filter(s => s.priority === shortagesState.filters.priority);
  }
  
  shortagesState.filteredShortages = filtered;
  renderShortagesTable();
}

// ═══════════════════════════════════════
// 🎯 Global Functions (for onclick handlers)
// ═══════════════════════════════════════

/**
 * Edit shortage
 */
window.editShortage = async function(shortageId) {
  const shortage = shortagesState.shortages.find(s => s.id === shortageId);
  if (!shortage) return;
  
  shortagesState.editingShortage = shortage;
  
  // Fill form
  const form = $('shortageForm');
  if (form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    if (inputs[0]) inputs[0].value = shortage.clientCode;
    if (inputs[1]) inputs[1].value = shortage.stage;
    if (inputs[2]) inputs[2].value = shortage.description;
  }
  
  // Set priority
  qsa('.shortage-priority-option').forEach(opt => opt.classList.remove('selected'));
  const priorityOption = qs(`.shortage-priority-option.${shortage.priority}`);
  if (priorityOption) priorityOption.classList.add('selected');
  
  // Update modal title
  const modalTitle = qs('#shortageModal .modal-title');
  if (modalTitle) {
    modalTitle.textContent = '✏️ تعديل النقص';
  }
  
  // Open modal
  openModal('shortageModal');
};

/**
 * Resolve shortage
 */
window.resolveShortage = async function(shortageId) {
  if (!confirm('هل أنت متأكد من حل هذا النقص؟')) return;
  
  try {
    showLoading('جاري الحل...');
    
    await api.resolveShortage(shortageId);
    
    // Reload data
    await loadShortagesData();
    renderShortages();
    updateStatsUI();
    updateSidebarBadge();
    
    hideLoading();
    showToast('تم حل النقص بنجاح ✅', 'success');
  } catch (error) {
    console.error('❌ Error resolving shortage:', error);
    hideLoading();
    showToast('حدث خطأ أثناء حل النقص', 'error');
  }
};

/**
 * Delete shortage
 */
window.deleteShortage = async function(shortageId) {
  if (!confirm('هل أنت متأكد من حذف هذا النقص؟')) return;
  
  try {
    showLoading('جاري الحذف...');
    
    await api.deleteShortage(shortageId);
    
    // Reload data
    await loadShortagesData();
    renderShortages();
    updateStatsUI();
    updateSidebarBadge();
    
    hideLoading();
    showToast('تم حذف النقص بنجاح', 'success');
  } catch (error) {
    console.error('❌ Error deleting shortage:', error);
    hideLoading();
    showToast('حدث خطأ أثناء الحذف', 'error');
  }
};

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * Get all shortages
 */
export function getAllShortages() {
  return shortagesState.shortages;
}

/**
 * Get shortages stats
 */
export function getShortagesStats() {
  return shortagesState.stats;
}

/**
 * Refresh shortages data
 */
export async function refreshShortages() {
  await loadShortagesData();
  renderShortages();
  updateStatsUI();
  updateSidebarBadge();
}

/**
 * Add new shortage (public API)
 */
export async function addShortage(data) {
  try {
    const newShortage = await api.createShortage(data);
    await refreshShortages();
    return newShortage;
  } catch (error) {
    console.error('❌ Error adding shortage:', error);
    throw error;
  }
}

// ═══════════════════════════════════════
// 🎯 Register Page Callback
// ═══════════════════════════════════════

registerPageCallback('initShortages', initShortages);

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  initShortages,
  getAllShortages,
  getShortagesStats,
  refreshShortages,
  addShortage,
};
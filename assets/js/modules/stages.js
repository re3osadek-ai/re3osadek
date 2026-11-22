/* ========================================
   🏭 REAOSADEK - Stages Management Module
   ======================================== */

import { STAGES, STAGE_IDS } from '../config.js';
import {
  $, qs, qsa, showToast, showLoading, hideLoading,
  createElement, debounce
} from '../utils/helpers.js';
import {
  formatStage, formatStatus, formatRelativeTime,
  formatDateAr, formatDimensionCompact
} from '../utils/formatters.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { getCurrentUser } from './auth.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let stagesState = {
  currentStage: null,
  projects: [],
  filteredProjects: [],
  technicians: [],
  filters: {
    search: '',
    technician: 'all',
    status: 'all',
  },
};

// ═══════════════════════════════════════
// 🚀 Initialization
// ═══════════════════════════════════════

/**
 * Initialize stage page
 */
export async function initStagePage(stageId) {
  console.log(`🏭 Initializing stage page: ${stageId}`);
  
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) {
    showToast('مرحلة غير صحيحة', 'error');
    return;
  }
  
  stagesState.currentStage = stage;
  
  try {
    showLoading('جاري تحميل البيانات...');
    
    // Load data
    await loadStageData(stageId);
    
    // Render UI
    renderStagePage();
    
    // Bind events
    bindStageEvents();
    
    hideLoading();
    console.log(`✅ Stage page initialized: ${stageId}`);
  } catch (error) {
    console.error('❌ Error initializing stage page:', error);
    hideLoading();
    showToast('حدث خطأ أثناء تحميل البيانات', 'error');
  }
}

/**
 * Load stage data from API
 */
async function loadStageData(stageId) {
  const [projects, clients] = await Promise.all([
    api.getProjectsByStage(stageId),
    api.getClients(),
  ]);
  
  // Enrich projects with client info
  stagesState.projects = projects.map(project => {
    const client = clients.find(c => c.code === project.clientCode);
    return {
      ...project,
      clientName: client?.name || 'Unknown',
    };
  });
  
  // Extract unique technicians
  const techniciansSet = new Set();
  projects.forEach(project => {
    project.items.forEach(item => {
      if (item.technician) {
        techniciansSet.add(item.technician);
      }
    });
  });
  stagesState.technicians = Array.from(techniciansSet);
  
  stagesState.filteredProjects = [...stagesState.projects];
}

// ═══════════════════════════════════════
// 🎨 Rendering
// ═══════════════════════════════════════

/**
 * Render stage page
 */
function renderStagePage() {
  const stage = stagesState.currentStage;
  if (!stage) return;
  
  // Find the page container
  const pageContainer = qs(`[data-page-content="${stage.id}"]`);
  if (!pageContainer) {
    // Create page container if doesn't exist
    createStagePageContainer(stage);
    return;
  }
  
  // Render content
  renderStageContent(pageContainer);
}

/**
 * Create stage page container
 */
function createStagePageContainer(stage) {
  const mainContent = qs('.main-content');
  if (!mainContent) return;
  
  const container = createElement('div', {
    className: 'page-section d-none',
    dataset: { pageContent: stage.id },
  });
  
  mainContent.appendChild(container);
  renderStageContent(container);
}

/**
 * Render stage content
 */
function renderStageContent(container) {
  const stage = stagesState.currentStage;
  
  container.innerHTML = `
    <div class="stage-page">
      <!-- Stage Header -->
      <div class="stage-header" style="background: linear-gradient(135deg, ${stage.color} 0%, ${stage.color}dd 100%);">
        <div class="stage-header-content">
          <h1 class="stage-header-title">
            <span>${stage.icon}</span>
            <span>${t(`stage.${stage.id.replace('-', '')}`) || stage.name}</span>
          </h1>
          <p class="stage-header-subtitle">إدارة مشاريع مرحلة ${stage.nameAr}</p>
          <div class="stage-header-stats">
            <div class="stage-stat">
              <div class="stage-stat-value">${stagesState.projects.length}</div>
              <div class="stage-stat-label">مشروع</div>
            </div>
            <div class="stage-stat">
              <div class="stage-stat-value">${getTotalItems()}</div>
              <div class="stage-stat-label">بند</div>
            </div>
            <div class="stage-stat">
              <div class="stage-stat-value">${stagesState.technicians.length}</div>
              <div class="stage-stat-label">فني</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="stage-filters">
        <div class="stage-search">
          <i class="fas fa-search"></i>
          <input type="text" class="form-input" placeholder="🔎 بحث..." id="stageSearch">
        </div>
        <select class="form-input" id="stageTechnicianFilter" style="max-width: 200px;">
          <option value="all">كل الفنيين</option>
          ${stagesState.technicians.map(tech => `
            <option value="${tech}">${tech}</option>
          `).join('')}
        </select>
        <select class="form-input" id="stageStatusFilter" style="max-width: 200px;">
          <option value="all">كل الحالات</option>
          <option value="in-progress">قيد التنفيذ</option>
          <option value="completed">مكتمل</option>
        </select>
        <button class="btn btn-primary" id="stageRefreshBtn">
          <i class="fas fa-sync"></i> تحديث
        </button>
      </div>
      
      <!-- Projects List -->
      <div class="stage-projects-list" id="stageProjectsList">
        ${renderProjectsList()}
      </div>
    </div>
  `;
}

/**
 * Render projects list
 */
function renderProjectsList() {
  const data = stagesState.filteredProjects;
  
  if (data.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3 class="empty-state-title">لا توجد مشاريع</h3>
        <p class="empty-state-description">لا توجد مشاريع في هذه المرحلة حالياً</p>
      </div>
    `;
  }
  
  return data.map(project => renderProjectCard(project)).join('');
}

/**
 * Render project card
 */
function renderProjectCard(project) {
  const stage = stagesState.currentStage;
  const itemsInStage = project.items.filter(item => item.stage === stage.id);
  
  return `
    <div class="stage-project-card" data-project-id="${project.id}">
      <div class="stage-project-header">
        <div class="stage-project-info">
          <div class="stage-project-code">${project.clientCode}</div>
          <div class="stage-project-name">${project.clientName}</div>
          <div class="stage-project-title">${project.projectName}</div>
        </div>
        <div class="stage-project-meta">
          <span class="badge badge-${stage.id}">${itemsInStage.length} ${itemsInStage.length === 1 ? 'بند' : 'بنود'}</span>
          <span class="stage-project-date">${formatRelativeTime(project.updatedAt)}</span>
        </div>
      </div>
      
      <div class="stage-project-items">
        ${itemsInStage.map(item => renderItemRow(item, project.id)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render item row
 */
function renderItemRow(item, projectId) {
  const dimensions = formatDimensionCompact(item.width, item.depth, item.height);
  
  return `
    <div class="stage-item-row" data-item-id="${item.id}">
      <div class="stage-item-info">
        <div class="stage-item-code">${item.code}</div>
        <div class="stage-item-name">${item.name}</div>
        <div class="stage-item-dimensions">${dimensions} | الكمية: ${item.quantity}</div>
      </div>
      <div class="stage-item-technician">
        <i class="fas fa-user"></i>
        <span>${item.technician || '—'}</span>
      </div>
      <div class="stage-item-status">
        <span class="report-status ${item.status}">
          <span class="report-status-dot"></span>
          ${formatStatus(item.status)}
        </span>
      </div>
      <div class="stage-item-actions">
        <button class="btn btn-sm btn-ghost" onclick="window.viewItemDetails('${projectId}', '${item.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-success" onclick="window.markItemComplete('${projectId}', '${item.id}')">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn btn-sm btn-primary" onclick="window.moveToNextStage('${projectId}', '${item.id}')">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * Get total items count
 */
function getTotalItems() {
  return stagesState.projects.reduce((sum, project) => {
    const itemsInStage = project.items.filter(item => item.stage === stagesState.currentStage.id);
    return sum + itemsInStage.length;
  }, 0);
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind stage events
 */
function bindStageEvents() {
  // Search
  const searchInput = $('stageSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleStageSearch, 300));
  }
  
  // Technician filter
  const techFilter = $('stageTechnicianFilter');
  if (techFilter) {
    techFilter.addEventListener('change', handleTechnicianFilter);
  }
  
  // Status filter
  const statusFilter = $('stageStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', handleStatusFilter);
  }
  
  // Refresh button
  const refreshBtn = $('stageRefreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleStageRefresh);
  }
}

/**
 * Handle search
 */
function handleStageSearch(e) {
  stagesState.filters.search = e.target.value.toLowerCase();
  applyStageFilters();
}

/**
 * Handle technician filter
 */
function handleTechnicianFilter(e) {
  stagesState.filters.technician = e.target.value;
  applyStageFilters();
}

/**
 * Handle status filter
 */
function handleStatusFilter(e) {
  stagesState.filters.status = e.target.value;
  applyStageFilters();
}

/**
 * Handle refresh
 */
async function handleStageRefresh() {
  try {
    showLoading('جاري التحديث...');
    await loadStageData(stagesState.currentStage.id);
    renderStagePage();
    bindStageEvents();
    hideLoading();
    showToast('تم التحديث بنجاح', 'success');
  } catch (error) {
    console.error('❌ Error refreshing stage:', error);
    hideLoading();
    showToast('حدث خطأ أثناء التحديث', 'error');
  }
}

/**
 * Apply filters
 */
function applyStageFilters() {
  let filtered = [...stagesState.projects];
  const stage = stagesState.currentStage;
  
  // Search filter
  if (stagesState.filters.search) {
    const search = stagesState.filters.search;
    filtered = filtered.filter(project => {
      const itemsInStage = project.items.filter(item => item.stage === stage.id);
      return (
        project.clientCode.toLowerCase().includes(search) ||
        project.clientName.toLowerCase().includes(search) ||
        project.projectName.toLowerCase().includes(search) ||
        itemsInStage.some(item => 
          item.name.toLowerCase().includes(search) ||
          item.code.toLowerCase().includes(search)
        )
      );
    });
  }
  
  // Technician filter
  if (stagesState.filters.technician !== 'all') {
    filtered = filtered.filter(project => {
      const itemsInStage = project.items.filter(item => item.stage === stage.id);
      return itemsInStage.some(item => item.technician === stagesState.filters.technician);
    });
  }
  
  // Status filter
  if (stagesState.filters.status !== 'all') {
    filtered = filtered.filter(project => {
      const itemsInStage = project.items.filter(item => item.stage === stage.id);
      return itemsInStage.some(item => item.status === stagesState.filters.status);
    });
  }
  
  stagesState.filteredProjects = filtered;
  
  // Update projects list
  const projectsList = $('stageProjectsList');
  if (projectsList) {
    projectsList.innerHTML = renderProjectsList();
  }
}

// ═══════════════════════════════════════
// 🎯 Global Functions (for onclick handlers)
// ═══════════════════════════════════════

/**
 * View item details
 */
window.viewItemDetails = function(projectId, itemId) {
  showToast('عرض تفاصيل البند (قيد التطوير)', 'info');
  // TODO: Open modal with item details
};

/**
 * Mark item as complete
 */
window.markItemComplete = async function(projectId, itemId) {
  if (!confirm('هل أنت متأكد من تحديد هذا البند كمكتمل؟')) return;
  
  try {
    showLoading('جاري التحديث...');
    
    await api.updateItemStage(projectId, itemId, stagesState.currentStage.id);
    
    // Reload data
    await loadStageData(stagesState.currentStage.id);
    renderStagePage();
    bindStageEvents();
    
    hideLoading();
    showToast('تم تحديث الحالة بنجاح ✅', 'success');
  } catch (error) {
    console.error('❌ Error marking item complete:', error);
    hideLoading();
    showToast('حدث خطأ أثناء التحديث', 'error');
  }
};

/**
 * Move item to next stage
 */
window.moveToNextStage = async function(projectId, itemId) {
  const currentStageIndex = STAGES.findIndex(s => s.id === stagesState.currentStage.id);
  
  if (currentStageIndex === STAGES.length - 1) {
    showToast('هذا البند في المرحلة الأخيرة', 'warning');
    return;
  }
  
  const nextStage = STAGES[currentStageIndex + 1];
  
  if (!confirm(`هل تريد نقل هذا البند إلى مرحلة ${nextStage.name}؟`)) return;
  
  try {
    showLoading('جاري النقل...');
    
    await api.updateItemStage(projectId, itemId, nextStage.id);
    
    // Reload data
    await loadStageData(stagesState.currentStage.id);
    renderStagePage();
    bindStageEvents();
    
    hideLoading();
    showToast(`تم نقل البند إلى مرحلة ${nextStage.name} ✅`, 'success');
  } catch (error) {
    console.error('❌ Error moving item:', error);
    hideLoading();
    showToast('حدث خطأ أثناء النقل', 'error');
  }
};

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * Get current stage
 */
export function getCurrentStage() {
  return stagesState.currentStage;
}

/**
 * Get stage projects
 */
export function getStageProjects() {
  return stagesState.projects;
}

/**
 * Refresh current stage
 */
export async function refreshCurrentStage() {
  if (stagesState.currentStage) {
    await handleStageRefresh();
  }
}

// ═══════════════════════════════════════
// 🎯 Register Page Callbacks
// ═══════════════════════════════════════

STAGES.forEach(stage => {
  registerPageCallback(`initStage_${stage.id}`, () => initStagePage(stage.id));
});

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  initStagePage,
  getCurrentStage,
  getStageProjects,
  refreshCurrentStage,
};
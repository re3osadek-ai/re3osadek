/* ========================================
   📊 REAOSADEK - Kanban Board Module
   ======================================== */

import { STAGES, STAGE_IDS } from '../config.js';
import {
  $, qs, qsa, showToast, showLoading, hideLoading,
  debounce, createElement, removeElement
} from '../utils/helpers.js';
import { formatStage, formatStageProgress, formatRelativeTime } from '../utils/formatters.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let kanbanData = {
  projects: [],
  clients: [],
  filteredProjects: [],
};

let kanbanFilters = {
  search: '',
  stage: 'all',
  status: 'all',
  priority: 'all',
};

let draggedCard = null;
let draggedProjectId = null;

// ═══════════════════════════════════════
// 🚀 Initialization
// ═══════════════════════════════════════

/**
 * Initialize Kanban board
 */
export async function initKanban() {
  console.log('📊 Initializing Kanban board...');
  
  try {
    showLoading('جاري تحميل البيانات...');
    
    // Load data from API
    await loadKanbanData();
    
    // Render board
    renderKanbanBoard();
    
    // Bind events
    bindKanbanEvents();
    
    // Update statistics
    updateKanbanStats();
    
    hideLoading();
    console.log('✅ Kanban board initialized');
  } catch (error) {
    console.error('❌ Error initializing Kanban:', error);
    hideLoading();
    showToast('حدث خطأ أثناء تحميل البيانات', 'error');
  }
}

/**
 * Load Kanban data from API
 */
async function loadKanbanData() {
  const [projects, clients] = await Promise.all([
    api.getProjects(),
    api.getClients(),
  ]);
  
  kanbanData.projects = projects;
  kanbanData.clients = clients;
  kanbanData.filteredProjects = [...projects];
}

// ═══════════════════════════════════════
// 🎨 Rendering
// ═══════════════════════════════════════

/**
 * Render entire Kanban board
 */
function renderKanbanBoard() {
  STAGES.forEach(stage => {
    renderStageColumn(stage.id);
  });
}

/**
 * Render a single stage column
 */
function renderStageColumn(stageId) {
  const columnBody = qs(`[data-drop-zone="${stageId}"]`);
  if (!columnBody) return;
  
  // Clear existing cards
  columnBody.innerHTML = '';
  
  // Get projects for this stage
  const stageProjects = kanbanData.filteredProjects.filter(
    p => p.currentStage === stageId
  );
  
  // Update column count
  const countElement = qs(`[data-count="${stageId}"]`);
  if (countElement) {
    countElement.textContent = stageProjects.length;
  }
  
  // Render cards
  if (stageProjects.length === 0) {
    columnBody.innerHTML = `
      <div class="kanban-empty">
        <div class="kanban-empty-icon">📭</div>
        <div class="kanban-empty-text">لا توجد بطاقات</div>
        <div class="kanban-empty-hint">اسحب البطاقات هنا</div>
      </div>
    `;
  } else {
    stageProjects.forEach(project => {
      const card = createKanbanCard(project);
      columnBody.appendChild(card);
    });
  }
}

/**
 * Create a Kanban card element
 */
function createKanbanCard(project) {
  const client = kanbanData.clients.find(c => c.code === project.clientCode);
  const stage = STAGES.find(s => s.id === project.currentStage);
  const progress = formatStageProgress(project.currentStage);
  
  const card = createElement('div', {
    className: 'kanban-card',
    dataset: {
      projectId: project.id,
      stage: project.currentStage,
    },
    draggable: 'true',
  });
  
  // Priority indicator
  const priorityClass = getPriorityClass(project);
  if (priorityClass) {
    const priorityIndicator = createElement('div', {
      className: `kanban-card-priority ${priorityClass}`,
    });
    card.appendChild(priorityIndicator);
  }
  
  // Card header
  const header = createElement('div', { className: 'kanban-card-header' }, [
    createElement('div', { className: 'kanban-card-client' }, [
      createElement('span', { className: 'kanban-card-client-code' }, [project.clientCode]),
      createElement('span', { className: 'kanban-card-client-name' }, [client?.name || 'Unknown']),
    ]),
    createElement('button', {
      className: 'kanban-card-menu',
      onclick: () => showCardMenu(project.id),
    }, ['⋮']),
  ]);
  
  // Card body
  const body = createElement('div', { className: 'kanban-card-body' }, [
    createElement('div', { className: 'kanban-card-project' }, [project.projectName]),
    createElement('div', { className: 'kanban-card-item' }, [
      createElement('span', { className: 'kanban-card-item-icon' }, ['📦']),
      createElement('span', [`${project.items.length} ${project.items.length === 1 ? 'بند' : 'بنود'}`]),
    ]),
  ]);
  
  // Progress bar
  const progressBar = createElement('div', { className: 'kanban-card-progress' }, [
    createElement('div', { className: 'kanban-card-progress-header' }, [
      createElement('span', { className: 'kanban-card-progress-label' }, ['التقدم']),
      createElement('span', { className: 'kanban-card-progress-value' }, [progress.text]),
    ]),
    createElement('div', { className: 'kanban-card-progress-bar' }, [
      createElement('div', {
        className: 'kanban-card-progress-fill',
        style: { width: `${progress.current / progress.total * 100}%` },
      }),
    ]),
  ]);
  body.appendChild(progressBar);
  
  // Card footer
  const footer = createElement('div', { className: 'kanban-card-footer' }, [
    createElement('div', { className: 'kanban-card-meta' }, [
      createElement('span', { className: 'kanban-card-date' }, [
        `📅 ${formatRelativeTime(project.updatedAt)}`
      ]),
    ]),
  ]);
  
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);
  
  return card;
}

/**
 * Get priority class for project
 */
function getPriorityClass(project) {
  // For now, return null (no priority indicator)
  // Can be enhanced later based on project data
  return null;
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind all Kanban events
 */
function bindKanbanEvents() {
  // Search
  const searchInput = $('kanbanSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // Filter buttons
  qsa('.kanban-filter').forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });
  
  // View toggle
  qsa('.kanban-view-btn').forEach(btn => {
    btn.addEventListener('click', handleViewToggle);
  });
  
  // Refresh button
  const refreshBtn = $('kanbanRefreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }
  
  // Add card buttons
  qsa('.kanban-add-card-btn').forEach(btn => {
    btn.addEventListener('click', handleAddCard);
  });
  
  // Drag and drop
  bindDragAndDrop();
}

/**
 * Handle search input
 */
function handleSearch(e) {
  kanbanFilters.search = e.target.value.toLowerCase();
  applyFilters();
}

/**
 * Handle filter button click
 */
function handleFilterClick(e) {
  const btn = e.currentTarget;
  const filter = btn.textContent.trim().toLowerCase();
  
  // Update active state
  qsa('.kanban-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Apply filter
  if (filter === 'all') {
    kanbanFilters.status = 'all';
  } else if (filter === 'urgent') {
    kanbanFilters.status = 'urgent';
  } else if (filter === 'overdue') {
    kanbanFilters.status = 'overdue';
  }
  
  applyFilters();
}

/**
 * Handle view toggle
 */
function handleViewToggle(e) {
  const btn = e.currentTarget;
  const board = $('kanbanBoard');
  
  // Update active state
  qsa('.kanban-view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Toggle view
  if (btn.title === 'List View') {
    board?.classList.add('list-view');
  } else {
    board?.classList.remove('list-view');
  }
}

/**
 * Handle refresh
 */
async function handleRefresh() {
  try {
    showLoading('جاري التحديث...');
    await loadKanbanData();
    renderKanbanBoard();
    updateKanbanStats();
    hideLoading();
    showToast('تم التحديث بنجاح', 'success');
  } catch (error) {
    console.error('❌ Error refreshing Kanban:', error);
    hideLoading();
    showToast('حدث خطأ أثناء التحديث', 'error');
  }
}

/**
 * Handle add card
 */
function handleAddCard(e) {
  const stageId = e.currentTarget.dataset.addStage;
  showToast(`إضافة بطاقة جديدة في مرحلة ${formatStage(stageId)}`, 'info');
  // TODO: Open modal to add new card
}

/**
 * Show card menu
 */
function showCardMenu(projectId) {
  showToast('قائمة البطاقة (قيد التطوير)', 'info');
  // TODO: Show dropdown menu with options
}

// ═══════════════════════════════════════
// 🔄 Drag and Drop
// ═══════════════════════════════════════

/**
 * Bind drag and drop events
 */
function bindDragAndDrop() {
  // Drag start
  document.addEventListener('dragstart', handleDragStart);
  
  // Drag over
  document.addEventListener('dragover', handleDragOver);
  
  // Drag enter
  document.addEventListener('dragenter', handleDragEnter);
  
  // Drag leave
  document.addEventListener('dragleave', handleDragLeave);
  
  // Drop
  document.addEventListener('drop', handleDrop);
  
  // Drag end
  document.addEventListener('dragend', handleDragEnd);
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
  const card = e.target.closest('.kanban-card');
  if (!card) return;
  
  draggedCard = card;
  draggedProjectId = card.dataset.projectId;
  
  card.classList.add('dragging');
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedProjectId);
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drag enter
 */
function handleDragEnter(e) {
  const dropZone = e.target.closest('[data-drop-zone]');
  if (!dropZone) return;
  
  const column = dropZone.closest('.kanban-column');
  column?.classList.add('drag-over');
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
  const dropZone = e.target.closest('[data-drop-zone]');
  if (!dropZone) return;
  
  // Check if we're actually leaving the drop zone
  const rect = dropZone.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    const column = dropZone.closest('.kanban-column');
    column?.classList.remove('drag-over');
  }
}

/**
 * Handle drop
 */
async function handleDrop(e) {
  e.preventDefault();
  
  const dropZone = e.target.closest('[data-drop-zone]');
  if (!dropZone) return;
  
  const column = dropZone.closest('.kanban-column');
  column?.classList.remove('drag-over');
  
  const newStage = dropZone.dataset.dropZone;
  const projectId = e.dataTransfer.getData('text/plain');
  
  if (!projectId || !newStage) return;
  
  // Find project
  const project = kanbanData.projects.find(p => p.id === projectId);
  if (!project) return;
  
  // Check if stage changed
  if (project.currentStage === newStage) return;
  
  try {
    // Update project stage via API
    await api.updateProjectStage(projectId, newStage);
    
    // Update local data
    project.currentStage = newStage;
    project.updatedAt = new Date().toISOString();
    
    // Re-render affected columns
    renderStageColumn(project.currentStage);
    renderStageColumn(newStage);
    
    // Update stats
    updateKanbanStats();
    
    showToast(`تم نقل المشروع إلى مرحلة ${formatStage(newStage)}`, 'success');
  } catch (error) {
    console.error('❌ Error moving project:', error);
    showToast('حدث خطأ أثناء نقل المشروع', 'error');
  }
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
  }
  
  // Remove drag-over from all columns
  qsa('.kanban-column').forEach(col => {
    col.classList.remove('drag-over');
  });
  
  draggedCard = null;
  draggedProjectId = null;
}

// ═══════════════════════════════════════
// 🔍 Filtering
// ═══════════════════════════════════════

/**
 * Apply all filters
 */
function applyFilters() {
  let filtered = [...kanbanData.projects];
  
  // Search filter
  if (kanbanFilters.search) {
    const search = kanbanFilters.search;
    filtered = filtered.filter(project => {
      const client = kanbanData.clients.find(c => c.code === project.clientCode);
      return (
        project.clientCode.toLowerCase().includes(search) ||
        project.projectName.toLowerCase().includes(search) ||
        client?.name.toLowerCase().includes(search)
      );
    });
  }
  
  // Status filter
  if (kanbanFilters.status === 'urgent') {
    // TODO: Implement urgent filter logic
    filtered = filtered.filter(p => p.overallStatus === 'in-progress');
  } else if (kanbanFilters.status === 'overdue') {
    // TODO: Implement overdue filter logic
    filtered = filtered.filter(p => {
      const days = Math.ceil((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days > 30;
    });
  }
  
  kanbanData.filteredProjects = filtered;
  
  // Re-render all columns
  renderKanbanBoard();
  updateKanbanStats();
}

// ═══════════════════════════════════════
// 📊 Statistics
// ═══════════════════════════════════════

/**
 * Update Kanban statistics
 */
function updateKanbanStats() {
  const total = kanbanData.filteredProjects.length;
  const inProgress = kanbanData.filteredProjects.filter(
    p => p.overallStatus === 'in-progress'
  ).length;
  const completed = kanbanData.filteredProjects.filter(
    p => p.overallStatus === 'completed'
  ).length;
  
  const totalElement = $('kanbanTotal');
  const inProgressElement = $('kanbanInProgress');
  const completedElement = $('kanbanCompleted');
  
  if (totalElement) totalElement.textContent = total;
  if (inProgressElement) inProgressElement.textContent = inProgress;
  if (completedElement) completedElement.textContent = completed;
}

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * Get project by ID
 */
export function getProjectById(projectId) {
  return kanbanData.projects.find(p => p.id === projectId);
}

/**
 * Refresh Kanban data
 */
export async function refreshKanban() {
  await handleRefresh();
}

/**
 * Update single project
 */
export async function updateProject(projectId, updates) {
  try {
    const updated = await api.updateProjectStage(projectId, updates.currentStage);
    
    // Update local data
    const index = kanbanData.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      kanbanData.projects[index] = { ...kanbanData.projects[index], ...updates };
    }
    
    // Re-render affected columns
    renderStageColumn(updates.currentStage);
    updateKanbanStats();
    
    return updated;
  } catch (error) {
    console.error('❌ Error updating project:', error);
    throw error;
  }
}

// ═══════════════════════════════════════
// 🎯 Register Page Callback
// ═══════════════════════════════════════

registerPageCallback('initKanban', initKanban);

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  initKanban,
  getProjectById,
  refreshKanban,
  updateProject,
};
/* ========================================
   📊 REAOSADEK - Reports Module
   ======================================== */

import { STAGES } from '../config.js';
import {
  $, qs, qsa, showToast, showLoading, hideLoading,
  createElement, debounce, downloadFile
} from '../utils/helpers.js';
import {
  formatDateAr, formatStage, formatDuration,
  formatStatus, formatRelativeTime
} from '../utils/formatters.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let reportsState = {
  activeTab: 'production',
  data: {
    production: [],
    stagesDashboard: [],
    stageDurations: [],
    readyProjects: [],
  },
  filters: {
    dateFrom: null,
    dateTo: null,
    stages: ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc'],
    status: 'all',
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  },
};

// ═══════════════════════════════════════
// 🚀 Initialization
// ═══════════════════════════════════════

/**
 * Initialize Reports module
 */
export async function initReports() {
  console.log('📊 Initializing Reports module...');
  
  try {
    // Bind events
    bindReportsEvents();
    
    // Load initial data
    await loadReportData(reportsState.activeTab);
    
    console.log('✅ Reports module initialized');
  } catch (error) {
    console.error('❌ Error initializing Reports:', error);
    showToast('حدث خطأ أثناء تحميل التقارير', 'error');
  }
}

// ═══════════════════════════════════════
// 📥 Data Loading
// ═══════════════════════════════════════

/**
 * Load report data based on active tab
 */
async function loadReportData(tab) {
  try {
    showLoading('جاري تحميل البيانات...');
    
    let data;
    
    switch (tab) {
      case 'production':
        data = await api.getProductionReport(reportsState.filters);
        reportsState.data.production = data;
        renderProductionReport(data);
        break;
        
      case 'stages':
        data = await api.getStagesDashboard();
        reportsState.data.stagesDashboard = data;
        renderStagesDashboard(data);
        break;
        
      case 'durations':
        data = await api.getStageDurations();
        reportsState.data.stageDurations = data;
        renderStageDurations(data);
        break;
        
      case 'ready':
        data = await api.getReadyProjects();
        reportsState.data.readyProjects = data;
        renderReadyProjects(data);
        break;
    }
    
    hideLoading();
  } catch (error) {
    console.error('❌ Error loading report data:', error);
    hideLoading();
    showToast('حدث خطأ أثناء تحميل البيانات', 'error');
  }
}

// ═══════════════════════════════════════
// 🎨 Rendering
// ═══════════════════════════════════════

/**
 * Render Production Report
 */
function renderProductionReport(data) {
  const tbody = $('reportsTableBody');
  if (!tbody) return;
  
  // Apply filters
  let filtered = applyFilters(data);
  
  // Update pagination
  reportsState.pagination.totalItems = filtered.length;
  
  // Paginate
  const paginatedData = paginateData(filtered);
  
  if (paginatedData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center p-lg text-muted">
          <div class="empty-state-icon">📭</div>
          <div>لا توجد بيانات متاحة</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = paginatedData.map(row => `
    <tr>
      <td><strong>${row.clientCode}</strong> - ${row.clientName}</td>
      <td>${row.projectName}</td>
      <td>${row.itemName}</td>
      <td><span class="badge badge-${row.stage}">${formatStage(row.stage)}</span></td>
      <td>${row.technician || '—'}</td>
      <td><span class="report-status ${row.status}">
        <span class="report-status-dot"></span>
        ${formatStatus(row.status)}
      </span></td>
      <td><span class="report-duration">${formatDuration(row.duration)}</span></td>
    </tr>
  `).join('');
  
  // Update pagination info
  updatePaginationInfo();
}

/**
 * Render Stages Dashboard
 */
function renderStagesDashboard(data) {
  const page = qs('[data-page-content="stages-dashboard"]');
  if (!page) return;
  
  const tbody = page.querySelector('tbody');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center p-lg text-muted">
          لا توجد بيانات
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.clientCode}</strong></td>
      <td>${row.clientName}</td>
      <td>${row.projectName}</td>
      <td><span class="badge badge-${row.lastStage}">${formatStage(row.lastStage)}</span></td>
      <td><span class="report-status ${row.stageStatus}">
        <span class="report-status-dot"></span>
        ${formatStatus(row.stageStatus)}
      </span></td>
      <td><span class="report-status ${row.overallStatus}">
        <span class="report-status-dot"></span>
        ${formatStatus(row.overallStatus)}
      </span></td>
      <td>${formatRelativeTime(row.updateDate)}</td>
    </tr>
  `).join('');
}

/**
 * Render Stage Durations
 */
function renderStageDurations(data) {
  const page = qs('[data-page-content="stage-durations"]');
  if (!page) return;
  
  const tbody = page.querySelector('tbody');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center p-lg text-muted">
          لا توجد بيانات
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.clientCode}</strong></td>
      <td>${row.clientName}</td>
      <td>${row.projectName}</td>
      <td><span class="badge badge-${row.stage}">${formatStage(row.stage)}</span></td>
      <td>${row.itemName}</td>
      <td>${row.technician || '—'}</td>
      <td><span class="report-status ${row.status}">
        <span class="report-status-dot"></span>
        ${formatStatus(row.status)}
      </span></td>
      <td><span class="report-duration">${formatDuration(row.duration)}</span></td>
      <td>${row.startDate ? formatDateAr(row.startDate) : '—'}</td>
      <td>${row.endDate ? formatDateAr(row.endDate) : '—'}</td>
    </tr>
  `).join('');
}

/**
 * Render Ready Projects
 */
function renderReadyProjects(data) {
  const page = qs('[data-page-content="ready-projects"]');
  if (!page) return;
  
  const tbody = page.querySelector('tbody');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center p-lg text-muted">
          لا توجد مشاريع جاهزة
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = data.map(row => `
    <tr>
      <td><strong>${row.clientCode}</strong></td>
      <td>${row.clientName}</td>
      <td>${row.projectName}</td>
      <td>${formatDateAr(row.completionDate)}</td>
      <td><span class="status-dot ${row.storage === 'stored' ? 'success' : 'pending'}">
        ${row.storage === 'stored' ? '✅ مخزن' : '⏳ قيد التخزين'}
      </span></td>
      <td><span class="status-dot ${row.supply === 'ready' ? 'success' : 'pending'}">
        ${row.supply === 'ready' ? '✅ جاهز' : '⏳ قيد التحضير'}
      </span></td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="viewProjectDetails('${row.clientCode}')">
          <i class="fas fa-eye"></i> عرض
        </button>
      </td>
    </tr>
  `).join('');
}


// ═══════════════════════════════════════
// 🔍 Filters
// ═══════════════════════════════════════

/**
 * Apply filters to data
 */
function applyFilters(data) {
  let filtered = [...data];
  
  // Stage filter
  if (reportsState.filters.stages.length < STAGES.length) {
    filtered = filtered.filter(row => 
      reportsState.filters.stages.includes(row.stage)
    );
  }
  
  // Status filter
  if (reportsState.filters.status !== 'all') {
    filtered = filtered.filter(row => row.status === reportsState.filters.status);
  }
  
  // Date filter
  if (reportsState.filters.dateFrom) {
    const fromDate = new Date(reportsState.filters.dateFrom);
    filtered = filtered.filter(row => {
      if (!row.startDate) return false;
      return new Date(row.startDate) >= fromDate;
    });
  }
  
  if (reportsState.filters.dateTo) {
    const toDate = new Date(reportsState.filters.dateTo);
    filtered = filtered.filter(row => {
      if (!row.startDate) return false;
      return new Date(row.startDate) <= toDate;
    });
  }
  
  return filtered;
}

// ═══════════════════════════════════════
// 📄 Pagination
// ═══════════════════════════════════════

/**
 * Paginate data
 */
function paginateData(data) {
  const { currentPage, pageSize } = reportsState.pagination;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * Update pagination info
 */
function updatePaginationInfo() {
  const { currentPage, pageSize, totalItems } = reportsState.pagination;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  
  const pageInfo = qs('.pagination-info');
  if (pageInfo) {
    pageInfo.textContent = `عرض ${start}-${end} من ${totalItems} نتيجة`;
  }
}

/**
 * Go to page
 */
function goToPage(page) {
  reportsState.pagination.currentPage = page;
  loadReportData(reportsState.activeTab);
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind all reports events
 */
function bindReportsEvents() {
  // Tabs
  qsa('.reports-tab').forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });
  
  // Stage checkboxes
  qsa('.reports-stage-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleStageFilterChange);
  });
  
  // Status radio buttons
  qsa('.reports-status-radio').forEach(radio => {
    radio.addEventListener('change', handleStatusFilterChange);
  });
  
  // Date inputs
  const dateInputs = qsa('.reports-filter-input[type="date"]');
  dateInputs.forEach((input, index) => {
    input.addEventListener('change', (e) => {
      if (index === 0) {
        reportsState.filters.dateFrom = e.target.value;
      } else {
        reportsState.filters.dateTo = e.target.value;
      }
    });
  });
  
  // Apply filters button
  const applyBtn = qs('.reports-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', handleApplyFilters);
  }
  
  // Reset filters button
  const resetBtn = qs('.reports-sidebar-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetFilters);
  }
  
  // Export buttons
  qsa('.export-option').forEach(btn => {
    btn.addEventListener('click', handleExportOptionClick);
  });
  
  // Export all button
  const exportAllBtn = qs('.export-actions .btn-primary');
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', handleExportAll);
  }
  
  // Import button
  const importBtn = qs('.export-actions .btn-outline-primary');
  if (importBtn) {
    importBtn.addEventListener('click', handleImport);
  }
  
  // Download template button
  const templateBtn = qs('.export-actions .btn-ghost');
  if (templateBtn) {
    templateBtn.addEventListener('click', handleDownloadTemplate);
  }
}

/**
 * Handle tab click
 */
async function handleTabClick(e) {
  const tab = e.currentTarget;
  const reportType = tab.dataset.report;
  
  // Update active tab
  qsa('.reports-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  
  reportsState.activeTab = reportType;
  reportsState.pagination.currentPage = 1;
  
  await loadReportData(reportType);
}

/**
 * Handle stage filter change
 */
function handleStageFilterChange(e) {
  const stageId = e.target.closest('.reports-stage-item')
    .querySelector('.reports-stage-label span:last-child')
    .textContent.trim().toLowerCase();
  
  const stage = STAGES.find(s => s.name.toLowerCase() === stageId || s.id === stageId);
  if (!stage) return;
  
  if (e.target.checked) {
    if (!reportsState.filters.stages.includes(stage.id)) {
      reportsState.filters.stages.push(stage.id);
    }
  } else {
    reportsState.filters.stages = reportsState.filters.stages.filter(s => s !== stage.id);
  }
}

/**
 * Handle status filter change
 */
function handleStatusFilterChange(e) {
  const label = e.target.closest('.reports-status-item')
    .querySelector('.reports-status-label').textContent.trim();
  
  const statusMap = {
    'الكل': 'all',
    'مكتمل': 'completed',
    'قيد التنفيذ': 'in-progress',
    'متأخر': 'delayed',
  };
  
  reportsState.filters.status = statusMap[label] || 'all';
}

/**
 * Handle apply filters
 */
async function handleApplyFilters() {
  reportsState.pagination.currentPage = 1;
  await loadReportData(reportsState.activeTab);
  showToast('تم تطبيق الفلاتر', 'success');
}

/**
 * Handle reset filters
 */
async function handleResetFilters() {
  reportsState.filters = {
    dateFrom: null,
    dateTo: null,
    stages: STAGES.map(s => s.id),
    status: 'all',
  };
  
  // Reset UI
  qsa('.reports-stage-checkbox').forEach(cb => cb.checked = true);
  qsa('.reports-status-radio').forEach((radio, index) => {
    radio.checked = index === 0;
  });
  qsa('.reports-filter-input[type="date"]').forEach(input => input.value = '');
  
  reportsState.pagination.currentPage = 1;
  await loadReportData(reportsState.activeTab);
  showToast('تم إعادة تعيين الفلاتر', 'info');
}

// ═══════════════════════════════════════
// 📤 Export/Import
// ═══════════════════════════════════════

let selectedExportFormat = 'excel';

/**
 * Handle export option click
 */
function handleExportOptionClick(e) {
  const btn = e.currentTarget;
  const format = btn.querySelector('span').textContent.toLowerCase();
  
  const formatMap = {
    'excel': 'excel',
    'pdf': 'pdf',
    'csv': 'csv',
    'طباعة': 'print',
  };
  
  selectedExportFormat = formatMap[format] || 'excel';
  
  qsa('.export-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  if (selectedExportFormat === 'print') {
    window.print();
  }
}

/**
 * Handle export all
 */
async function handleExportAll() {
  try {
    showLoading('جاري التصدير...');
    
    const data = reportsState.data[reportsState.activeTab];
    if (!data || data.length === 0) {
      hideLoading();
      showToast('لا توجد بيانات للتصدير', 'warning');
      return;
    }
    
    if (selectedExportFormat === 'excel') {
      await exportToExcel(data);
    } else if (selectedExportFormat === 'csv') {
      await exportToCSV(data);
    } else if (selectedExportFormat === 'pdf') {
      showToast('تصدير PDF قيد التطوير', 'info');
    }
    
    hideLoading();
    showToast('تم التصدير بنجاح', 'success');
  } catch (error) {
    console.error('❌ Error exporting:', error);
    hideLoading();
    showToast('حدث خطأ أثناء التصدير', 'error');
  }
}

/**
 * Export to Excel (CSV format for simplicity)
 */
async function exportToExcel(data) {
  const csv = convertToCSV(data);
  const filename = `report_${reportsState.activeTab}_${Date.now()}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export to CSV
 */
async function exportToCSV(data) {
  const csv = convertToCSV(data);
  const filename = `report_${reportsState.activeTab}_${Date.now()}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Convert data to CSV
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Handle import
 */
function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.xlsx,.xls';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      showLoading('جاري الاستيراد...');
      
      const text = await file.text();
      const data = parseCSV(text);
      
      const result = await api.importProjects(data);
      
      hideLoading();
      
      if (result.errors.length > 0) {
        showToast(`تم استيراد ${result.imported} صف مع ${result.errors.length} خطأ`, 'warning');
      } else {
        showToast(`تم استيراد ${result.imported} صف بنجاح`, 'success');
      }
      
      // Reload data
      await loadReportData(reportsState.activeTab);
    } catch (error) {
      console.error('❌ Error importing:', error);
      hideLoading();
      showToast('حدث خطأ أثناء الاستيراد', 'error');
    }
  };
  
  input.click();
}

/**
 * Parse CSV text to data
 */
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

/**
 * Handle download template
 */
function handleDownloadTemplate() {
  const template = [
    'Client Code,Client Name,Project Name,Item Code,Item Name,Width,Depth,Height,Quantity,Stage',
    'C001,أحمد محمد,فيلا الرياض,I001,خزانة غرفة النوم,200,60,240,1,cutting',
    'C001,أحمد محمد,فيلا الرياض,I002,سرير,180,200,120,1,cutting',
    'C002,سارة علي,مطبخ حديث,I003,دولاب مطبخ,300,60,220,1,edge',
  ].join('\n');
  
  downloadFile(template, 'import_template.csv', 'text/csv;charset=utf-8;');
  showToast('تم تحميل الملف النموذجي', 'success');
}

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * View project details
 */
window.viewProjectDetails = function(clientCode) {
  showToast(`عرض تفاصيل مشروع العميل ${clientCode}`, 'info');
  // TODO: Open modal with project details
};

/**
 * Get current report data
 */
export function getCurrentReportData() {
  return reportsState.data[reportsState.activeTab];
}

/**
 * Get active tab
 */
export function getActiveReportTab() {
  return reportsState.activeTab;
}

/**
 * Refresh current report
 */
export async function refreshReport() {
  await loadReportData(reportsState.activeTab);
}

// ═══════════════════════════════════════
// 🎯 Register Page Callbacks
// ═══════════════════════════════════════

registerPageCallback('initReports', initReports);
registerPageCallback('initStagesDashboard', async () => {
  await loadReportData('stages');
});
registerPageCallback('initStageDurations', async () => {
  await loadReportData('durations');
});
registerPageCallback('initReadyProjects', async () => {
  await loadReportData('ready');
});

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  initReports,
  getCurrentReportData,
  getActiveReportTab,
  refreshReport,
};
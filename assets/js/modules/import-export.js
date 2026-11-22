/* ========================================
   📤 REAOSADEK - Import/Export Module
   ======================================== */

import { STAGES, EXPORT_FORMATS } from '../config.js';
import {
  $, qs, qsa, showToast, showLoading, hideLoading,
  downloadFile, readFileAsText, formatFileSize
} from '../utils/helpers.js';
import { formatDateAr, formatStage, formatStatus } from '../utils/formatters.js';
import { validateImportData } from '../utils/validators.js';
import { api } from './api.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let importExportState = {
  currentFormat: 'excel',
  importData: null,
  importErrors: [],
  previewData: [],
};

// ═══════════════════════════════════════
// 📤 Export Functions
// ═══════════════════════════════════════

/**
 * Export data to specified format
 */
export async function exportData(type = 'all', format = 'excel') {
  try {
    showLoading('جاري التصدير...');
    
    // Get data from API
    const data = await api.exportData(type);
    
    // Export based on format
    switch (format) {
      case 'excel':
      case 'xlsx':
        await exportToExcel(data, type);
        break;
        
      case 'csv':
        await exportToCSV(data, type);
        break;
        
      case 'json':
        await exportToJSON(data, type);
        break;
        
      case 'pdf':
        await exportToPDF(data, type);
        break;
        
      default:
        throw new Error(`Format "${format}" not supported`);
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
 * Export to Excel (CSV with BOM for Arabic support)
 */
async function exportToExcel(data, type) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `reaosadek_${type}_${timestamp}.csv`;
  
  let csv = '';
  
  // Add BOM for UTF-8 (Arabic support in Excel)
  csv += '\uFEFF';
  
  // Export clients
  if (data.clients && data.clients.length > 0) {
    csv += '\n=== العملاء ===\n';
    csv += convertToCSV(data.clients);
  }
  
  // Export projects
  if (data.projects && data.projects.length > 0) {
    csv += '\n\n=== المشاريع ===\n';
    const projectsFlat = flattenProjects(data.projects);
    csv += convertToCSV(projectsFlat);
  }
  
  // Export shortages
  if (data.shortages && data.shortages.length > 0) {
    csv += '\n\n=== النواقص ===\n';
    csv += convertToCSV(data.shortages);
  }
  
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export to CSV
 */
async function exportToCSV(data, type) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `reaosadek_${type}_${timestamp}.csv`;
  
  let csv = '\uFEFF'; // BOM for UTF-8
  
  if (type === 'all' || type === 'clients') {
    if (data.clients) {
      csv += convertToCSV(data.clients);
    }
  }
  
  if (type === 'all' || type === 'projects') {
    if (data.projects) {
      csv += '\n\n';
      const projectsFlat = flattenProjects(data.projects);
      csv += convertToCSV(projectsFlat);
    }
  }
  
  if (type === 'all' || type === 'shortages') {
    if (data.shortages) {
      csv += '\n\n';
      csv += convertToCSV(data.shortages);
    }
  }
  
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export to JSON
 */
async function exportToJSON(data, type) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `reaosadek_${type}_${timestamp}.json`;
  
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Export to PDF (placeholder - requires jsPDF library)
 */
async function exportToPDF(data, type) {
  showToast('تصدير PDF يتطلب مكتبة jsPDF - قيد التطوير', 'info');
  
  // Future implementation:
  // const { jsPDF } = window.jspdf;
  // const doc = new jsPDF();
  // ... PDF generation logic
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  
  // Create CSV header
  const csvHeaders = headers.map(header => {
    const headerText = translateHeader(header);
    return escapeCSV(headerText);
  }).join(',');
  
  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (value instanceof Date) {
        value = value.toISOString();
      } else {
        value = String(value);
      }
      
      return escapeCSV(value);
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Escape CSV value
 */
function escapeCSV(value) {
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Translate header names to Arabic
 */
function translateHeader(header) {
  const translations = {
    'code': 'الكود',
    'name': 'الاسم',
    'phone': 'الهاتف',
    'email': 'البريد الإلكتروني',
    'clientCode': 'كود العميل',
    'clientName': 'اسم العميل',
    'projectName': 'اسم المشروع',
    'itemName': 'اسم البند',
    'itemCode': 'كود البند',
    'width': 'العرض',
    'depth': 'العمق',
    'height': 'الارتفاع',
    'quantity': 'الكمية',
    'stage': 'المرحلة',
    'status': 'الحالة',
    'priority': 'الأولوية',
    'description': 'الوصف',
    'technician': 'الفني',
    'createdAt': 'تاريخ الإنشاء',
    'updatedAt': 'تاريخ التحديث',
    'startDate': 'تاريخ البداية',
    'endDate': 'تاريخ النهاية',
    'resolvedAt': 'تاريخ الحل',
  };
  
  return translations[header] || header;
}

/**
 * Flatten projects data (extract items as separate rows)
 */
function flattenProjects(projects) {
  const flat = [];
  
  projects.forEach(project => {
    if (project.items && project.items.length > 0) {
      project.items.forEach(item => {
        flat.push({
          clientCode: project.clientCode,
          projectName: project.projectName,
          itemCode: item.code,
          itemName: item.name,
          width: item.width,
          depth: item.depth,
          height: item.height,
          quantity: item.quantity,
          stage: item.stage,
          technician: item.technician,
          status: item.status,
          startDate: item.startDate,
        });
      });
    } else {
      flat.push({
        clientCode: project.clientCode,
        projectName: project.projectName,
        itemCode: '',
        itemName: '',
        width: '',
        depth: '',
        height: '',
        quantity: '',
        stage: project.currentStage,
        technician: '',
        status: project.overallStatus,
        startDate: project.createdAt,
      });
    }
  });
  
  return flat;
}

// ═══════════════════════════════════════
// 📥 Import Functions
// ═══════════════════════════════════════

/**
 * Import data from file
 */
export async function importFromFile(file) {
  try {
    showLoading('جاري قراءة الملف...');
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let data;
    
    if (fileExtension === 'csv') {
      data = await importFromCSV(file);
    } else if (fileExtension === 'json') {
      data = await importFromJSON(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = await importFromExcel(file);
    } else {
      throw new Error(`File format "${fileExtension}" not supported`);
    }
    
    hideLoading();
    
    return {
      success: true,
      data,
      rowCount: data.length,
    };
  } catch (error) {
    console.error('❌ Error importing:', error);
    hideLoading();
    throw error;
  }
}

/**
 * Import from CSV file
 */
async function importFromCSV(file) {
  const text = await readFileAsText(file);
  
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('الملف فارغ أو لا يحتوي على بيانات كافية');
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length === 0) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

/**
 * Parse CSV line (handle quoted values)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  
  return values;
}

/**
 * Import from JSON file
 */
async function importFromJSON(file) {
  const text = await readFileAsText(file);
  
  try {
    const data = JSON.parse(text);
    
    // Handle different JSON structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.projects) {
      return data.projects;
    } else if (data.clients) {
      return data.clients;
    } else {
      return [data];
    }
  } catch (error) {
    throw new Error('ملف JSON غير صحيح');
  }
}

/**
 * Import from Excel file (requires SheetJS library)
 */
async function importFromExcel(file) {
  // Check if SheetJS is available
  if (typeof XLSX === 'undefined') {
    showToast('استيراد Excel يتطلب مكتبة SheetJS - سيتم تحميل CSV بدلاً من ذلك', 'warning');
    throw new Error('مكتبة SheetJS غير متوفرة');
  }
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  // Get first sheet
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(firstSheet);
  
  return jsonData;
}

/**
 * Preview import data
 */
export function previewImportData(data, maxRows = 10) {
  importExportState.previewData = data.slice(0, maxRows);
  return importExportState.previewData;
}

/**
 * Validate import data
 */
export function validateImport(data) {
  const validation = validateImportData(data);
  importExportState.importErrors = validation.errors;
  return validation;
}

/**
 * Confirm and execute import
 */
export async function confirmImport(data) {
  try {
    showLoading('جاري الاستيراد...');
    
    const result = await api.importProjects(data);
    
    hideLoading();
    
    return {
      success: true,
      imported: result.imported,
      errors: result.errors,
      totalRows: result.totalRows,
    };
  } catch (error) {
    console.error('❌ Error confirming import:', error);
    hideLoading();
    throw error;
  }
}

// ═══════════════════════════════════════
// 📄 Template Functions
// ═══════════════════════════════════════

/**
 * Download import template
 */
export function downloadTemplate() {
  const template = [
    'Client Code,Client Name,Project Name,Item Code,Item Name,Width,Depth,Height,Quantity,Stage',
    'C001,أحمد محمد,فيلا الرياض,I001,خزانة غرفة النوم,200,60,240,1,cutting',
    'C001,أحمد محمد,فيلا الرياض,I002,سرير,180,200,120,1,cutting',
    'C002,سارة علي,مطبخ حديث,I003,دولاب مطبخ,300,60,220,1,edge',
    'C003,محمد حسن,غرفة معيشة,I004,رفوف,150,30,180,2,cnc',
  ].join('\n');
  
  const csv = '\uFEFF' + template; // Add BOM for UTF-8
  downloadFile(csv, 'import_template.csv', 'text/csv;charset=utf-8;');
  
  showToast('تم تحميل الملف النموذجي', 'success');
}

/**
 * Get supported columns
 */
export function getSupportedColumns() {
  return [
    { name: 'Client Code', required: true, description: 'كود العميل' },
    { name: 'Client Name', required: false, description: 'اسم العميل' },
    { name: 'Project Name', required: true, description: 'اسم المشروع' },
    { name: 'Item Code', required: true, description: 'كود البند' },
    { name: 'Item Name', required: true, description: 'اسم البند' },
    { name: 'Width', required: false, description: 'العرض (مم)' },
    { name: 'Depth', required: false, description: 'العمق (مم)' },
    { name: 'Height', required: false, description: 'الارتفاع (مم)' },
    { name: 'Quantity', required: false, description: 'الكمية' },
    { name: 'Stage', required: false, description: 'المرحلة' },
  ];
}

// ═══════════════════════════════════════
// 🎯 Utility Functions
// ═══════════════════════════════════════

/**
 * Get import errors
 */
export function getImportErrors() {
  return importExportState.importErrors;
}

/**
 * Clear import state
 */
export function clearImportState() {
  importExportState.importData = null;
  importExportState.importErrors = [];
  importExportState.previewData = [];
}

/**
 * Format import result message
 */
export function formatImportResult(result) {
  const { imported, errors, totalRows } = result;
  
  if (errors.length === 0) {
    return `تم استيراد ${imported} صف بنجاح ✅`;
  } else {
    return `تم استيراد ${imported} صف مع ${errors.length} خطأ ⚠️`;
  }
}

// ═══════════════════════════════════════
// 📤 Export All
// ═══════════════════════════════════════

export default {
  exportData,
  importFromFile,
  previewImportData,
  validateImport,
  confirmImport,
  downloadTemplate,
  getSupportedColumns,
  getImportErrors,
  clearImportState,
  formatImportResult,
};
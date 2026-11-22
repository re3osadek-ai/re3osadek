/* ========================================
   ⚙️ REAOSADEK - Configuration & Constants
   ======================================== */

// ═══════════════════════════════════════
// 🌐 API Configuration
// ═══════════════════════════════════════
export const API_CONFIG = {
  BASE_URL: 'https://api.reaosadek.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// ═══════════════════════════════════════
// 🗄️ Supabase Configuration
// ═══════════════════════════════════════
   export const SUPABASE_CONFIG = {
     URL: 'https://zpiygcxftmmkcmixnabc.supabase.co',
     ANON_KEY: 'sb_publishable_6T1EW5znqyaTPM4igzLstQ_q7zCR5xR',
   };

// ═══════════════════════════════════════
// 🏭 Production Stages
// ═══════════════════════════════════════
export const STAGES = [
  { id: 'cutting', name: 'Cutting', nameAr: 'القطع', icon: '✂️', color: '#3b82f6', colorLight: '#dbeafe', order: 1 },
  { id: 'edge', name: 'Edge', nameAr: 'التحزيز', icon: '📏', color: '#8b5cf6', colorLight: '#ede9fe', order: 2 },
  { id: 'cnc', name: 'CNC', nameAr: 'CNC', icon: '⚙️', color: '#ec4899', colorLight: '#fce7f3', order: 3 },
  { id: 'pressing', name: 'Pressing', nameAr: 'الضغط', icon: '🔩', color: '#f97316', colorLight: '#ffedd5', order: 4 },
  { id: 'assembly', name: 'Assembly', nameAr: 'التجميع', icon: '🔨', color: '#14b8a6', colorLight: '#ccfbf1', order: 5 },
  { id: 'final-qc', name: 'Final QC', nameAr: 'الفحص النهائي', icon: '✅', color: '#22c55e', colorLight: '#dcfce7', order: 6 },
];

export const STAGE_IDS = STAGES.map(stage => stage.id);

export const STAGE_NAMES = STAGES.reduce((acc, stage) => {
  acc[stage.id] = stage.name;
  return acc;
}, {});

export const STAGE_COLORS = STAGES.reduce((acc, stage) => {
  acc[stage.id] = { main: stage.color, light: stage.colorLight };
  return acc;
}, {});

// ═══════════════════════════════════════
// 🚦 Status & Priority Constants
// ═══════════════════════════════════════
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled',
};

export const STATUS_LABELS = {
  [STATUS.PENDING]: { en: 'Pending', ar: 'معلق' },
  [STATUS.IN_PROGRESS]: { en: 'In Progress', ar: 'قيد التنفيذ' },
  [STATUS.COMPLETED]: { en: 'Completed', ar: 'مكتمل' },
  [STATUS.DELAYED]: { en: 'Delayed', ar: 'متأخر' },
  [STATUS.ON_HOLD]: { en: 'On Hold', ar: 'متوقف' },
  [STATUS.CANCELLED]: { en: 'Cancelled', ar: 'ملغي' },
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: { en: 'Low', ar: 'منخفضة' },
  [PRIORITY.MEDIUM]: { en: 'Medium', ar: 'متوسطة' },
  [PRIORITY.HIGH]: { en: 'High', ar: 'عالية' },
  [PRIORITY.CRITICAL]: { en: 'Critical', ar: 'حرجة' },
};

// ═══════════════════════════════════════
// 👥 User Roles
// ═══════════════════════════════════════
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: { en: 'Admin', ar: 'مدير النظام' },
  [ROLES.MANAGER]: { en: 'Manager', ar: 'مدير' },
  [ROLES.TECHNICIAN]: { en: 'Technician', ar: 'فني' },
  [ROLES.VIEWER]: { en: 'Viewer', ar: 'مشاهد' },
};

// ═══════════════════════════════════════
// 🌍 Languages & Settings
// ═══════════════════════════════════════
export const LANGUAGES = { AR: 'ar', EN: 'en' };
export const LANGUAGE_LABELS = { [LANGUAGES.AR]: 'العربية', [LANGUAGES.EN]: 'English' };
export const DEFAULT_LANGUAGE = LANGUAGES.AR;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const AUTH = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'current_user',
  REMEMBER_KEY: 'remember_me',
  SESSION_DURATION: 24 * 60 * 60 * 1000,
};

export const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const UI = {
  SIDEBAR_COLLAPSED_KEY: 'sidebar_collapsed',
  THEME_KEY: 'theme',
  DEFAULT_THEME: 'light',
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 300,
};

export const STORAGE_KEYS = {
  CLIENTS: 'clients_data',
  PROJECTS: 'projects_data',
  SHORTAGES: 'shortages_data',
  MESSAGES: 'messages_data',
  SETTINGS: 'app_settings',
};

export const EXPORT_FORMATS = { EXCEL: 'xlsx', CSV: 'csv', PDF: 'pdf', JSON: 'json' };

export const IMPORT_SUPPORTED_COLUMNS = [
  'Client Code', 'Client Name', 'Project Name', 'Item Code', 'Item Name',
  'Width', 'Depth', 'Height', 'Quantity', 'Stage'
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ═══════════════════════════════════════
// 🎯 Helper Functions
// ═══════════════════════════════════════
export function getStageById(stageId) {
  return STAGES.find(stage => stage.id === stageId);
}

export function getStageName(stageId, lang = 'en') {
  const stage = getStageById(stageId);
  if (!stage) return stageId;
  return lang === 'ar' ? stage.nameAr : stage.name;
}

export function getNextStage(currentStageId) {
  const currentIndex = STAGES.findIndex(stage => stage.id === currentStageId);
  if (currentIndex === -1 || currentIndex === STAGES.length - 1) return null;
  return STAGES[currentIndex + 1];
}

export function getPreviousStage(currentStageId) {
  const currentIndex = STAGES.findIndex(stage => stage.id === currentStageId);
  if (currentIndex <= 0) return null;
  return STAGES[currentIndex - 1];
}

export function calculateProgress(currentStageId) {
  const currentIndex = STAGES.findIndex(stage => stage.id === currentStageId);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / STAGES.length) * 100;
}

export function getStatusLabel(status, lang = 'en') {
  const label = STATUS_LABELS[status];
  if (!label) return status;
  return lang === 'ar' ? label.ar : label.en;
}

export function getPriorityLabel(priority, lang = 'en') {
  const label = PRIORITY_LABELS[priority];
  if (!label) return priority;
  return lang === 'ar' ? label.ar : label.en;
}

export function getRoleLabel(role, lang = 'en') {
  const label = ROLE_LABELS[role];
  if (!label) return role;
  return lang === 'ar' ? label.ar : label.en;
}

export function getStageClass(stageId) {
  return `stage-${stageId}`;
}

export function getStageColorVar(stageId) {
  return `var(--color-${stageId})`;
}

export const DEFAULT_CLIENT = {
  code: '', name: '', projectName: '', stage: STAGES[0].id,
  status: STATUS.PENDING, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

export const DEFAULT_SHORTAGE = {
  clientCode: '', stage: '', description: '', priority: PRIORITY.MEDIUM,
  status: STATUS.PENDING, createdAt: new Date().toISOString(), resolvedAt: null,
};

export default {
  API_CONFIG, SUPABASE_CONFIG, STAGES, STAGE_IDS, STAGE_NAMES, STAGE_COLORS,
  STATUS, STATUS_LABELS, PRIORITY, PRIORITY_LABELS, ROLES, ROLE_LABELS,
  LANGUAGES, LANGUAGE_LABELS, DEFAULT_LANGUAGE, DATE_FORMATS, PAGINATION,
  AUTH, TEST_CREDENTIALS, UI, STORAGE_KEYS, EXPORT_FORMATS, IMPORT_SUPPORTED_COLUMNS,
  NOTIFICATION_TYPES, DEFAULT_CLIENT, DEFAULT_SHORTAGE,
};
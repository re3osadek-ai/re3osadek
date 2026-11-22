/* ========================================
   🌍 REAOSADEK - Internationalization (i18n)
   ======================================== */

import { LANGUAGES, DEFAULT_LANGUAGE, UI } from '../config.js';
import { saveToStorage, loadFromStorage, qs, qsa } from '../utils/helpers.js';

// ═══════════════════════════════════════
// 📚 Translations Dictionary
// ═══════════════════════════════════════

const translations = {
  ar: {
    // General
    'app.name': 'REAOSADEK',
    'app.subtitle': 'نظام تتبع الإنتاج',
    'app.version': 'الإصدار 2.0',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.kanban': 'لوحة كانبان',
    'nav.shortages': 'النواقص',
    'nav.chat': 'المحادثة',
    'nav.customers': 'العملاء',
    'nav.production': 'الإنتاج',
    'nav.reports': 'التقارير',
    'nav.stagesDashboard': 'لوحة المراحل',
    'nav.stageDurations': 'مدة المراحل',
    'nav.readyProjects': 'المشاريع الجاهزة',
    'nav.projects': 'المشاريع',
    'nav.logout': 'تسجيل الخروج',
    'nav.language': 'English / العربية',
    
    // Stages
    'stage.cutting': 'القطع',
    'stage.edge': 'التحزيز',
    'stage.cnc': 'CNC',
    'stage.pressing': 'الضغط',
    'stage.assembly': 'التجميع',
    'stage.finalQc': 'الفحص النهائي',
    'stage.done': 'مكتمل',
    
    // Status
    'status.pending': 'معلق',
    'status.inProgress': 'قيد التنفيذ',
    'status.completed': 'مكتمل',
    'status.delayed': 'متأخر',
    'status.onHold': 'متوقف',
    'status.cancelled': 'ملغي',
    
    // Priority
    'priority.low': 'منخفضة',
    'priority.medium': 'متوسطة',
    'priority.high': 'عالية',
    'priority.critical': 'حرجة',
    
    // Dashboard
    'dashboard.title': 'نظرة عامة على الإنتاج',
    'dashboard.subtitle': 'مرحباً بك في نظام تتبع الإنتاج',
    'dashboard.totalClients': 'إجمالي العملاء',
    'dashboard.inProduction': 'قيد الإنتاج',
    'dashboard.completed': 'مكتمل',
    'dashboard.shortages': 'النواقص',
    'dashboard.stagesProgress': 'مراحل الإنتاج',
    'dashboard.productionFlow': 'تدفق الإنتاج',
    'dashboard.completedClients': 'العملاء المكتملين',
    'dashboard.viewDetails': 'عرض التفاصيل',
    
    // Kanban
    'kanban.title': 'لوحة كانبان',
    'kanban.search': 'بحث...',
    'kanban.all': 'الكل',
    'kanban.urgent': 'عاجل',
    'kanban.overdue': 'متأخر',
    'kanban.refresh': 'تحديث',
    'kanban.addCard': 'إضافة بطاقة',
    'kanban.total': 'الإجمالي',
    'kanban.inProgress': 'قيد التنفيذ',
    'kanban.noCards': 'لا توجد بطاقات',
    'kanban.dragHere': 'اسحب البطاقات هنا',
    
    // Chat
    'chat.title': 'المحادثات',
    'chat.subtitle': 'تنسيق فوري مع فريق الإنتاج',
    'chat.search': 'بحث...',
    'chat.allRoles': 'الكل',
    'chat.selectClient': 'اختر عميل',
    'chat.selectStage': 'اختر مرحلة',
    'chat.welcome': 'مرحباً بك في محادثة الإنتاج',
    'chat.welcomeDesc': 'اختر عميل ومرحلة للبدء',
    'chat.typeMessage': 'اكتب رسالتك هنا...',
    'chat.send': 'إرسال',
    'chat.online': 'متصل',
    'chat.offline': 'غير متصل',
    'chat.lastActivity': 'آخر نشاط',
    'chat.members': 'أعضاء',
    
    // Shortages
    'shortages.title': 'لوحة تحكم النواقص',
    'shortages.subtitle': 'متابعة وحل جميع النواقص في مراحل الإنتاج',
    'shortages.total': 'إجمالي النواقص',
    'shortages.pending': 'نواقص معلقة',
    'shortages.resolved': 'تم الحل',
    'shortages.byStage': 'نواقص حسب المرحلة',
    'shortages.table': 'جدول النواقص',
    'shortages.add': 'إضافة نقص',
    'shortages.clientCode': 'كود العميل',
    'shortages.clientName': 'اسم العميل',
    'shortages.stage': 'المرحلة',
    'shortages.details': 'التفاصيل',
    'shortages.priority': 'الأولوية',
    'shortages.status': 'الحالة',
    'shortages.date': 'تاريخ التسجيل',
    'shortages.actions': 'إجراءات',
    'shortages.loading': 'جاري تحميل النواقص...',
    
    // Reports
    'reports.title': 'التقارير',
    'reports.filters': 'الفلاتر',
    'reports.reset': 'إعادة تعيين',
    'reports.dateRange': 'الفترة الزمنية',
    'reports.from': 'من',
    'reports.to': 'إلى',
    'reports.stages': 'المراحل',
    'reports.status': 'الحالة',
    'reports.apply': 'تطبيق الفلاتر',
    'reports.production': 'تقارير الإنتاج',
    'reports.stagesDashboard': 'لوحة المراحل',
    'reports.stageDurations': 'مدة المراحل',
    'reports.readyProjects': 'المشاريع الجاهزة',
    'reports.export': 'تصدير البيانات',
    'reports.import': 'استيراد',
    'reports.downloadTemplate': 'تحميل ملف نموذجي',
    'reports.load': 'تحميل البيانات',
    
    // Forms
    'form.required': 'مطلوب',
    'form.save': 'حفظ',
    'form.cancel': 'إلغاء',
    'form.delete': 'حذف',
    'form.edit': 'تعديل',
    'form.view': 'عرض',
    'form.add': 'إضافة',
    'form.update': 'تحديث',
    'form.search': 'بحث',
    'form.filter': 'فلتر',
    'form.refresh': 'تحديث',
    'form.export': 'تصدير',
    'form.import': 'استيراد',
    
    // Login
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'ادخل إلى حسابك',
    'login.username': 'اسم المستخدم',
    'login.password': 'كلمة المرور',
    'login.remember': 'تذكرني',
    'login.forgot': 'نسيت كلمة المرور؟',
    'login.submit': 'دخول',
    'login.error': 'اسم المستخدم أو كلمة المرور غير صحيحة',
    
    // Messages
    'msg.success': 'تمت العملية بنجاح',
    'msg.error': 'حدث خطأ أثناء العملية',
    'msg.warning': 'تنبيه',
    'msg.info': 'معلومة',
    'msg.confirm': 'تأكيد',
    'msg.confirmDelete': 'هل أنت متأكد من الحذف؟',
    'msg.noData': 'لا توجد بيانات',
    'msg.loading': 'جاري التحميل...',
    'msg.saved': 'تم الحفظ بنجاح',
    'msg.deleted': 'تم الحذف بنجاح',
    'msg.updated': 'تم التحديث بنجاح',
    'msg.copied': 'تم النسخ بنجاح',
    
    // Table Headers
    'table.clientCode': 'كود العميل',
    'table.clientName': 'اسم العميل',
    'table.projectName': 'اسم المشروع',
    'table.item': 'البند',
    'table.stage': 'المرحلة',
    'table.technician': 'الفني',
    'table.status': 'الحالة',
    'table.duration': 'المدة',
    'table.progress': 'التقدم',
    'table.supply': 'التوريد',
    'table.shipping': 'الشحن',
    'table.actions': 'إجراءات',
    'table.date': 'التاريخ',
    'table.completionDate': 'تاريخ الإكمال',
    'table.storage': 'التخزين',
    
    // Time
    'time.now': 'الآن',
    'time.minute': 'دقيقة',
    'time.minutes': 'دقائق',
    'time.hour': 'ساعة',
    'time.hours': 'ساعات',
    'time.day': 'يوم',
    'time.days': 'أيام',
    'time.week': 'أسبوع',
    'time.weeks': 'أسابيع',
    'time.month': 'شهر',
    'time.months': 'أشهر',
    'time.year': 'سنة',
    'time.years': 'سنوات',
    'time.ago': 'منذ',
    'time.yesterday': 'أمس',
    'time.today': 'اليوم',
    
    // Units
    'unit.mm': 'مم',
    'unit.cm': 'سم',
    'unit.m': 'م',
    'unit.pieces': 'قطعة',
    'unit.item': 'بند',
    'unit.items': 'بنود',
    
    // Actions
    'action.add': 'إضافة',
    'action.edit': 'تعديل',
    'action.delete': 'حذف',
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.confirm': 'تأكيد',
    'action.close': 'إغلاق',
    'action.refresh': 'تحديث',
    'action.export': 'تصدير',
    'action.import': 'استيراد',
    'action.download': 'تحميل',
    'action.upload': 'رفع',
    'action.print': 'طباعة',
    'action.share': 'مشاركة',
    'action.resolve': 'حل',
    'action.markComplete': 'تحديد كمكتمل',
  },
  
  en: {
    // General
    'app.name': 'REAOSADEK',
    'app.subtitle': 'Production Tracking System',
    'app.version': 'Version 2.0',
    
    // Navigation
    'nav.home': 'Home',
    'nav.kanban': 'Kanban Board',
    'nav.shortages': 'Shortages',
    'nav.chat': 'Chat',
    'nav.customers': 'My Customers',
    'nav.production': 'Production',
    'nav.reports': 'Reports',
    'nav.stagesDashboard': 'Stages Dashboard',
    'nav.stageDurations': 'Stage Durations',
    'nav.readyProjects': 'Ready Projects',
    'nav.projects': 'Projects',
    'nav.logout': 'Logout',
    'nav.language': 'العربية / English',
    
    // Stages
    'stage.cutting': 'Cutting',
    'stage.edge': 'Edge',
    'stage.cnc': 'CNC',
    'stage.pressing': 'Pressing',
    'stage.assembly': 'Assembly',
    'stage.finalQc': 'Final QC',
    'stage.done': 'Done',
    
    // Status
    'status.pending': 'Pending',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.delayed': 'Delayed',
    'status.onHold': 'On Hold',
    'status.cancelled': 'Cancelled',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.critical': 'Critical',
    
    // Dashboard
    'dashboard.title': 'Overall Production Progress',
    'dashboard.subtitle': 'Welcome to Production Tracking System',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.inProduction': 'In Production',
    'dashboard.completed': 'Completed',
    'dashboard.shortages': 'Shortages',
    'dashboard.stagesProgress': 'Production Stages',
    'dashboard.productionFlow': 'Production Flow',
    'dashboard.completedClients': 'Completed Clients',
    'dashboard.viewDetails': 'View Details',
    
    // Kanban
    'kanban.title': 'Kanban Board',
    'kanban.search': 'Search...',
    'kanban.all': 'All',
    'kanban.urgent': 'Urgent',
    'kanban.overdue': 'Overdue',
    'kanban.refresh': 'Refresh',
    'kanban.addCard': 'Add Card',
    'kanban.total': 'Total',
    'kanban.inProgress': 'In Progress',
    'kanban.noCards': 'No cards yet',
    'kanban.dragHere': 'Drag cards here',
    
    // Chat
    'chat.title': 'Conversations',
    'chat.subtitle': 'Real-time team coordination',
    'chat.search': 'Search...',
    'chat.allRoles': 'All',
    'chat.selectClient': 'Select a client',
    'chat.selectStage': 'Select a stage',
    'chat.welcome': 'Welcome to Production Chat',
    'chat.welcomeDesc': 'Select a client and stage to start messaging',
    'chat.typeMessage': 'Type your message here...',
    'chat.send': 'Send',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    'chat.lastActivity': 'Last activity',
    'chat.members': 'Members',
    
    // Shortages
    'shortages.title': 'Shortage Dashboard',
    'shortages.subtitle': 'Track and resolve all production shortages',
    'shortages.total': 'Total Shortages',
    'shortages.pending': 'Pending Shortages',
    'shortages.resolved': 'Resolved',
    'shortages.byStage': 'Shortages by Stage',
    'shortages.table': 'Shortages Table',
    'shortages.add': 'Add Shortage',
    'shortages.clientCode': 'Client Code',
    'shortages.clientName': 'Client Name',
    'shortages.stage': 'Stage',
    'shortages.details': 'Details',
    'shortages.priority': 'Priority',
    'shortages.status': 'Status',
    'shortages.date': 'Registration Date',
    'shortages.actions': 'Actions',
    'shortages.loading': 'Loading shortages...',
    
    // Reports
    'reports.title': 'Reports',
    'reports.filters': 'Filters',
    'reports.reset': 'Reset',
    'reports.dateRange': 'Date Range',
    'reports.from': 'From',
    'reports.to': 'To',
    'reports.stages': 'Stages',
    'reports.status': 'Status',
    'reports.apply': 'Apply Filters',
    'reports.production': 'Production Reports',
    'reports.stagesDashboard': 'Stages Dashboard',
    'reports.stageDurations': 'Stage Durations',
    'reports.readyProjects': 'Ready Projects',
    'reports.export': 'Export Data',
    'reports.import': 'Import',
    'reports.downloadTemplate': 'Download Template',
    'reports.load': 'Load Report Data',
    
    // Forms
    'form.required': 'Required',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.delete': 'Delete',
    'form.edit': 'Edit',
    'form.view': 'View',
    'form.add': 'Add',
    'form.update': 'Update',
    'form.search': 'Search',
    'form.filter': 'Filter',
    'form.refresh': 'Refresh',
    'form.export': 'Export',
    'form.import': 'Import',
    
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Sign in to your account',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Sign In',
    'login.error': 'Invalid username or password',
    
    // Messages
    'msg.success': 'Operation completed successfully',
    'msg.error': 'An error occurred',
    'msg.warning': 'Warning',
    'msg.info': 'Information',
    'msg.confirm': 'Confirm',
    'msg.confirmDelete': 'Are you sure you want to delete?',
    'msg.noData': 'No data available',
    'msg.loading': 'Loading...',
    'msg.saved': 'Saved successfully',
    'msg.deleted': 'Deleted successfully',
    'msg.updated': 'Updated successfully',
    'msg.copied': 'Copied successfully',
    
    // Table Headers
    'table.clientCode': 'Client Code',
    'table.clientName': 'Client Name',
    'table.projectName': 'Project Name',
    'table.item': 'Item',
    'table.stage': 'Stage',
    'table.technician': 'Technician',
    'table.status': 'Status',
    'table.duration': 'Duration',
    'table.progress': 'Progress',
    'table.supply': 'Supply',
    'table.shipping': 'Shipping',
    'table.actions': 'Actions',
    'table.date': 'Date',
    'table.completionDate': 'Completion Date',
    'table.storage': 'Storage',
    
    // Time
    'time.now': 'Now',
    'time.minute': 'minute',
    'time.minutes': 'minutes',
    'time.hour': 'hour',
    'time.hours': 'hours',
    'time.day': 'day',
    'time.days': 'days',
    'time.week': 'week',
    'time.weeks': 'weeks',
    'time.month': 'month',
    'time.months': 'months',
    'time.year': 'year',
    'time.years': 'years',
    'time.ago': 'ago',
    'time.yesterday': 'Yesterday',
    'time.today': 'Today',
    
    // Units
    'unit.mm': 'mm',
    'unit.cm': 'cm',
    'unit.m': 'm',
    'unit.pieces': 'pieces',
    'unit.item': 'item',
    'unit.items': 'items',
    
    // Actions
    'action.add': 'Add',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.close': 'Close',
    'action.refresh': 'Refresh',
    'action.export': 'Export',
    'action.import': 'Import',
    'action.download': 'Download',
    'action.upload': 'Upload',
    'action.print': 'Print',
    'action.share': 'Share',
    'action.resolve': 'Resolve',
    'action.markComplete': 'Mark as Complete',
  },
};

// ═══════════════════════════════════════
// 🌐 Current Language State
// ═══════════════════════════════════════

let currentLanguage = loadFromStorage(UI.THEME_KEY + '_lang', DEFAULT_LANGUAGE);

// ═══════════════════════════════════════
// 🎯 Core Functions
// ═══════════════════════════════════════

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated text
 */
export function t(key, params = {}) {
  const lang = currentLanguage;
  let text = translations[lang]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
  
  // Interpolate parameters
  if (params && Object.keys(params).length > 0) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    });
  }
  
  return text;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`⚠️ Language "${lang}" not supported`);
    return false;
  }
  
  currentLanguage = lang;
  saveToStorage(UI.THEME_KEY + '_lang', lang);
  
  // Update HTML dir attribute
  const html = document.documentElement;
  if (html) {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }
  
  // Apply translations to all elements with data-i18n
  applyTranslations();
  
  // Emit language change event
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  
  return true;
}

/**
 * Toggle between Arabic and English
 */
export function toggleLanguage() {
  const newLang = currentLanguage === LANGUAGES.AR ? LANGUAGES.EN : LANGUAGES.AR;
  return setLanguage(newLang);
}

/**
 * Check if current language is RTL
 */
export function isRTL() {
  return currentLanguage === LANGUAGES.AR;
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
  return Object.keys(translations);
}

// ═══════════════════════════════════════
// 🎨 DOM Translation
// ═══════════════════════════════════════

/**
 * Apply translations to all elements with data-i18n attribute
 */
export function applyTranslations() {
  // Translate text content
  qsa('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const text = t(key);
    if (text && text !== key) {
      element.textContent = text;
    }
  });
  
  // Translate attributes (placeholder, title, aria-label, etc.)
  qsa('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const text = t(key);
    if (text && text !== key) {
      element.setAttribute('placeholder', text);
    }
  });
  
  qsa('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    const text = t(key);
    if (text && text !== key) {
      element.setAttribute('title', text);
    }
  });
  
  qsa('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    const text = t(key);
    if (text && text !== key) {
      element.setAttribute('aria-label', text);
    }
  });
}

/**
 * Initialize i18n system
 */
export function initI18n() {
  // Load saved language or use default
  const savedLang = loadFromStorage(UI.THEME_KEY + '_lang', DEFAULT_LANGUAGE);
  currentLanguage = savedLang;
  
  // Apply initial translations
  applyTranslations();
  
  // Set initial direction
  const html = document.documentElement;
  if (html) {
    html.setAttribute('lang', currentLanguage);
    html.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
  }
  
  console.log(`🌍 i18n initialized with language: ${currentLanguage}`);
}

// ═══════════════════════════════════════
// 🔧 Helper Functions
// ═══════════════════════════════════════

/**
 * Translate stage name
 */
export function translateStage(stageId) {
  const stageKeys = {
    'cutting': 'stage.cutting',
    'edge': 'stage.edge',
    'cnc': 'stage.cnc',
    'pressing': 'stage.pressing',
    'assembly': 'stage.assembly',
    'final-qc': 'stage.finalQc',
  };
  
  const key = stageKeys[stageId];
  return key ? t(key) : stageId;
}

/**
 * Translate status
 */
export function translateStatus(status) {
  const statusKeys = {
    'pending': 'status.pending',
    'in-progress': 'status.inProgress',
    'completed': 'status.completed',
    'delayed': 'status.delayed',
    'on-hold': 'status.onHold',
    'cancelled': 'status.cancelled',
  };
  
  const key = statusKeys[status];
  return key ? t(key) : status;
}

/**
 * Translate priority
 */
export function translatePriority(priority) {
  const priorityKeys = {
    'low': 'priority.low',
    'medium': 'priority.medium',
    'high': 'priority.high',
    'critical': 'priority.critical',
  };
  
  const key = priorityKeys[priority];
  return key ? t(key) : priority;
}

/**
 * Add translation dynamically
 */
export function addTranslation(lang, key, value) {
  if (!translations[lang]) {
    translations[lang] = {};
  }
  translations[lang][key] = value;
}

/**
 * Add multiple translations
 */
export function addTranslations(lang, translationsObj) {
  if (!translations[lang]) {
    translations[lang] = {};
  }
  Object.assign(translations[lang], translationsObj);
}

// ═══════════════════════════════════════
// 🎯 Export All
// ═══════════════════════════════════════

export default {
  t,
  getCurrentLanguage,
  setLanguage,
  toggleLanguage,
  isRTL,
  getAvailableLanguages,
  applyTranslations,
  initI18n,
  translateStage,
  translateStatus,
  translatePriority,
  addTranslation,
  addTranslations,
};
/* ========================================
   🧭 REAOSADEK - Router Module
   ======================================== */

import { $, qs, qsa, show, hide, showToast } from '../utils/helpers.js';
import { isUserAuthenticated, getCurrentUser } from './auth.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 📋 Pages Configuration
// ═══════════════════════════════════════

const PAGES = {
  home: {
    title: '🏠 Home',
    subtitle: 'الصفحة الرئيسية واستعلام العملاء',
    titleKey: 'nav.home',
    subtitleKey: 'dashboard.subtitle',
    onEnter: 'initHome',
    requiresAuth: true,
  },
  'production-flow': {
    title: '🏭 Production Flow',
    subtitle: 'نظام تدفق الإنتاج',
    titleKey: 'nav.productionFlow',
    subtitleKey: 'productionFlow.title',
    onEnter: 'initProductionFlow',  // ✅ مصحح
    requiresAuth: true,
  },
  'overall-production': {
    title: '📊 Overall Production',
    subtitle: 'نظرة عامة على الإنتاج',
    titleKey: 'nav.overallProduction',
    subtitleKey: 'overallProduction.title',  // ✅ مصحح
    onEnter: 'initDashboard',
    requiresAuth: true,
  },
  kanban: {
    title: '📋 Kanban Board',
    subtitle: 'إدارة المشاريع بنظام كانبان',
    titleKey: 'nav.kanban',
    subtitleKey: 'kanban.title',
    onEnter: 'initKanban',
    requiresAuth: true,
  },
  shortages: {
    title: '🔴 النواقص',
    subtitle: 'متابعة وحل جميع النواقص',
    titleKey: 'nav.shortages',
    subtitleKey: 'shortages.title',  // ✅ مصحح
    onEnter: 'initShortages',
    requiresAuth: true,
  },
  chat: {
    title: '💬 Production Chat',
    subtitle: 'تنسيق فوري مع فريق الإنتاج',
    titleKey: 'nav.chat',
    subtitleKey: 'chat.title',  // ✅ مصحح
    onEnter: 'initChat',
    requiresAuth: true,
  },
  customers: {
    title: '🏭 My Customers',
    subtitle: 'إدارة العملاء',
    titleKey: 'nav.customers',
    subtitleKey: 'nav.customers',
    onEnter: 'initCustomers',  // ✅ مصحح (كان onEn ter)
    requiresAuth: true,
  },
  glass: {
    title: '💎 Glass Orders',
    subtitle: 'أوامر الزجاج',
    titleKey: 'nav.glass',
    subtitleKey: 'nav.glass',
    onEnter: 'initGlass',
    requiresAuth: true,
  },
  'stages-dashboard': {
    title: '📈 Stages Dashboard',
    subtitle: 'لوحة تحكم المراحل',
    titleKey: 'nav.stagesDashboard',
    subtitleKey: 'reports.stagesDashboard',  // ✅ مصحح
    onEnter: 'initStagesDashboard',
    requiresAuth: true,
  },
  'stage-durations': {
    title: '⏱️ Stage Durations',
    subtitle: 'مدة كل مرحلة لكل بند',
    titleKey: 'nav.stageDurations',  // ✅ مصحح
    subtitleKey: 'reports.stageDurations',
    onEnter: 'initStageDurations',
    requiresAuth: true,
  },
  'ready-projects': {
    title: '✅ Ready Projects',
    subtitle: 'المشاريع الجاهزة للتسليم',
    titleKey: 'nav.readyProjects',
    subtitleKey: 'reports.readyProjects',
    onEnter: 'initReadyProjects',
    requiresAuth: true,
  },
  projects: {
    title: '📁 Projects',
    subtitle: 'إدارة المشاريع',
    titleKey: 'nav.projects',
    subtitleKey: 'nav.projects',
    onEnter: null,
    requiresAuth: true,
  },
  reports: {
    title: '📊 Reports',
    subtitle: 'التقارير الشاملة',
    titleKey: 'nav.reports',
    subtitleKey: 'reports.title',
    onEnter: 'initReports',
    requiresAuth: true,
  },
  cutting: { title: '✂️ Cutting', subtitle: 'مرحلة القطع', titleKey: 'stage.cutting', onEnter: null, requiresAuth: true },
  edge: { title: '📏 Edge', subtitle: 'مرحلة التحزيز', titleKey: 'stage.edge', onEnter: null, requiresAuth: true },
  cnc: { title: '⚙️ CNC', subtitle: 'مرحلة CNC', titleKey: 'stage.cnc', onEnter: null, requiresAuth: true },
  pressing: { title: '🔩 Pressing', subtitle: 'مرحلة الضغط', titleKey: 'stage.pressing', onEnter: null, requiresAuth: true },
  assembly: { title: '🔨 Assembly', subtitle: 'مرحلة التجميع', titleKey: 'stage.assembly', onEnter: null, requiresAuth: true },
  'final-qc': { title: '✅ Final Quality', subtitle: 'مرحلة الفحص النهائي', titleKey: 'stage.finalQc', onEnter: null, requiresAuth: true },
};


// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let currentPage = 'home';
let pageCallbacks = {};
let isInitialized = false;

// ═══════════════════════════════════════
// 🔧 Core Functions
// ═══════════════════════════════════════

/**
 * Initialize router system
 */
export function initRouter() {
  if (isInitialized) return;
  
  // Bind sidebar navigation
  bindSidebarNavigation();
  
  // Bind submenus
  bindSubmenus();
  
  // Bind sidebar toggle
  bindSidebarToggle();
  
  // Bind language toggle
  bindLanguageToggle();
  
  // Handle browser back/forward
  window.addEventListener('popstate', handlePopState);
  
  // Check initial page from URL hash
  const initialPage = getPageFromHash() || 'home';
  navigateTo(initialPage, false);
  
  isInitialized = true;
  
  console.log('🧭 Router initialized');
}

/**
 * Navigate to a page
 */
export function navigateTo(pageId, updateHistory = true) {
  // Check if page exists
  if (!PAGES[pageId]) {
    console.warn(`⚠️ Page "${pageId}" not found`);
    pageId = 'home';
  }
  
  const page = PAGES[pageId];
  
  // Check authentication
  if (page.requiresAuth && !isUserAuthenticated()) {
    showToast('يجب تسجيل الدخول أولاً', 'warning');
    return false;
  }
  // 🔐 فحص صلاحيات المستخدم (كريم - الزجاج فقط)
  const user = getCurrentUser();
  if (user && user.role === 'glass_only' && pageId !== 'glass') {
    showToast('⛔ غير مصرح لك بالدخول لهذه الصفحة', 'error');
    if (currentPage !== 'glass') {
      return navigateTo('glass', updateHistory);
    }
    return false;
  }
  // ⭐⭐⭐ إخفاء الصفحة الحالية أولاً ⭐⭐⭐
  hideCurrentPage();
  
  // إظهار الصفحة الجديدة
  showPage(pageId);
  
  // Update sidebar active state
  updateSidebarActive(pageId);
  
  // Update header
  updateHeader(pageId);
  
  // Update URL hash
  if (updateHistory) {
    updateHash(pageId);
  }
  
  // Call page-specific initialization
  if (page.onEnter && pageCallbacks[page.onEnter]) {
    try {
      pageCallbacks[page.onEnter]();
    } catch (error) {
      console.error(`❌ Error initializing page "${pageId}":`, error);
    }
  }
  
  // Close mobile sidebar
  closeMobileSidebar();
  
  // Update current page state
  currentPage = pageId;
  
  // Scroll to top
  scrollToTop();
  
  console.log(`📄 Navigated to: ${pageId}`);
  return true;
}

/**
 * Get current page
 */
export function getCurrentPage() {
  return currentPage;
}

/**
 * Register page callback
 */
export function registerPageCallback(name, callback) {
  pageCallbacks[name] = callback;
}

/**
 * Get all pages
 */
export function getPages() {
  return PAGES;
}

// ═══════════════════════════════════════
// 🎨 UI Functions
// ═══════════════════════════════════════

/**
 * Hide current page
 */
/**
 * Hide current page (مُحسّنة)
 */
function hideCurrentPage() {
  qsa('[data-page-content]').forEach(section => {
    section.classList.add('d-none');
    section.style.display = 'none';  // ✅ ضمان الإخفاء
  });
}

/**
 * Show specific page (مُحسّنة)
 */
function showPage(pageId) {
  const pageSection = qs(`[data-page-content="${pageId}"]`);
  if (pageSection) {
    pageSection.classList.remove('d-none');
    pageSection.style.display = 'block';  // ✅ ضمان الظهور
    console.log(`✅ Page "${pageId}" displayed`);
  } else {
    console.warn(`⚠️ Page section for "${pageId}" not found`);
  }
}
/**
 * Update sidebar active state
 */
function updateSidebarActive(pageId) {
  // Remove active class from all items
  qsa('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to current item
  const activeItem = qs(`.sidebar-item[data-page="${pageId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    
    // Open parent submenu if exists
    const parentSubmenu = activeItem.closest('.sidebar-submenu');
    if (parentSubmenu) {
      parentSubmenu.classList.add('open');
      const parentItem = parentSubmenu.previousElementSibling;
      if (parentItem && parentItem.classList.contains('has-submenu')) {
        parentItem.classList.add('open');
      }
    }
  }
}

/**
 * Update header title and subtitle
 */
function updateHeader(pageId) {
  const page = PAGES[pageId];
  if (!page) return;
  
  const pageTitle = $('pageTitle');
  const pageSubtitle = $('pageSubtitle');
  
  if (pageTitle) {
    // Try to use translation, fallback to static title
    const translatedTitle = t(page.titleKey || '');
    pageTitle.textContent = (translatedTitle !== page.titleKey) ? translatedTitle : page.title;
  }
  
  if (pageSubtitle) {
    const translatedSubtitle = t(page.subtitleKey || '');
    pageSubtitle.textContent = (translatedSubtitle !== page.subtitleKey) ? translatedSubtitle : page.subtitle;
  }
}

/**
 * Update URL hash
 */
function updateHash(pageId) {
  if (window.location.hash !== `#${pageId}`) {
    window.history.pushState({ page: pageId }, '', `#${pageId}`);
  }
}

/**
 * Get page from URL hash
 */
function getPageFromHash() {
  const hash = window.location.hash.slice(1);
  return hash && PAGES[hash] ? hash : null;
}

/**
 * Handle browser back/forward
 */
function handlePopState(event) {
  const pageId = getPageFromHash() || 'home';
  navigateTo(pageId, false);
}

/**
 * Scroll main content to top
 */
function scrollToTop() {
  const mainContent = qs('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ═══════════════════════════════════════
// 📑 Sidebar Navigation
// ═══════════════════════════════════════

/**
 * Bind sidebar navigation events
 */
function bindSidebarNavigation() {
  qsa('.sidebar-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.dataset.page;
      if (pageId) {
        navigateTo(pageId);
      }
    });
  });
  
  // Sidebar logo click -> home
  const sidebarLogo = qs('.sidebar-logo');
  if (sidebarLogo) {
    sidebarLogo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('home');
    });
  }
}

/**
 * Bind submenus toggle
 */
function bindSubmenus() {
  qsa('.sidebar-item.has-submenu').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const submenuId = item.dataset.submenu;
      if (!submenuId) return;
      
      const submenu = $(`submenu-${submenuId}`);
      if (!submenu) return;
      
      // Toggle open state
      const isOpen = submenu.classList.contains('open');
      
      if (isOpen) {
        submenu.classList.remove('open');
        item.classList.remove('open');
      } else {
        submenu.classList.add('open');
        item.classList.add('open');
      }
    });
  });
}

/**
 * Bind sidebar toggle button
 */
function bindSidebarToggle() {
  const toggleBtn = $('sidebarToggle');
  const appLayout = qs('.app-layout');
  const sidebar = $('sidebar');
  
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Mobile: toggle overlay
      sidebar?.classList.toggle('mobile-open');
      
      // Toggle overlay backdrop
      let overlay = qs('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeMobileSidebar);
        document.body.appendChild(overlay);
      }
      
      if (sidebar?.classList.contains('mobile-open')) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    } else {
      // Desktop: toggle collapsed
      appLayout?.classList.toggle('sidebar-collapsed');
    }
  });
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
  const sidebar = $('sidebar');
  const overlay = qs('.sidebar-overlay');
  
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Bind language toggle
 */
function bindLanguageToggle() {
  const langToggle = $('languageToggle');
  if (!langToggle) return;
  
  langToggle.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Dynamic import to avoid circular dependency
    const { toggleLanguage } = await import('./i18n.js');
    toggleLanguage();
    
    // Update current page header
    updateHeader(currentPage);
    
    showToast('تم تغيير اللغة', 'success');
  });
}

// ═══════════════════════════════════════
// 🔧 Utility Functions
// ═══════════════════════════════════════

/**
 * Refresh current page
 */
export function refreshCurrentPage() {
  const page = PAGES[currentPage];
  if (page && page.onEnter && pageCallbacks[page.onEnter]) {
    try {
      pageCallbacks[page.onEnter]();
    } catch (error) {
      console.error(`❌ Error refreshing page "${currentPage}":`, error);
    }
  }
}

/**
 * Navigate to page and pass data
 */
export function navigateWithData(pageId, data) {
  const success = navigateTo(pageId);
  if (success && data) {
    // Store data for the page to use
    window.__pageData = { pageId, data, timestamp: Date.now() };
  }
  return success;
}

/**
 * Get page data (if any)
 */
export function getPageData() {
  const data = window.__pageData;
  if (!data) return null;
  
  // Clear after 5 seconds
  if (Date.now() - data.timestamp > 5000) {
    window.__pageData = null;
    return null;
  }
  
  return data;
}

/**
 * Check if page exists
 */
export function pageExists(pageId) {
  return !!PAGES[pageId];
}

/**
 * Get page info
 */
export function getPageInfo(pageId) {
  return PAGES[pageId] || null;
}

// ═══════════════════════════════════════
// 🎯 Export All
// ═══════════════════════════════════════

export default {
  initRouter,
  navigateTo,
  getCurrentPage,
  registerPageCallback,
  getPages,
  refreshCurrentPage,
  navigateWithData,
  getPageData,
  pageExists,
  getPageInfo,
};

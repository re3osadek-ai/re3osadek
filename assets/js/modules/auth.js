/* ========================================
   🔐 REAOSADEK - Authentication Module
   ======================================== */
import { SUPABASE_CONFIG, STAGES } from '../config.js';

const supabase = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
import { AUTH, TEST_CREDENTIALS, ROLES, ROLE_LABELS } from '../config.js';
import {
  $, saveToStorage, loadFromStorage, removeFromStorage,
  show, hide, showToast, qs
} from '../utils/helpers.js';
import { validateLoginForm } from '../utils/validators.js';
import { t } from './i18n.js';

// ═══════════════════════════════════════
// 🎯 State Management
// ═══════════════════════════════════════

let currentUser = null;
let isAuthenticated = false;
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// ═══════════════════════════════════════
// 👥 Mock Users Database (للاختبار)
// ═══════════════════════════════════════

const USER_PROFILES = {
  're3osadek@gmail.com': { name: 'رفعت', role: ROLES.ADMIN, avatar: 'R', canDelete: true },
  'karim@glass.com': { name: 'كريم', role: 'glass_only', avatar: 'كر', allowedPages: ['glass'], canDelete: false },
  'cutting@kitchino.com': { name: 'قسم التقطيع', role: ROLES.TECHNICIAN, avatar: 'قط', canDelete: false },
  'assembly@kitchino.com': { name: 'قسم التجميع', role: ROLES.TECHNICIAN, avatar: 'تج', canDelete: false },
  'cnc@kitchino.com': { name: 'قسم CNC', role: ROLES.TECHNICIAN, avatar: 'CN', canDelete: false },
  'edge@kitchino.com': { name: 'قسم الشريط', role: ROLES.TECHNICIAN, avatar: 'شر', canDelete: false },
};
// ═══════════════════════════════════════
// 🔐 Core Authentication Functions
// ═══════════════════════════════════════

/**
 * Initialize authentication system
 */
export function initAuth() {
  // 1. تفعيل زر تسجيل الخروج وكل الأحداث فوراً قبل أي شروط
  bindAuthEvents();

  const savedUser = loadFromStorage(AUTH.USER_KEY, null);
  const savedToken = loadFromStorage(AUTH.TOKEN_KEY, null);
  
  if (savedUser && savedToken) {
    if (isSessionValid(savedToken)) {
      currentUser = savedUser;
      isAuthenticated = true;
      showApp();
      updateUserUI();
      console.log('✅ User session restored:', savedUser.name);
      return;
    } else {
      clearSession();
    }
  }
  
  showLogin();
  console.log('🔐 Auth system initialized');
}

// تم فصل أحداث تسجيل الخروج عن فورم الدخول لتعمل بشكل دائم
function bindAuthEvents() {
  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      await handleLoginSubmit();
    };
  }
  
  const usernameInput = $('loginUsername');
  const passwordInput = $('loginPassword');
  if (usernameInput) usernameInput.oninput = hideLoginError;
  if (passwordInput) passwordInput.oninput = hideLoginError;
  
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  }
}
/**
 * Login user
 */
export async function login(username, password, rememberMe = false) {
  if (isLockedOut()) {
    const remainingTime = getLockoutRemainingTime();
    return {
      success: false,
      message: `تم قفل الحساب مؤقتاً. حاول مرة أخرى بعد ${Math.ceil(remainingTime / 60000)} دقيقة`,
    };
  }

  // تحويل اسم "كريم" تلقائياً إلى إيميله للتسهيل
  let email = username.trim().toLowerCase();
  if (email === 'كريم' || email === 'karim') email = 'karim@glass.com';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    };
  }

  const profile = USER_PROFILES[email] || {
    name: email.split('@')[0],
    role: ROLES.TECHNICIAN,
    avatar: 'U',
    canDelete: false,
  };

  const userToSave = {
    id: data.user.id,
    email: data.user.email,
    username: profile.name,
    ...profile,
  };

  currentUser = userToSave;
  isAuthenticated = true;

  saveToStorage(AUTH.USER_KEY, userToSave);
  saveToStorage(AUTH.TOKEN_KEY, data.session.access_token);
  saveToStorage(AUTH.REMEMBER_KEY, rememberMe);

  showApp();
  updateUserUI();

  const { navigateTo } = await import('./router.js');
  navigateTo(userToSave.role === 'glass_only' ? 'glass' : 'home');

  showToast(`مرحباً ${userToSave.name}! 👋`, 'success');
  return { success: true, user: userToSave, message: 'تم تسجيل الدخول بنجاح' };
}
/**
 * Logout user
 */
export async function logout() {
  if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
  await supabase.auth.signOut();
  clearSession();
  currentUser = null;
  isAuthenticated = false;
  showLogin();
  showToast('تم تسجيل الخروج بنجاح', 'info');
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated() {
  return isAuthenticated;
}

/**
 * Check if user has specific role
 */
export function hasRole(role) {
  if (!currentUser) return false;
  return currentUser.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin() {
  return hasRole(ROLES.ADMIN);
}

/**
 * Check if user is manager
 */
export function isManager() {
  return hasRole(ROLES.MANAGER) || hasRole(ROLES.ADMIN);
}

// ═══════════════════════════════════════
// 🎨 UI Functions
// ═══════════════════════════════════════

/**
 * Show login screen
 */
function showLogin() {
  const loginScreen = $('loginScreen');
  const appLayout = $('appLayout');
  
  if (loginScreen) show(loginScreen, 'flex');
  if (appLayout) hide(appLayout);
}

/**
 * Show main app
 */
function showApp() {
  const loginScreen = $('loginScreen');
  const appLayout = $('appLayout');
  
  if (loginScreen) hide(loginScreen);
  if (appLayout) {
    appLayout.classList.remove('d-none');
    appLayout.style.display = 'grid';
  }
}

/**
 * Update user UI in header
 */
function updateUserUI() {
  if (!currentUser) return;
  
  const userName = $('userName');
  const userRole = $('userRole');
  const userAvatar = $('userAvatar');
  
  if (userName) userName.textContent = currentUser.name;
 if (userRole) {
    const roleLabel = ROLE_LABELS[currentUser.role];
    userRole.textContent = roleLabel
      ? roleLabel.ar
      : (currentUser.role === 'glass_only' ? 'قسم الزجاج' : currentUser.role);
  }
  if (userAvatar) userAvatar.textContent = currentUser.avatar;
}

/**
 * Show login error
 */
function showLoginError(message) {
  const errorElement = $('loginError');
  if (errorElement) {
    const description = errorElement.querySelector('.alert-description');
    if (description) description.textContent = message;
    errorElement.classList.remove('d-none');
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorElement.classList.add('d-none');
    }, 5000);
  }
}

/**
 * Hide login error
 */
function hideLoginError() {
  const errorElement = $('loginError');
  if (errorElement) {
    errorElement.classList.add('d-none');
  }
}

// ═══════════════════════════════════════
// 🔧 Session Management
// ═══════════════════════════════════════

/**
 * Check if session is valid
 */
function isSessionValid(token) {
  if (!token) return false;
  
  // Check session duration (24 hours)
  const loginTime = loadFromStorage('login_time', null);
  if (loginTime) {
    const elapsed = Date.now() - new Date(loginTime).getTime();
    if (elapsed > AUTH.SESSION_DURATION) {
      return false;
    }
  }
  
  return true;
}

/**
 * Clear session data
 */
function clearSession() {
  removeFromStorage(AUTH.USER_KEY);
  removeFromStorage(AUTH.TOKEN_KEY);
  removeFromStorage(AUTH.REMEMBER_KEY);
  removeFromStorage('login_time');
}

/**
 * Generate session token
 */
function generateToken() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `token_${timestamp}_${random}`;
}

// ═══════════════════════════════════════
// 🔒 Lockout Management
// ═══════════════════════════════════════

/**
 * Check if account is locked out
 */
function isLockedOut() {
  const lockoutUntil = loadFromStorage('lockout_until', null);
  if (!lockoutUntil) return false;
  
  if (Date.now() > lockoutUntil) {
    removeFromStorage('lockout_until');
    removeFromStorage('login_attempts');
    return false;
  }
  
  return true;
}

/**
 * Get remaining lockout time in milliseconds
 */
function getLockoutRemainingTime() {
  const lockoutUntil = loadFromStorage('lockout_until', null);
  if (!lockoutUntil) return 0;
  
  const remaining = lockoutUntil - Date.now();
  return Math.max(0, remaining);
}

// ═══════════════════════════════════════
// 🎯 Event Handlers
// ═══════════════════════════════════════

/**
 * Bind login form events
 */
function bindLoginFormEvents() {
  const loginForm = $('loginForm');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLoginSubmit();
  });
  
  // Hide error on input
  const usernameInput = $('loginUsername');
  const passwordInput = $('loginPassword');
  
  if (usernameInput) {
    usernameInput.addEventListener('input', hideLoginError);
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', hideLoginError);
  }
  
  // Logout button
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit() {
  const usernameInput = $('loginUsername');
  const passwordInput = $('loginPassword');
  const rememberMeInput = $('rememberMe');
  
  if (!usernameInput || !passwordInput) return;
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
  
  // Show loading state
  const submitBtn = qs('button[type="submit"]', $('loginForm'));
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner spinner-sm"></div> <span>جاري الدخول...</span>';
  }
  
  try {
    const result = await login(username, password, rememberMe);
    
    if (!result.success) {
      showLoginError(result.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    showLoginError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى');
  } finally {
    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

// ═══════════════════════════════════════
// 🎨 Helper Functions
// ═══════════════════════════════════════

/**
 * Get user display name
 */
export function getUserDisplayName() {
  if (!currentUser) return 'Guest';
  return currentUser.name;
}

/**
 * Get user role label
 */
export function getUserRoleLabel(lang = 'ar') {
  if (!currentUser) return 'Guest';
  const label = ROLE_LABELS[currentUser.role];
  if (!label) return currentUser.role;
  return lang === 'ar' ? label.ar : label.en;
}

/**
 * Update user profile
 */
export function updateUserProfile(updates) {
  if (!currentUser) return false;
  
  currentUser = { ...currentUser, ...updates };
  saveToStorage(AUTH.USER_KEY, currentUser);
  updateUserUI();
  
  return true;
}

/**
 * Change password (placeholder for future implementation)
 */
export async function changePassword(oldPassword, newPassword) {
  // This would normally call an API
  console.log('🔐 Change password requested');
  return {
    success: false,
    message: 'هذه الميزة قيد التطوير',
  };
}

// ═══════════════════════════════════════
// 🎯 Export All
// ═══════════════════════════════════════

export default {
  initAuth,
  login,
  logout,
  getCurrentUser,
  isUserAuthenticated,
  hasRole,
  isAdmin,
  isManager,
  getUserDisplayName,
  getUserRoleLabel,
  updateUserProfile,
  changePassword,
};
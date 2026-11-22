/* ========================================
🚀 REAOSADEK - Main Application Entry Point
======================================== */

// استيراد الوحدات الأساسية
import { initAuth } from './auth.js';
import { initRouter } from './router.js';
import { t, initI18n } from './i18n.js'; // تأكد من وجود هذا الملف أو حذف السطر إذا لم يكن موجوداً
import { $, showToast } from '../utils/helpers.js';

console.log('🚀 REAOSADEK Production Tracking System Starting...');

/**
 * تهيئة التطبيق الرئيسية
 */
async function bootstrapApp() {
    try {
        // 1. تهيئة اللغة (اختياري)
        if (typeof initI18n === 'function') {
            await initI18n();
        }

        // 2. تهيئة نظام المصادقة
        // هذه الدالة ستفحص هل المستخدم مسجل دخول أم لا
        // إذا كان مسجلاً: ستظهر الواجهة الرئيسية
        // إذا لم يكن: ستظهر شاشة تسجيل الدخول
        initAuth();

        // 3. تهيئة الرواتر
        // هذه الدالة ستربط القائمة الجانبية وتحمل الصفحة الافتراضية
        initRouter();

        console.log('✅ System Initialized Successfully');
        
    } catch (error) {
        console.error('❌ Fatal Error during initialization:', error);
        const appContent = $('#app-content');
        if (appContent) {
            appContent.innerHTML = `
                <div style="text-align:center; padding:50px; color:#dc3545;">
                    <h2>⚠️ خطأ في تشغيل النظام</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary mt-3">إعادة المحاولة</button>
                </div>
            `;
        }
    }
}

// بدء التطبيق عند تحميل DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}

// تصدير دوال مفيدة للنوافذ الأخرى (Debugging)
window.__APP__ = {
    restart: bootstrapApp,
    version: '2.0.0-Dynamic'
};
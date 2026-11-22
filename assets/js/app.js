/* ========================================
🚀 REAOSADEK - Main Application Entry Point
======================================== */
import { initAuth } from './modules/auth.js';
import { initRouter } from './modules/router.js';

console.log('🚀 REAOSADEK Production Tracking System Starting...');
console.log('📅 Date:', new Date().toLocaleString('ar-EG'));

// التأكد من أن DOM جاهز قبل البدء
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔐 Initializing Auth...');
        initAuth();
        
        console.log('🧭 Initializing Router...');
        initRouter();
        
        // --- 🌙 تفعيل زر الوضع الليلي (Dark Mode) ---
        initThemeToggle();
        
        console.log('✅ System Ready & Running!');
        console.log('📄 Current Page:', window.location.hash || '#home');
        
    } catch (error) {
        console.error('❌ Fatal Error during startup:', error);
        alert('حدث خطأ في تشغيل النظام. راجع Console للتفاصيل.');
    }
});

// دالة لتشغيل الوضع الليلي
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (!themeToggleBtn) return;

    const icon = themeToggleBtn.querySelector('i');
    const htmlElement = document.documentElement; // استهداف html أو body

    // التحقق من الوضع المحفوظ سابقاً
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    // إضافة حدث النقر على الزر
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

// تصدير للـ debugging
window.__APP__ = {
    version: '2.0.0',
    startTime: Date.now(),
};
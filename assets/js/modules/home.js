/* ========================================
🏠 REAOSADEK - Home Module
======================================== */
import { $, showToast, showLoading, hideLoading } from '../utils/helpers.js';
import { api } from './api.js';
import { registerPageCallback, navigateTo } from './router.js';

async function handleHomeSearch() {
    const clientCodeInput = $('homeClientCode');
    const clientCode = clientCodeInput ? clientCodeInput.value.trim() : '';
    
    if (!clientCode) {
        showToast('يرجى إدخال كود العميل', 'warning');
        return;
    }
    
    try {
        showLoading('جاري البحث...');
        const clients = await api.getClients();
        const client = clients.find(c => c.client_code === clientCode);
        
        if (client) {
            showToast('✅ تم العثور على العميل: ' + client.client_name, 'success');
            
            // الانتقال لصفحة العملاء
            navigateTo('customers');
            
            // انتظار ظهور الصفحة ثم ملء البيانات
            setTimeout(() => {
                const targetInput = $('clientCode');
                const searchBtn = $('btnSearch');
                if (targetInput) targetInput.value = clientCode;
                if (searchBtn) searchBtn.click();
            }, 500);
        } else {
            showToast('⚠️ العميل غير موجود', 'warning');
        }
        hideLoading();
    } catch (error) {
        console.error('❌ Error searching client:', error);
        hideLoading();
        showToast('حدث خطأ أثناء البحث', 'error');
    }
}

function initHome() {
    console.log('🏠 Init Home Page');
    
    // تحديث اسم المستخدم
    const welcomeName = $('homeUserName');
    const userName = $('userName');
    if (welcomeName && userName) {
        welcomeName.textContent = userName.textContent;
    }
    
    // تحميل الإحصائيات
    loadHomeStats();
    
    // ربط حدث البحث
    const searchBtn = $('homeBtnSearch');
    const clientCodeInput = $('homeClientCode');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleHomeSearch);
    }
    
    if (clientCodeInput) {
        clientCodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleHomeSearch();
            }
        });
    }
    
    // ربط أزرار الإجراءات السريعة
    document.querySelectorAll('.home-action-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = btn.dataset.page;
            if (pageId) {
                navigateTo(pageId);
            }
        });
    });
}

async function loadHomeStats() {
    try {
        const clients = await api.getClients();
        
        const totalClients = clients.length;
        const inProduction = clients.filter(c => c.overall_status === 'in-progress').length;
        const completed = clients.filter(c => c.overall_status === 'completed').length;
        const shortages = clients.filter(c => c.has_shortages).length;
        
        const el = (id) => $(id);
        
        if (el('homeTotalClients')) el('homeTotalClients').textContent = totalClients;
        if (el('homeInProduction')) el('homeInProduction').textContent = inProduction;
        if (el('homeCompleted')) el('homeCompleted').textContent = completed;
        if (el('homeShortages')) el('homeShortages').textContent = shortages;
        
    } catch (error) {
        console.error('❌ Error loading home stats:', error);
    }
}

// تسجيل الدالة في الـ Router
registerPageCallback('initHome', initHome);

export default { initHome, handleHomeSearch };
/* ========================================
   🪟 REAOSADEK - Glass Module (نسخة كاملة ومصححة)
   ======================================== */

import { showToast, showLoading, hideLoading } from '../utils/helpers.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';
import { getCurrentUser } from './auth.js';


let ordersDB = [];
let suppliersList = [];
let glassTypesList = [];
let currentOrderNo = 1;

const fallbackTypes = [
    "زجاج فاميه عسلي", "زجاج فاميه رمادي", "زجاج مضلع شفاف", "مرايا ابيض.شطف.شمبوريه",
    "مرايا دائرية.شطف.شمبوريه", "زجاج شفاف", "زجاج عاكس", "زجاج كريستال",
    "زجاج مضلغ رمادي", "زجاج مصفر", "زجاج انتيك دهبي", "مرايا فاميه رمادي",
    "زجاج مضلع بورنز", "مرايا فاميه دارك", "مرايا بورنز", "مرايا انتيك سيلفر"
];

async function initGlass() {
    console.log('🪟 Init Glass Module');
    showLoading('جاري تحميل بيانات الزجاج...');

    const dateEl = document.getElementById('glOrderDate');
    if (dateEl) dateEl.value = new Date().toLocaleDateString('en-GB');

    const tbody = document.getElementById('glItemsTableBody');
    if (tbody) tbody.innerHTML = '';

    const grandTotalEl = document.getElementById('glGrandTotal');
    if (grandTotalEl) grandTotalEl.value = '';

    try {
        const [typesData, suppData] = await Promise.all([
            api.getGlassTypes(),
            api.getGlassSuppliers()
        ]);

        glassTypesList = typesData.length > 0 ? typesData.map(t => t.name) : fallbackTypes;
        suppliersList = suppData.length > 0 ? suppData.map(s => s.name) : ["هشام"];

        const suppSelect = document.getElementById('glSupplierSelect');
        if (suppSelect) {
            suppSelect.innerHTML = suppliersList.map(s => `<option value="${s}">${s}</option>`).join('');
        }

        ordersDB = await api.getGlassOrders();

        if (ordersDB.length > 0) {
            const maxOrder = Math.max(...ordersDB.map(o => parseInt(o.order_no) || 0));
            currentOrderNo = maxOrder + 1;
        }
        const serialEl = document.getElementById('glPurchaseSerial');
        if (serialEl) serialEl.value = currentOrderNo;

        addRow();
        renderDashboard();
        updateInvoiceSelect();
        hideLoading();
    } catch (error) {
        console.error(error);
        hideLoading();
        glassTypesList = fallbackTypes;
        suppliersList = ["هشام"];
        const suppSelect = document.getElementById('glSupplierSelect');
        if (suppSelect) suppSelect.innerHTML = `<option value="هشام">هشام</option>`;
        addRow();
        showToast('تم التحميل بالقائمة الافتراضية لوجود خطأ في الاتصال', 'warning');
    }
}

function switchTab(tabId) {
    ['tabOrderForm', 'tabDashboard', 'tabInvoices'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
    ['btnTabForm', 'btnTabDash', 'btnTabInv'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    if (tabId === 'orderForm') {
        document.getElementById('tabOrderForm')?.classList.remove('d-none');
        document.getElementById('btnTabForm')?.classList.add('active');
    } else if (tabId === 'dashboard') {
        document.getElementById('tabDashboard')?.classList.remove('d-none');
        document.getElementById('btnTabDash')?.classList.add('active');
        renderDashboard();
    } else if (tabId === 'invoices') {
        document.getElementById('tabInvoices')?.classList.remove('d-none');
        document.getElementById('btnTabInv')?.classList.add('active');
        updateInvoiceSelect();
    }
}

async function addNewSupplier() {
    let newSupp = prompt("أدخل اسم المورد الجديد:");
    if (newSupp && newSupp.trim() !== "") {
        try {
            showLoading("جاري الحفظ...");
            await api.addGlassSupplier(newSupp.trim());
            suppliersList.push(newSupp.trim());

            let select = document.getElementById('glSupplierSelect');
            select.innerHTML = suppliersList.map(s => `<option value="${s}">${s}</option>`).join('');
            select.value = newSupp.trim();

            hideLoading();
            showToast('تم حفظ المورد بنجاح', 'success');
        } catch (e) {
            hideLoading();
            showToast('المورد موجود مسبقاً أو حدث خطأ', 'error');
        }
    }
}

async function addNewGlassType() {
    let newType = prompt("أدخل اسم الصنف الجديد (البيان):");
    if (newType && newType.trim() !== "") {
        try {
            showLoading("جاري الحفظ...");
            await api.addGlassType(newType.trim());
            glassTypesList.push(newType.trim());

            document.querySelectorAll('.item-statement').forEach(select => {
                let currentVal = select.value;
                select.innerHTML = glassTypesList.map(item => `<option value="${item}">${item}</option>`).join('');
                select.value = currentVal;
            });

            hideLoading();
            showToast('تم حفظ الصنف بنجاح', 'success');
        } catch (e) {
            hideLoading();
            showToast('الصنف موجود مسبقاً أو حدث خطأ', 'error');
        }
    }
}

function addRow() {
    let tbody = document.getElementById('glItemsTableBody');
    if (!tbody) return;
    let rowCount = tbody.rows.length + 1;
    let optionsHtml = glassTypesList.map(item => `<option value="${item}">${item}</option>`).join('');

    let row = `<tr>
        <td class="row-index">${rowCount}</td>
        <td><select class="item-statement" style="width:100%; border:none; text-align:center; font-weight:bold;">${optionsHtml}</select></td>
        <td><input type="number" class="item-length" value="" placeholder="0"></td>
        <td><input type="number" class="item-width" value="" placeholder="0"></td>
        <td>
    <input type="number" class="gl-input item-thickness" value="5" style="color: #dc2626; font-weight: bold;">
</td>
        <td><input type="text" class="item-unit" value="qty"></td>
        <td><input type="number" class="item-qty" value="1"></td>
        <td><input type="text" class="item-notes"></td>
        <td><input type="number" class="item-total" value="" placeholder="" oninput="window.glassApp.calculateGrandTotal()"></td>
        <td class="pdf-hide-col"><button onclick="window.glassApp.deleteRow(this)" class="gl-btn-sm gl-btn-danger"><i class="fas fa-times"></i></button></td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
}

function deleteRow(btn) {
    let row = btn.closest('tr');
    let tbody = row.parentNode;
    if (tbody.rows.length > 1) {
        row.remove();
        tbody.querySelectorAll('tr').forEach((r, index) => {
            r.querySelector('.row-index').innerText = index + 1;
        });
        calculateGrandTotal();
    } else {
        alert("يجب أن يحتوي الجدول على بند واحد على الأقل.");
    }
}

function calculateGrandTotal() {
    let totals = document.querySelectorAll('.item-total');
    let grandTotal = 0;
    totals.forEach(input => {
        let val = parseFloat(input.value);
        if (!isNaN(val)) grandTotal += val;
    });
    const el = document.getElementById('glGrandTotal');
    if (el) el.value = grandTotal > 0 ? grandTotal : '';
}

function newOrder() {
    document.getElementById('glClientName').value = '';
    document.getElementById('glOrderType').value = '';
    document.getElementById('glProdCode').value = '';
    document.getElementById('glClientCode').value = '';
    document.getElementById('glGrandTotal').value = '';
    initGlass();
}
function getOrderPdfFilename() {
    const serialNo = document.getElementById('glPurchaseSerial')?.value || '';
    const clientCode = (document.getElementById('glClientCode')?.value || '').trim();
    const clientName = (document.getElementById('glClientName')?.value || 'عميل').trim();
    const rawName = `${clientCode ? clientCode + '_' : ''}${clientName}_أمر_شراء_${serialNo}`;
    return rawName.replace(/[\\/:*?"<>|]/g, '-') + '.pdf';
}
function previewPdf() {
    const element = document.getElementById('pdfContent');
    element.classList.add('pdf-export-mode');

    html2pdf().from(element).set({
        margin: 10,
        filename: getOrderPdfFilename(),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }).outputPdf('bloburl').then(url => {
        window.open(url, '_blank');
        element.classList.remove('pdf-export-mode');
    });
}

async function saveOrder(generatePdf = true) {
    let serialNo = document.getElementById('glPurchaseSerial').value;
    let supplier = document.getElementById('glSupplierSelect').value;
    let clientName = document.getElementById('glClientName').value || 'بدون اسم';
    let type = document.getElementById('glOrderType').value || 'عام';
    let prodCode = document.getElementById('glProdCode').value;
    let clientCode = document.getElementById('glClientCode').value;
    let grandTotal = parseFloat(document.getElementById('glGrandTotal').value) || 0;

    let orderData = {
        order_no: serialNo,
        production_code: prodCode,
        client_code: clientCode,
        client_name: clientName,
        order_type: type,
        supplier_name: supplier,
        order_date: new Date().toISOString().split('T')[0],
        status: 'open',
        total_value: grandTotal
    };

    let itemsData = [];
    document.querySelectorAll('#glItemsTableBody tr').forEach(row => {
        itemsData.push({
            order_no: serialNo,
            statement: row.querySelector('.item-statement').value,
            length: parseFloat(row.querySelector('.item-length').value) || 0,
            width: parseFloat(row.querySelector('.item-width').value) || 0,
            thickness: parseFloat(row.querySelector('.item-thickness').value) || 5,
            unit: row.querySelector('.item-unit').value,
            required_qty: parseFloat(row.querySelector('.item-qty').value) || 1,
            notes: row.querySelector('.item-notes').value,
            item_total: parseFloat(row.querySelector('.item-total').value) || 0
        });
    });

    try {
        showLoading('جاري الحفظ في قاعدة البيانات...');
        await api.saveGlassOrder(orderData, itemsData);
        showToast('تم الحفظ بنجاح!', 'success');

        if (generatePdf) {
            const element = document.getElementById('pdfContent');
            element.classList.add('pdf-export-mode');

            await html2pdf().from(element).set({
                margin: 10,
                filename: getOrderPdfFilename(),
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            }).save();

            element.classList.remove('pdf-export-mode');
        }

        hideLoading();
        newOrder();
    } catch (e) {
        console.error(e);
        hideLoading();
        showToast('حدث خطأ أثناء الحفظ، تأكد من اتصال قاعدة البيانات', 'error');
    }
}

// ------------------------------
// Dashboard & Invoices Logic
// ------------------------------
function renderDashboard(filteredData = ordersDB) {
    let tbody = document.getElementById('glDashboardTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let totalOrders = ordersDB.length;
    let openOrders = ordersDB.filter(o => o.status === 'open').length;
    let doneOrders = ordersDB.filter(o => o.status === 'done').length;
    let noInvoices = ordersDB.filter(o => !o.total_value || o.total_value == 0).length;

    const countersEl = document.getElementById('glSupplierCounters');
    if (countersEl) {
        countersEl.innerHTML = `
            <div class="gl-counter bg-blue-light"><p>إجمالي الأوامر</p><p>${totalOrders}</p></div>
            <div class="gl-counter bg-yellow-light"><p>لم تستلم (Open)</p><p>${openOrders}</p></div>
            <div class="gl-counter bg-green-light"><p>مستلمة (Done)</p><p>${doneOrders}</p></div>
            <div class="gl-counter bg-purple-light"><p>بدون فواتير</p><p>${noInvoices}</p></div>
        `;
    }

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="padding:15px;">لا توجد بيانات متطابقة</td></tr>`;
        return;
    }

    filteredData.forEach(order => {
        // فحص هل تم استلام كمية في الوارد أم لا
        const hasReceived = (order.glass_order_items || []).some(
            item => (parseFloat(item.received_qty) || 0) > 0
        );

        // تحديد لون الصف حسب الحالة
        let rowClass = 'gl-row-open'; // أصفر فاتح افتراضياً للـ open
        if (order.status === 'done') {
            rowClass = 'gl-row-done'; // أخضر فاتح للـ done
        } else if (hasReceived) {
            rowClass = 'gl-row-partial'; // أحمر فاتح لـ open مع وجود وارد
        }

        let statusBadge = order.status === 'open'
            ? `<span style="background:#fef08a; color:#854d0e; padding:2px 6px; border-radius:4px; font-weight:700;">open</span>`
            : `<span style="background:#bbf7d0; color:#166534; padding:2px 6px; border-radius:4px; font-weight:700;">done</span>`;

        let confirmAction = order.status === 'open'
            ? `<button onclick="window.glassApp.confirmOrder('${order.id}')" class="gl-btn-sm gl-btn-danger">Confirm</button>`
            : `<span style="color:#166534; font-weight:700;">${order.confirm_date || ''}</span>`;

        let itemsHtml = `<table class="gl-inner-items-table">
            <tr>
                <th style="width:46%;">البيان</th>
                <th style="white-space: nowrap;">الطول</th>
                <th style="white-space: nowrap;">العرض</th>
                <th style="color: #dc2626; white-space: nowrap; width: 55px; min-width: 55px;">السمك</th>
                <th style="width:18%;">مطلوب</th>
                <th style="width:18%;">وارد</th>
                <th style="width:18%;">متبقي</th>
            </tr>`;

        if (order.glass_order_items) {
            order.glass_order_items.forEach(item => {
                let remaining = (parseFloat(item.required_qty) || 0) - (parseFloat(item.received_qty) || 0);
              itemsHtml += `<tr>
                    <td>${item.statement}</td>
                    <td>${item.length || '-'}</td>
                    <td>${item.width || '-'}</td>
                    <td style="color:#dc2626; font-weight:bold;">${item.thickness || '-'}</td>
                    <td>${item.required_qty}</td>
                    <td><input type="number" value="${item.received_qty || 0}" onchange="window.glassApp.updateReceivedQty('${item.id}', this.value)"></td>
                    <td style="color:#b91c1c;">${remaining}</td>
                </tr>`;
            });
        }
        itemsHtml += `</table>`;

        let row = `<tr class="${rowClass}">
            <td>${order.order_date || '-'}</td>
            <td style="color:#1d4ed8;">${order.order_no}</td>
            <td>${order.client_code || '-'}</td>
            <td>${order.supplier_name || '-'}</td>
            <td>${order.client_name || '-'}</td>
            <td>${order.order_type || '-'}</td>
            <td>${itemsHtml}</td>
            <td>${statusBadge}</td>
            <td>${confirmAction}</td>
            <td>
                <button onclick="window.glassApp.deleteOrder('${order.id}', '${order.order_no}')" class="gl-btn-sm gl-btn-danger" title="حذف الأمر">
                    <i class="fas fa-trash"></i>
                </button>
                </td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// دالة موحدة تجيب البيانات المتفلترة (مربوطة بلوحة التحكم والـ PDF)
function getFilteredOrders() {
    let fNo = (document.getElementById('glFilterNo')?.value || '').toLowerCase();
    let fSupp = (document.getElementById('glFilterSupplier')?.value || '').toLowerCase();
    let fClient = (document.getElementById('glFilterClient')?.value || '').toLowerCase();
    let fStatus = document.getElementById('glFilterStatus')?.value || '';
    let fDateFrom = document.getElementById('glFilterDateFrom')?.value || '';
    let fDateTo = document.getElementById('glFilterDateTo')?.value || '';

    return ordersDB.filter(order => {
        let matchNo = (order.order_no || '').toString().toLowerCase().includes(fNo);
        let matchSupp = (order.supplier_name || '').toLowerCase().includes(fSupp);
        let matchClient = (order.client_name || '').toLowerCase().includes(fClient) ||
                          (order.client_code || '').toLowerCase().includes(fClient);
        let matchStatus = fStatus === "" || order.status === fStatus;

        let oDate = order.order_date || '';
        let matchFrom = !fDateFrom || (oDate && oDate >= fDateFrom);
        let matchTo = !fDateTo || (oDate && oDate <= fDateTo);

        return matchNo && matchSupp && matchClient && matchStatus && matchFrom && matchTo;
    });
}

function filterDashboard() {
    renderDashboard(getFilteredOrders());
}
function resetFilters() {
    ['glFilterNo', 'glFilterSupplier', 'glFilterClient', 'glFilterStatus', 'glFilterDateFrom', 'glFilterDateTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    renderDashboard(ordersDB);
}
// تصدير لوحة التحكم PDF حسب الفلاتر الحالية + الحالة (all / open / done)
function exportDashboardPdf(statusFilter = 'all') {
    let list = getFilteredOrders();
    let label = 'الكل';

    if (statusFilter === 'open') {
        list = list.filter(o => o.status === 'open');
        label = 'Open';
    } else if (statusFilter === 'done') {
        list = list.filter(o => o.status === 'done');
        label = 'Done';
    }

    if (list.length === 0) return showToast(`لا توجد أوامر مطابقة للفلاتر للتصدير`, 'warning');

    // إظهار فترة التاريخ في عنوان الـ PDF لو محددة
    const fDateFrom = document.getElementById('glFilterDateFrom')?.value || '';
    const fDateTo = document.getElementById('glFilterDateTo')?.value || '';
    let dateRangeText = '';
    if (fDateFrom || fDateTo) {
        dateRangeText = `<div style="font-size:12px; color:#334155; margin-top:4px;">الفترة: ${fDateFrom ? 'من ' + fDateFrom : ''} ${fDateTo ? 'إلى ' + fDateTo : ''}</div>`;
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'direction:rtl; font-family:Cairo,sans-serif; padding:15px; background:#fff;';

    let rowsHtml = list.map(o => {
        const hasRec = (o.glass_order_items || []).some(i => (parseFloat(i.received_qty) || 0) > 0);
        const bg = o.status === 'done' ? '#dcfce7' : (hasRec ? '#fee2e2' : '#fef9c3');

        const innerRows = (o.glass_order_items || []).map(i => {
            const rem = (parseFloat(i.required_qty) || 0) - (parseFloat(i.received_qty) || 0);
            return `
                <tr>
                    <td style="border:1px solid #94a3b8; padding:4px;">${i.statement || '-'}</td>
                    <td style="border:1px solid #94a3b8; padding:4px;">${i.length || '-'}</td>
                    <td style="border:1px solid #94a3b8; padding:4px;">${i.width || '-'}</td>
                    <td style="border:1px solid #94a3b8; padding:4px; color:#dc2626; font-weight:bold;">${i.thickness || '-'}</td>
                    <td style="border:1px solid #94a3b8; padding:4px;">${i.required_qty || 0}</td>
                    <td style="border:1px solid #94a3b8; padding:4px;">${i.received_qty || 0}</td>
                    <td style="border:1px solid #94a3b8; padding:4px; color:#b91c1c; font-weight:bold;">${rem}</td>
                </tr>`;
        }).join('');

        const itemsTable = `
            <table style="width:100%; border-collapse:collapse; text-align:center; font-size:11px; background:${bg};">
                <thead>
                    <tr style="background:#dbeafe; color:#1e3a8a;">
                        <th style="border:1px solid #94a3b8; padding:4px;">البيان</th>
                        <th style="border:1px solid #94a3b8; padding:4px; white-space:nowrap;">الطول</th>
                        <th style="border:1px solid #94a3b8; padding:4px; white-space:nowrap;">العرض</th>
                        <th style="border:1px solid #94a3b8; padding:4px; color:#dc2626; white-space:nowrap;">السمك</th>
                        <th style="border:1px solid #94a3b8; padding:4px; white-space:nowrap;">مطلوب</th>
                        <th style="border:1px solid #94a3b8; padding:4px; white-space:nowrap;">وارد</th>
                        <th style="border:1px solid #94a3b8; padding:4px; white-space:nowrap;">متبقي</th>
                    </tr>
                </thead>
                <tbody>${innerRows}</tbody>
            </table>`;

        return `<tr style="background:${bg}; font-weight:700;">
            <td style="border:1px solid #94a3b8; padding:5px; white-space:nowrap;">${o.order_date || '-'}</td>
            <td style="border:1px solid #94a3b8; padding:5px; color:#1d4ed8;">${o.order_no}</td>
            <td style="border:1px solid #94a3b8; padding:5px;">${o.client_code || '-'}</td>
            <td style="border:1px solid #94a3b8; padding:5px;">${o.supplier_name || '-'}</td>
            <td style="border:1px solid #94a3b8; padding:5px;">${o.client_name || '-'}</td>
            <td style="border:1px solid #94a3b8; padding:5px;">${o.order_type || '-'}</td>
            <td style="border:1px solid #94a3b8; padding:4px;">${itemsTable}</td>
            <td style="border:1px solid #94a3b8; padding:5px; min-width:80px;"></td>
        </tr>`;
    }).join('');

    wrapper.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #1d4ed8; padding-bottom:8px;">
            <div>
                <h2 style="margin:0; color:#1d4ed8; font-size:18px;">تقرير أوامر الزجاج - (${label})</h2>
                ${dateRangeText}
            </div>
            <div style="text-align:left; font-size:12px;"><strong>شركة كيتشينو للمطابخ العصرية</strong><br>${new Date().toLocaleDateString('en-GB')}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; text-align:center; font-size:12px;">
            <thead>
                <tr style="background:#1d4ed8; color:#fff;">
                    <th style="border:1px solid #1e40af; padding:6px;">التاريخ</th>
                    <th style="border:1px solid #1e40af; padding:6px;">الأمر</th>
                    <th style="border:1px solid #1e40af; padding:6px;">كود العميل</th>
                    <th style="border:1px solid #1e40af; padding:6px;">المورد</th>
                    <th style="border:1px solid #1e40af; padding:6px;">العميل</th>
                    <th style="border:1px solid #1e40af; padding:6px;">النوع</th>
                    <th style="border:1px solid #1e40af; padding:6px;">البنود والكميات</th>
                    <th style="border:1px solid #1e40af; padding:6px; min-width:80px;">الإجمالي</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
    html2pdf().from(wrapper).set({
        margin: 8,
        filename: `Glass_Dashboard_${label}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }).save();
}

// تصدير كل الحالات إلى Excel (.xls يدعم العربية والـ RTL مباشرة)
function exportDashboardExcel() {
    if (ordersDB.length === 0) return showToast('لا توجد بيانات للتصدير', 'warning');

    let rows = ordersDB.map(o => {
        const itemsStr = (o.glass_order_items || []).map(i => {
            const rem = (parseFloat(i.required_qty) || 0) - (parseFloat(i.received_qty) || 0);
            return `${i.statement} (مطلوب:${i.required_qty} / وارد:${i.received_qty || 0} / متبقي:${rem})`;
        }).join(' - ');

        return `<tr>
            <td>${o.order_date || ''}</td>
            <td>${o.order_no || ''}</td>
            <td>${o.client_code || ''}</td>
            <td>${o.supplier_name || ''}</td>
            <td>${o.client_name || ''}</td>
            <td>${o.order_type || ''}</td>
            <td>${itemsStr}</td>
            <td>${o.status || ''}</td>
            <td>${o.confirm_date || ''}</td>
            <td>${o.total_value || 0}</td>
        </tr>`;
    }).join('');

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" dir="rtl">
        <head><meta charset="UTF-8"></head>
        <body>
            <table border="1">
                <tr style="background:#1d4ed8; color:#ffffff; font-weight:bold;">
                    <th>التاريخ</th><th>رقم الأمر</th><th>كود العميل</th><th>المورد</th>
                    <th>اسم العميل</th><th>النوع</th><th>البنود والكميات</th>
                    <th>الحالة</th><th>تاريخ الاستلام</th><th>قيمة الفاتورة</th>
                </tr>
                ${rows}
            </table>
        </body>
        </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Glass_Orders_All_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
}
async function updateReceivedQty(itemId, val) {
    try {
        await api.updateGlassReceivedQty(itemId, parseFloat(val) || 0);
        showToast('تم تحديث الكمية', 'success');
        initGlass();
    } catch (e) {
        showToast('خطأ في التحديث', 'error');
    }
}

async function confirmOrder(orderId) {
    try {
        let today = new Date().toISOString().split('T')[0];
        await api.confirmGlassOrder(orderId, today);
        showToast('تم التأكيد', 'success');
        initGlass();
    } catch (e) {
        showToast('خطأ في التأكيد', 'error');
    }
}
async function deleteOrder(orderId, orderNo) {
    const user = getCurrentUser();
    if (user && (user.canDelete === false || user.role === 'glass_only')) {
        showToast('⛔ غير مصرح لك بالحذف', 'error');
        return;
    }

    if (!confirm(`هل أنت متأكد من حذف أمر الشراء رقم (${orderNo}) نهائياً؟`)) return;
    try {
        showLoading('جاري الحذف...');
        await api.deleteGlassOrder(orderId);
        showToast('تم حذف الأمر بنجاح', 'success');
        initGlass();
    } catch (e) {
        console.error(e);
        hideLoading();
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

function updateInvoiceSelect() {
    let select = document.getElementById('glInvoiceOrderSelect');
    if (!select) return;
    select.innerHTML = '<option value="">اختر أمر التوريد</option>';
    ordersDB.forEach(o => {
        select.innerHTML += `<option value="${o.id}">${o.order_no} - ${o.client_name} (${o.supplier_name})</option>`;
    });
}

async function saveInvoiceData() {
    let orderId = document.getElementById('glInvoiceOrderSelect').value;
    let value = document.getElementById('glInvoiceTotalValue').value;
    if (!orderId || !value) return showToast('يرجى اختيار الأمر وإدخال القيمة', 'warning');

    try {
        showLoading('جاري الحفظ...');
        await api.updateGlassInvoice(orderId, parseFloat(value));
        showToast('تم حفظ الفاتورة بنجاح', 'success');
        document.getElementById('glInvoiceTotalValue').value = '';
        initGlass();
    } catch (e) {
        hideLoading();
        showToast('خطأ في الحفظ', 'error');
    }
}

window.glassApp = {
    switchTab, addNewSupplier, addNewGlassType, addRow, deleteRow, newOrder, saveOrder, previewPdf,
    calculateGrandTotal, filterDashboard, resetFilters, updateReceivedQty, confirmOrder, deleteOrder, saveInvoiceData,
    exportDashboardPdf, exportDashboardExcel
};

registerPageCallback('initGlass', initGlass);
export default { initGlass };
/* ========================================
   🏭 REAOSADEK - Customers Module (Updated)
   ======================================== */

import { $, showToast, showLoading, hideLoading } from '../utils/helpers.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';

var PT = {
  currentClient: null,
  technicians: ["Mahmoud", "Yousef", "Abdel Sattar", "Mohamed Rabie"],
  stages: ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-quality']
};

function initCustomers() {
  renderAllStageTables();
  bindCustomersEvents();
  updateOverallStatusBar();
}

function bindCustomersEvents() {
  var btnSave = document.getElementById('btnSave');
  if (btnSave) btnSave.onclick = handleSave;
  
  var btnRefresh = document.getElementById('btnRefresh');
  if (btnRefresh) btnRefresh.onclick = handleRefresh;
  
  var clientCodeInput = document.getElementById('clientCode');
  if (clientCodeInput) {
    clientCodeInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    };
  }

  // برمجة زر إضافة فني
  var btnAddTech = document.getElementById('btnAddTech');
  if (btnAddTech) {
      btnAddTech.onclick = function() {
          var newTech = document.getElementById('newTech').value.trim();
          if (newTech && !PT.technicians.includes(newTech)) {
              PT.technicians.push(newTech);
              document.getElementById('newTech').value = '';
              showToast('تم إضافة الفني بنجاح', 'success');
              // تحديث كل القوائم
              document.querySelectorAll('.tech-select').forEach(sel => {
                  let opt = document.createElement('option');
                  opt.value = newTech;
                  opt.textContent = newTech;
                  sel.appendChild(opt);
              });
          }
      };
  }
}

// 🔎 البحث
async function handleSearch() {
  var clientCode = document.getElementById('clientCode').value.trim();
  if (!clientCode) return showToast('يرجى إدخال كود العميل', 'warning');
  
  try {
    showLoading('جاري الاستعلام...');
    var allClients = await api.getClients ? await api.getClients() : [];
    var client = allClients.find(c => c.client_code === clientCode);
    
    if (client) {
      PT.currentClient = client;
      document.getElementById('clientName').value = client.client_name || '';
      document.getElementById('projectName').value = client.project_name || '';
      document.getElementById('internalMaterial').value = client.internal_material || '';
      document.getElementById('internalMaterial2').value = client.internal_material_2 || '';
      document.getElementById('externalMaterial').value = client.external_material || '';
      document.getElementById('externalMaterial2').value = client.external_material_2 || '';
      document.getElementById('chkStorage').checked = client.storage || false;
      document.getElementById('chkSupply').checked = client.supply || false;
      document.getElementById('itemCount').value = client.item_count || 0;

      var items = await api.getItemsByClient ? await api.getItemsByClient(clientCode) : [];
      renderStagesWithData(items);

      updateStatusBar('✅ تم استدعاء بيانات العميل والبنود بنجاح');
      showToast('تم الاستدعاء بنجاح', 'success');
    } else {
      clearForm(false);
      updateStatusBar('⚠️ كود العميل غير مسجل - يمكنك إدخال بيانات جديدة');
      showToast('العميل غير مسجل', 'warning');
    }
    hideLoading();
  } catch (error) {
    hideLoading();
    showToast('حدث خطأ أثناء الاستدعاء', 'error');
  }
}

// 📋 رسم الجداول
function renderAllStageTables() {
    const container = document.getElementById('stagesContainer');
    if (!container) return;
    container.innerHTML = ''; 
    const stageNamesAr = {
        'cutting': 'CUTTING STAGE', 'edge': 'EDGE STAGE', 'cnc': 'CNC STAGE', 
        'pressing': 'PRESSING STAGE', 'assembly': 'ASSEMBLY STAGE', 'final-quality': 'FINAL QC STAGE'
    };

    PT.stages.forEach(stage => {
        let html = `
        <div class="stage-table-wrapper" id="wrapper-${stage}">
            <div class="stage-table-header">
                <span>${stageNamesAr[stage]}</span>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-square btn-secondary" onclick="window.toggleStageRows('${stage}')" title="إخفاء/إظهار"><i class="fas fa-eye-slash"></i></button>
                    <button type="button" class="btn-square btn-add" onclick="window.addRowToStage('${stage}')" title="إضافة بند">+</button>
                </div>
            </div>
            <table class="stage-table stage" id="table-${stage}">
                <thead>${getTableHeaderHtml(stage)}</thead>
                <tbody id="tbody-${stage}"></tbody>
            </table>
        </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function getTableHeaderHtml(stage) {
    if (stage === 'cutting' || stage === 'edge') {
        return `<tr>
            <th>بدء التشغيل</th><th>هيكل</th><th>HPL</th><th>ضلف</th><th>حالة المرحلة</th>
            <th>انتهاء التشغيل</th><th>الفني</th><th>ملاحظات</th><th>وقت التشغيل</th><th>حذف</th><th>الترتيب</th>
        </tr>`;
    } else {
        return `<tr>
            <th>بدء التشغيل</th><th>رقم البند</th><th>اسم البند</th><th>مقاسات</th>
            <th>انتهاء التشغيل</th><th>الفني</th><th>ملاحظات</th><th>تام</th><th>ناقص</th><th>حذف</th><th>الترتيب</th>
        </tr>`;
    }
}

window.addRowToStage = function(stageId, rowData = null) {
  var tbody = document.getElementById('tbody-' + stageId);
  if (!tbody) return;
  const itemId = rowData?.id || `new_${Date.now()}`;
  const status = rowData ? (rowData[`status_${stageId}`] || rowData.status || 'not_started') : 'not_started';

  const selectOptions = `
      <option value="not_started">لم يتم البدء</option>
      <option value="in_progress">تحت التشغيل</option>
      <option value="done">تم</option>
      <option value="shortage">ناقص</option>
  `;

  // فك تشفير الملاحظات المخزنة واسترجاعها
  let notesHistory = '';
  if(rowData && rowData.notes) {
     notesHistory = rowData.notes; // إذا كانت محفوظة كـ HTML من قبل
  }

  var tr = document.createElement('tr');
  tr.dataset.itemId = itemId;
  tr.dataset.stage = stageId;

  // اختيار الفني المحفوظ
  const techOptions = PT.technicians.map(t => `<option value="${t}" ${t === rowData?.technician ? 'selected' : ''}>${t}</option>`).join('');

  if (stageId === 'cutting' || stageId === 'edge') {
      tr.innerHTML = `
          <td><input type="date" class="form-input input-start" value="${rowData?.real_start ? rowData.real_start.split('T')[0] : ''}" style="width:110px;"></td>
          <td><select class="status-select sub-status input-carcass" onchange="window.checkRowStatus(this)">
              ${selectOptions.replace(`value="${rowData?.carcass || 'not_started'}"`, `value="${rowData?.carcass || 'not_started'}" selected`)}
          </select></td>
          <td><select class="status-select sub-status input-hpl" onchange="window.checkRowStatus(this)">
              ${selectOptions.replace(`value="${rowData?.hpl || 'not_started'}"`, `value="${rowData?.hpl || 'not_started'}" selected`)}
          </select></td>
          <td><select class="status-select sub-status input-doors" onchange="window.checkRowStatus(this)">
              ${selectOptions.replace(`value="${rowData?.doors || 'not_started'}"`, `value="${rowData?.doors || 'not_started'}" selected`)}
          </select></td>
          <td><select class="status-select main-status input-status" onchange="window.checkRowStatus(this)">
              ${selectOptions.replace(`value="${status}"`, `value="${status}" selected`)}
          </select></td>
          <td><input type="date" class="form-input input-end" value="${rowData?.real_end ? rowData.real_end.split('T')[0] : ''}" style="width:110px;"></td>
          <td><select class="tech-select form-input input-tech"><option value="">الفني</option>${techOptions}</select></td>
          <td>
              <div class="notes-container">
                  <div class="notes-history" id="history-${stageId}-${itemId}">${notesHistory}</div>
                  <div class="notes-input-group">
                      <input type="text" id="noteInput-${stageId}-${itemId}" placeholder="اكتب ملاحظة...">
                      <button type="button" class="btn-add-note" onclick="window.addNote('${stageId}', '${itemId}')">+</button>
                  </div>
              </div>
          </td>
          <td><button class="btn btn-sm btn-primary">يوم 1</button></td>
          <td><button class="btn-square btn-del" onclick="this.closest('tr').remove(); updateOverallStatusBar();"><i class="fas fa-minus-circle"></i></button></td>
          <td>
              <div class="order-controls">
                  <button type="button" class="btn-order" onclick="window.moveRowUp(this)">▲</button>
                  <button type="button" class="btn-order" onclick="window.moveRowDown(this)">▼</button>
              </div>
          </td>
      `;
  } else {
      let isDone = status === 'done' ? 'checked' : '';
      let isShortage = status === 'shortage' ? 'checked' : '';
      tr.innerHTML = `
          <td><input type="date" class="form-input input-start" value="${rowData?.real_start ? rowData.real_start.split('T')[0] : ''}" style="width:110px;"></td>
          <td><input type="text" class="form-input input-code" value="${rowData?.item_code || ''}" style="width:70px;"></td>
          <td><input type="text" class="form-input input-name" value="${rowData?.item_name || ''}" style="width:130px;"></td>
          <td>
             <div style="display:flex;gap:2px;justify-content:center;">
                <input type="number" class="input-w" value="${rowData?.width || ''}" placeholder="ع" style="width:45px;" />
                <input type="number" class="input-d" value="${rowData?.depth || ''}" placeholder="ع" style="width:45px;" />
                <input type="number" class="input-h" value="${rowData?.height || ''}" placeholder="ر" style="width:45px;" />
             </div>
          </td>
          <td><input type="date" class="form-input input-end" value="${rowData?.real_end ? rowData.real_end.split('T')[0] : ''}" style="width:110px;"></td>
          <td><select class="tech-select form-input input-tech"><option value="">الفني</option>${techOptions}</select></td>
          <td>
              <div class="notes-container">
                  <div class="notes-history" id="history-${stageId}-${itemId}">${notesHistory}</div>
                  <div class="notes-input-group">
                      <input type="text" id="noteInput-${stageId}-${itemId}" placeholder="اضف...">
                      <button type="button" class="btn-add-note" onclick="window.addNote('${stageId}', '${itemId}')">+</button>
                  </div>
              </div>
          </td>
          <td><input type="checkbox" class="cb-done" ${isDone} onchange="window.toggleCheckboxStatus(this, 'done')"></td>
          <td><input type="checkbox" class="cb-shortage" ${isShortage} onchange="window.toggleCheckboxStatus(this, 'shortage')"></td>
          <td><button class="btn-square btn-del" onclick="this.closest('tr').remove(); updateOverallStatusBar();"><i class="fas fa-minus-circle"></i></button></td>
          <td>
              <div class="order-controls">
                  <button type="button" class="btn-order" onclick="window.moveRowUp(this)">▲</button>
                  <button type="button" class="btn-order" onclick="window.moveRowDown(this)">▼</button>
              </div>
          </td>
      `;
  }
  tbody.appendChild(tr);
};

// ═══════════════════════════════════════════════════════════
// اللوجيك والتلوين
// ═══════════════════════════════════════════════════════════
window.moveRowUp = function(btn) {
    const row = btn.closest('tr');
    if (row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
};

window.moveRowDown = function(btn) {
    const row = btn.closest('tr');
    if (row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
};

window.toggleStageRows = function(stageId) {
    const tbody = document.getElementById('tbody-' + stageId);
    const btn = event.currentTarget;
    if (tbody) {
        tbody.style.display = tbody.style.display === 'none' ? '' : 'none';
        btn.innerHTML = tbody.style.display === 'none' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
};

function renderStagesWithData(items) {
  PT.stages.forEach(s => {
      let tb = document.getElementById('tbody-' + s);
      if(tb) tb.innerHTML = '';
  });
  
  items.forEach(item => {
    var sName = item.stage_name ? item.stage_name.toLowerCase().replace(' ', '-') : 'cutting';
    window.addRowToStage(sName, item);
  });
  
  // تلوين الصفوف فور الاستدعاء
  setTimeout(() => {
      document.querySelectorAll('#stagesContainer tr').forEach(row => {
          let mainSelect = row.querySelector('.main-status');
          if (mainSelect) {
              window.checkRowStatus(mainSelect, false); 
          } else {
              let cbShortage = row.querySelector('.cb-shortage');
              let cbDone = row.querySelector('.cb-done');
              if (cbShortage && cbShortage.checked) row.classList.add('row-status-shortage');
              else if (cbDone && cbDone.checked) row.classList.add('row-status-done');
          }
      });
      updateOverallStatusBar();
  }, 100);
}

window.checkRowStatus = function(selectElement, triggerAlert = true) {
    const row = selectElement.closest('tr');
    const stage = row.dataset.stage;
    const clientId = document.getElementById('clientCode').value; 
    
    const selects = Array.from(row.querySelectorAll('select.status-select'));
    let hasShortage = selects.some(s => s.value === 'shortage');
    
    row.classList.remove('row-status-done', 'row-status-shortage', 'row-status-progress');

    if (hasShortage) {
        row.classList.add('row-status-shortage');
        if(triggerAlert) triggerShortageAlert(clientId, stage, row);
    } else if (selectElement.value === 'done' && selectElement.classList.contains('main-status')) {
        row.classList.add('row-status-done');
    } else if (selects.some(s => s.value === 'in_progress' || s.value === 'done')) {
       row.classList.add('row-status-progress');
       if(selectElement.classList.contains('main-status') && selectElement.value === 'not_started') row.classList.remove('row-status-progress');
    }
    if(triggerAlert) updateOverallStatusBar();
};

window.toggleCheckboxStatus = function(checkbox, type, triggerAlert = true) {
    const row = checkbox.closest('tr');
    const stage = row.dataset.stage;
    const clientId = document.getElementById('clientCode').value;

    row.classList.remove('row-status-done', 'row-status-shortage', 'row-status-progress');

    if (type === 'shortage' && checkbox.checked) {
        let cbDone = row.querySelector('.cb-done');
        if(cbDone) cbDone.checked = false;
        row.classList.add('row-status-shortage');
        if(triggerAlert) triggerShortageAlert(clientId, stage, row);
    } else if (type === 'done' && checkbox.checked) {
        let cbShort = row.querySelector('.cb-shortage');
        if(cbShort) cbShort.checked = false;
        row.classList.add('row-status-done');
    }
    if(triggerAlert) updateOverallStatusBar();
};

window.addNote = function(stage, itemId) {
    const input = document.getElementById(`noteInput-${stage}-${itemId}`);
    const historyDiv = document.getElementById(`history-${stage}-${itemId}`);
    
    if (input && input.value.trim() !== '') {
        const date = new Date().toLocaleDateString('ar-EG');
        historyDiv.innerHTML += `<div><strong style="color:#0d6efd">[${date}]</strong> ${input.value}</div>`;
        input.value = ''; 
    }
};

function updateOverallStatusBar() {
    const statusBar = document.getElementById('clientProgressLine');
    if(!statusBar) return;
    
    let html = '<div class="status-pills">';
    PT.stages.forEach(stage => {
        const table = document.getElementById(`table-${stage}`);
        let pillClass = '';
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            const doneRows = table.querySelectorAll('tbody tr.row-status-done');
            if(rows.length === 0) pillClass = '';
            else if (rows.length === doneRows.length) pillClass = 'active'; 
            else if (doneRows.length > 0 || table.querySelectorAll('tbody tr.row-status-progress').length > 0) pillClass = 'progress'; 
            else if (table.querySelectorAll('tbody tr.row-status-shortage').length > 0) pillClass = 'shortage';
        }
        html += `<span class="status-pill ${pillClass}">${stage}</span>`;
    });
    html += '</div>';
    statusBar.innerHTML = html;
}

// تسجيل النقص فعلياً في قاعدة البيانات
async function triggerShortageAlert(clientCode, stage, row) {
    showToast(`تم تسجيل نقص في مرحلة ${stage}!`, 'warning');
    if(window.supabase) {
        try {
            await window.supabase.from('shortages').insert([{
                client_code: clientCode,
                stage: stage,
                status: 'pending',
                priority: 'high',
                details: `نقص مسجل أوتوماتيكياً من صفحة العملاء`
            }]);
        } catch(e) { console.error("Error saving shortage:", e); }
    }
}

// 💾 الحفظ (الآن يجمع الصفوف والملاحظات)
async function handleSave() {
  var clientCode = document.getElementById('clientCode').value.trim();
  if (!clientCode) return showToast('يرجى إدخال كود العميل', 'warning');
  
  try {
    showLoading('جاري الحفظ...');
    
    // 1. حفظ بيانات العميل الأساسية
    var clientData = {
      client_code: clientCode,
      client_name: document.getElementById('clientName').value.trim(),
      project_name: document.getElementById('projectName').value.trim(),
      internal_material: document.getElementById('internalMaterial').value,
      internal_material_2: document.getElementById('internalMaterial2').value,
      external_material: document.getElementById('externalMaterial').value,
      external_material_2: document.getElementById('externalMaterial2').value,
      storage: document.getElementById('chkStorage').checked,
      supply: document.getElementById('chkSupply').checked,
      item_count: parseInt(document.getElementById('itemCount').value) || 0
    };
    
    if (api.saveClient) await api.saveClient(clientData);

    // 2. تجميع وحفظ جميع بنود المراحل والملاحظات
    let itemsToSave = [];
    document.querySelectorAll('#stagesContainer tr[data-stage]').forEach(row => {
        const stage = row.dataset.stage;
        let itemObj = {
            client_code: clientCode,
            stage_name: stage,
            notes: row.querySelector('.notes-history')?.innerHTML || '', // استخراج الملاحظات
            technician: row.querySelector('.input-tech')?.value || '',
            real_start: row.querySelector('.input-start')?.value || null,
            real_end: row.querySelector('.input-end')?.value || null
        };

        if (stage === 'cutting' || stage === 'edge') {
            itemObj.carcass = row.querySelector('.input-carcass')?.value || '';
            itemObj.hpl = row.querySelector('.input-hpl')?.value || '';
            itemObj.doors = row.querySelector('.input-doors')?.value || '';
            itemObj.status = row.querySelector('.input-status')?.value || 'not_started';
            itemObj[`status_${stage}`] = itemObj.status;
        } else {
            itemObj.item_code = row.querySelector('.input-code')?.value || '';
            itemObj.item_name = row.querySelector('.input-name')?.value || '';
            itemObj.width = row.querySelector('.input-w')?.value || null;
            itemObj.depth = row.querySelector('.input-d')?.value || null;
            itemObj.height = row.querySelector('.input-h')?.value || null;
            
            let isDone = row.querySelector('.cb-done')?.checked;
            let isShortage = row.querySelector('.cb-shortage')?.checked;
            itemObj.status = isShortage ? 'shortage' : (isDone ? 'done' : 'not_started');
            itemObj[`status_${stage}`] = itemObj.status;
        }
        itemsToSave.push(itemObj);
    });

    // إرسال البنود للباك إند (إذا كانت لديك دالة API لذلك)
    if(window.supabase && itemsToSave.length > 0) {
       // مثال مبسط لحفظ البنود
       await window.supabase.from('production_items').delete().eq('client_code', clientCode);
       await window.supabase.from('production_items').insert(itemsToSave);
    }
    
    updateStatusBar('✅ تم حفظ بيانات العميل والبنود بنجاح');
    showToast('تم الحفظ بنجاح', 'success');
    hideLoading();
  } catch (error) {
    console.error('Save Error:', error);
    hideLoading();
    showToast('حدث خطأ أثناء الحفظ', 'error');
  }
}

function handleRefresh() {
  clearForm(true);
  updateStatusBar('🔄 تم إعادة تعيين النموذج');
}

function clearForm(clearCode = true) {
  if(clearCode) document.getElementById('clientCode').value = '';
  document.getElementById('clientName').value = '';
  document.getElementById('projectName').value = '';
  document.getElementById('internalMaterial').value = '';
  document.getElementById('internalMaterial2').value = '';
  document.getElementById('externalMaterial').value = '';
  document.getElementById('externalMaterial2').value = '';
  document.getElementById('chkStorage').checked = false;
  document.getElementById('chkSupply').checked = false;
  document.getElementById('itemCount').value = 0;
  PT.stages.forEach(s => {
    let tb = document.getElementById('tbody-' + s);
    if(tb) tb.innerHTML = '';
  });
  updateOverallStatusBar();
}

function updateStatusBar(msg) {
  var bar = document.getElementById('statusBar');
  if (bar) bar.textContent = msg;
}

registerPageCallback('initCustomers', initCustomers);
export default { initCustomers };
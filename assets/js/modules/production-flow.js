/* ========================================
   🏭 REAOSADEK - Production Flow Module (مرايا + فلاتر وعدادات تفاعلية)
   ======================================== */

import { $, qsa, showToast, showLoading, hideLoading } from '../utils/helpers.js';
import { api } from './api.js';
import { registerPageCallback } from './router.js';

var PF = {
  data: [],
  filtered: [],
  filter: 'all',
  dashboardFilter: 'all' // فلتر لوحة التحكم
};

function initProductionFlow() {
  console.log('🏭 Init Production Flow');
  showLoading('جاري تحميل البيانات...');
  
  api.getProductionFlowData().then(function(data) {
    PF.data = data || [];
    PF.filtered = PF.data.slice();
    console.log('✅ Data ready:', PF.data.length, 'clients');
    render();
    bindEvents();
    setupDashboardControls(); // تفعيل الكروت والفلاتر
    hideLoading();
  }).catch(function(err) {
    console.error('❌ Error:', err);
    hideLoading();
    showToast('حدث خطأ أثناء تحميل البيانات', 'error');
  });
}

function getStageVal(client, stage) {
  var map = {
    'cutting': client.stage_status_cutting || client.cutting,
    'edge': client.stage_status_edge || client.edge,
    'cnc': client.stage_status_cnc || client.cnc,
    'pressing': client.stage_status_pressing || client.pressing,
    'assembly': client.stage_status_assembly || client.assembly,
    'final-qc': client.stage_status_finalQC || client.stage_status_final_quality || client['final-qc']
  };
  var v = map[stage];
  if (v === 'done' || v === '✅') return 'done';
  if (v === 'progress' || v === 'inprogress' || v === '⏳') return 'progress';
  if (v === 'shortage' || v === '🔴') return 'shortage';
  return 'not-started';
}

function getCurrentStage(client) {
  var stages = ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc'];
  var allDone = true;
  var hasStarted = false;
  
  for (var i = 0; i < stages.length; i++) {
    if (getStageVal(client, stages[i]) !== 'done') { allDone = false; }
    if (getStageVal(client, stages[i]) !== 'not-started') { hasStarted = true; }
  }
  if (allDone) return 'done';
  if (!hasStarted) return 'not_started';
  
  for (var i = stages.length - 1; i >= 0; i--) {
    if (getStageVal(client, stages[i]) === 'progress' || getStageVal(client, stages[i]) === 'shortage') return stages[i];
  }
  
  // إرجاع أول مرحلة لم تبدأ كالمرحلة الحالية
  for (var i = 0; i < stages.length; i++) {
    if (getStageVal(client, stages[i]) === 'not-started') return stages[i];
  }
  return 'cutting';
}

function getProgress(client) {
  var cols = ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc'];
  var done = 0;
  for (var i = 0; i < cols.length; i++) {
    if (getStageVal(client, cols[i]) === 'done') done++;
  }
  return Math.round((done / cols.length) * 100);
}

function buildTableHTML(list) {
  if (list.length === 0) {
    return '<tr><td colspan="12" style="text-align:center;padding:20px;">لا توجد بيانات متطابقة</td></tr>';
  }
  
  var rows = [];
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    var prog = getProgress(c);
    var sup = c.supply ? '✅' : '⏳';
    var ship = c.storage ? '✅' : '⏳';
    
    var row = '<tr>';
    row += '<td><b>' + (c.client_code || c.code || '-') + '</b></td>';
    row += '<td>' + (c.client_name || c.name || '-') + '</td>';
    row += '<td>' + (c.project_name || c.project || '-') + '</td>';
    
    var stagesList = ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc'];
    for (var j = 0; j < stagesList.length; j++) {
      var st = getStageVal(c, stagesList[j]);
      var cls = 'empty', txt = '-';
      if (st === 'done') { cls = 'done'; txt = 'done'; }
      else if (st === 'progress') { cls = 'progress'; txt = 'progress'; }
      else if (st === 'shortage') { cls = 'shortage" style="background-color:#dc3545; color:white;'; txt = 'shortage'; }
      
      row += '<td><span class="sc ' + cls + '">' + txt + '</span></td>';
    }
    
    row += '<td><div class="pbar"><div class="pfill" style="width:' + prog + '%">' + prog + '%</div></div></td>';
    row += '<td>' + sup + '</td>';
    row += '<td>' + ship + '</td>';
    row += '</tr>';
    
    rows.push(row);
  }
  return rows.join('');
}

function render() {
  var total = PF.data.length;
  var inProd = 0, comp = 0, shortages = 0;
  var byStage = { cutting:0, edge:0, cnc:0, pressing:0, assembly:0, 'final-qc':0, done:0 };
  
  var stagesList = ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc'];
  
  for (var i = 0; i < PF.data.length; i++) {
    var c = PF.data[i];
    var stage = getCurrentStage(c);
    
    // فحص النواقص
    var hasShortage = false;
    for (var j = 0; j < stagesList.length; j++) {
       if (getStageVal(c, stagesList[j]) === 'shortage') { hasShortage = true; break; }
    }
    if (hasShortage) shortages++;

    if (stage === 'done') { comp++; byStage.done++; }
    else if (stage !== 'not_started') { 
        inProd++; 
        if (byStage[stage] !== undefined) byStage[stage]++; 
    }
  }
  
  var el = function(id) { return document.getElementById(id); };
  
  // 1. تحديث عدادات Production Flow
  if (el('pfTotal')) el('pfTotal').textContent = total;
  if (el('pfInProd')) el('pfInProd').textContent = inProd;
  if (el('pfCompleted')) el('pfCompleted').textContent = comp;
  
  var stageKeys = ['cutting', 'edge', 'cnc', 'pressing', 'assembly', 'final-qc', 'done'];
  var stageIds = ['Cutting', 'Edge', 'Cnc', 'Pressing', 'Assembly', 'FinalQc', 'Done'];
  for(var k=0; k<stageKeys.length; k++) {
    if(el('pf' + stageIds[k])) el('pf' + stageIds[k]).textContent = byStage[stageKeys[k]] || 0;
    if(el('f' + stageIds[k])) el('f' + stageIds[k]).textContent = byStage[stageKeys[k]] || 0;
  }
  
  // 2. تحديث عدادات Overall Production
  var updateTxt = function(sel, val) { 
      var n = document.querySelector(sel); 
      if(n) n.textContent = val; 
  };
  
  if (el('statTotalClients')) el('statTotalClients').textContent = total;
  if (el('statInProduction')) el('statInProduction').textContent = inProd;
  if (el('statCompleted')) el('statCompleted').textContent = comp;
  
  updateTxt('.stat-total .dashboard-stat-value', total);
  updateTxt('.stat-in-production .dashboard-stat-value', inProd);
  updateTxt('.stat-completed .dashboard-stat-value', comp);
  updateTxt('.stat-shortages .dashboard-stat-value', shortages);
  
  updateTxt('.stage-cutting .stage-card-count', byStage['cutting'] || 0);
  updateTxt('.stage-edge .stage-card-count', byStage['edge'] || 0);
  updateTxt('.stage-cnc .stage-card-count', byStage['cnc'] || 0);
  updateTxt('.stage-pressing .stage-card-count', byStage['pressing'] || 0);
  updateTxt('.stage-assembly .stage-card-count', byStage['assembly'] || 0);
  updateTxt('.stage-final-qc .stage-card-count', byStage['final-qc'] || 0);
  updateTxt('.stage-done .stage-card-count', byStage['done'] || 0);

  // 3. تحديث الجداول
  var pfBody = el('pfBody');
  var overallBody = el('productionFlowBody');
  
  if (pfBody) pfBody.innerHTML = buildTableHTML(PF.filtered); 
  
  if (overallBody) {
      var dashData = PF.data;
      if (PF.dashboardFilter !== 'all') {
          dashData = PF.data.filter(function(c) {
              if (PF.dashboardFilter === 'done') return getCurrentStage(c) === 'done';
              
              if (PF.dashboardFilter === 'progress') {
                  return stagesList.some(s => getStageVal(c, s) === 'progress');
              }
              
              if (PF.dashboardFilter === 'not_started') {
                  return stagesList.every(s => getStageVal(c, s) === 'not-started');
              }
              
              if (PF.dashboardFilter === 'shortage') {
                  return stagesList.some(s => getStageVal(c, s) === 'shortage');
              }

              return getCurrentStage(c) === PF.dashboardFilter; // للمراحل الفردية
          });
      }
      overallBody.innerHTML = buildTableHTML(dashData);
      
      // تحديث مظهر الـ Dropdown ليتوافق مع العداد المضغوط
      var sel = document.getElementById('dashFilterSelect');
      if (sel) {
          var matchingOpt = sel.querySelector(`option[value="${PF.dashboardFilter}"]`);
          if (matchingOpt) matchingOpt.selected = true;
          else sel.value = 'all'; // لو ضغط على مرحلة معينة ترجع للكل بصرياً
      }
  }
}

function applyFilter() {
  if (PF.filter === 'all') {
    PF.filtered = PF.data.slice();
  } else {
    PF.filtered = [];
    for (var i = 0; i < PF.data.length; i++) {
      var c = PF.data[i];
      if (getCurrentStage(c) === PF.filter) {
        PF.filtered.push(c);
      }
    }
  }
  render();
}

function bindEvents() {
  var btns = qsa('.pf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].onclick = function(e) {
      PF.filter = e.currentTarget.dataset.filter;
      btns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      applyFilter();
    };
  }
  
  var cards = qsa('.pf-stage-box');
  for (var i = 0; i < cards.length; i++) {
    cards[i].onclick = function(e) {
      PF.filter = e.currentTarget.dataset.stage;
      btns.forEach(b => {
        b.classList.remove('active');
        if (b.dataset.filter === PF.filter) b.classList.add('active');
      });
      applyFilter();
    };
  }
}

// تجهيز أزرار الداشبورد (العدادات العلوية) لتفلتر الجدول
function setupDashboardControls() {
    var actionsDiv = document.querySelector('.production-table-actions');
    if (actionsDiv && !actionsDiv.dataset.setup) {
        actionsDiv.dataset.setup = "true";
        
        // 1. إنشاء قائمة الفلتر المتطابقة مع الحالات المطلوبة
        actionsDiv.innerHTML = `
            <select id="dashFilterSelect" class="form-input" style="width:auto; display:inline-block; padding:4px 10px; height:32px; border:1px solid #0d6efd; color:#0d6efd; font-weight:bold; border-radius:4px; margin-inline-end:8px; cursor:pointer;">
                <option value="all">🔍 عرض الكل</option>
                <option value="done">✅ مكتمل (Done)</option>
                <option value="progress">⏳ قيد الإنتاج (Progress)</option>
                <option value="not_started">⚪ لم يتم البدء (Not Started)</option>
            </select>
            <button id="dashRefreshBtn" class="btn btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:5px;"><i class="fas fa-sync"></i> تحديث</button>
        `;

        document.getElementById('dashFilterSelect').onchange = function(e) {
            PF.dashboardFilter = e.target.value;
            render(); 
        };

        document.getElementById('dashRefreshBtn').onclick = function() {
            initProductionFlow(); 
            showToast('تم تحديث البيانات', 'info');
        };
    }

    // 2. ربط العدادات العلوية للفلترة أو التوجيه (تفاعلية)
    var bindCardClick = function(selector, filterValue) {
        var card = document.querySelector(selector);
        if (card) {
            card.style.cursor = 'pointer'; // تغيير مؤشر الماوس
            card.onclick = function() {
                if (filterValue === 'goto_shortages') {
                    // الانتقال الفوري لصفحة النواقص
                    var shortageLink = document.querySelector('.sidebar-item[data-page="shortages"]');
                    if (shortageLink) shortageLink.click();
                    else window.location.hash = '#shortages';
                } else {
                    PF.dashboardFilter = filterValue;
                    render();
                }
            };
            // تأثير التحويم
            card.onmouseenter = () => card.style.transform = 'translateY(-3px)';
            card.onmouseleave = () => card.style.transform = 'translateY(0)';
        }
    };

    bindCardClick('.stat-total', 'all');
    bindCardClick('.stat-in-production', 'progress');
    bindCardClick('.stat-completed', 'done');
    bindCardClick('.stat-shortages', 'goto_shortages'); // الانتقال لصفحة النواقص

    bindCardClick('.stage-cutting', 'cutting');
    bindCardClick('.stage-edge', 'edge');
    bindCardClick('.stage-cnc', 'cnc');
    bindCardClick('.stage-pressing', 'pressing');
    bindCardClick('.stage-assembly', 'assembly');
    bindCardClick('.stage-final-qc', 'final-qc');
    bindCardClick('.stage-done', 'done');
}

window.syncProductionTables = initProductionFlow;
registerPageCallback('initProductionFlow', initProductionFlow);
registerPageCallback('initDashboard', initProductionFlow);

export default { initProductionFlow };
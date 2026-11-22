/* ========================================
   🔌 REAOSADEK - Supabase API Layer (النسخة النهائية المطابقة 100% لقاعدة البيانات)
   ======================================== */
   
import { SUPABASE_CONFIG, STAGES } from '../config.js';

const supabase = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

// 🌟 1. إضافة متغيرات الكاش هنا (لمنع تكرار الطلبات الخانقة للسيرفر)
let cachedClients = null;
let lastFetchTime = 0;

class ApiClient {
  
  // ═══════════════════════════════════════
  // 👥 0. جدول العملاء الأساسي
  // ═══════════════════════════════════════
  async getClients() {
    // 🌟 2. التحقق من الكاش قبل عمل أي طلب جديد (5 دقائق = 300000 ملي ثانية)
    const now = Date.now();
    if (cachedClients && (now - lastFetchTime < 300000)) {
        console.log('⚡ Loading clients from Cache (Fast Load)...');
        return cachedClients;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // 🌟 3. حفظ البيانات المجلوبة في الكاش للاستخدام القادم
      cachedClients = data || [];
      lastFetchTime = Date.now();
      
      return cachedClients;
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      return [];
    }
  }
  // 1. حفظ بنود الإنتاج والملاحظات والحالات
  async saveProductionItems(items, clientCode) {
    try {
      // حذف البنود القديمة لنفس العميل لتحديثها
      await supabase.from('production_items').delete().eq('client_code', clientCode);
      
      // إدخال البنود الجديدة بالتعديلات
      if (items && items.length > 0) {
        const { error } = await supabase.from('production_items').insert(items);
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('❌ Error saving items:', error);
      throw error;
    }
  }
  // --- دوال الموردين والأصناف (قسم الزجاج) ---
  async getGlassTypes() {
    const db = window.supabase || this.supabase || supabase;
    const { data } = await db.from('glass_types').select('name').order('created_at');
    return data || [];
  }

  async addGlassType(name) {
    const db = window.supabase || this.supabase || supabase;
    const { error } = await db.from('glass_types').insert([{ name }]);
    if (error) throw error;
  }

  async getGlassSuppliers() {
    const db = window.supabase || this.supabase || supabase;
    const { data } = await db.from('glass_suppliers').select('name').order('created_at');
    return data || [];
  }

  async addGlassSupplier(name) {
    const db = window.supabase || this.supabase || supabase;
    const { error } = await db.from('glass_suppliers').insert([{ name }]);
    if (error) throw error;
  }

  // 2. تسجيل النواقص
  async addShortage(shortageData) {
    try {
      const { error } = await supabase.from('shortages').insert([shortageData]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error adding shortage:', error);
      throw error;
    }
  }
  // ==========================================
  // 🪟 قسم الزجاج (أوامر التوريد)
  // ==========================================

  async getGlassTypes() {
    const { data, error } = await supabase.from('glass_types').select('name').order('created_at');
    if (error) throw error;
    return data || [];
  }

  async addGlassType(name) {
    const { error } = await supabase.from('glass_types').insert([{ name }]);
    if (error) throw error;
  }

  async getGlassSuppliers() {
    const { data, error } = await supabase.from('glass_suppliers').select('name').order('created_at');
    if (error) throw error;
    return data || [];
  }

  async addGlassSupplier(name) {
    const { error } = await supabase.from('glass_suppliers').insert([{ name }]);
    if (error) throw error;
  }

  async getGlassOrders() {
    try {
      const { data, error } = await supabase
        .from('glass_orders')
        .select('*, glass_order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching glass orders:', error);
      throw error;
    }
  }

  async saveGlassOrder(orderData, itemsData) {
    try {
      const { data: order, error: orderErr } = await supabase
        .from('glass_orders')
        .insert([orderData])
        .select()
        .single();
      if (orderErr) throw orderErr;

      itemsData.forEach(item => item.order_id = order.id);
      const { error: itemsErr } = await supabase
        .from('glass_order_items')
        .insert(itemsData);
      if (itemsErr) throw itemsErr;

      return true;
    } catch (error) {
      console.error('❌ Error saving glass order:', error);
      throw error;
    }
  }

  async updateGlassReceivedQty(itemId, qty) {
    const { error } = await supabase.from('glass_order_items').update({ received_qty: qty }).eq('id', itemId);
    if (error) throw error;
    return true;
  }

  async confirmGlassOrder(orderId, date) {
    const { error } = await supabase.from('glass_orders').update({ status: 'done', confirm_date: date }).eq('id', orderId);
    if (error) throw error;
    return true;
  }

  async updateGlassInvoice(orderId, value) {
    const { error } = await supabase.from('glass_orders').update({ total_value: value }).eq('id', orderId);
    if (error) throw error;
    return true;
  }
  async deleteGlassOrder(orderId) {
    // حذف البنود المرتبطة بالأمر أولاً
    const { error: itemsErr } = await supabase
      .from('glass_order_items')
      .delete()
      .eq('order_id', orderId);
    if (itemsErr) throw itemsErr;

    // حذف الأمر الأساسي
    const { error: orderErr } = await supabase
      .from('glass_orders')
      .delete()
      .eq('id', orderId);
    if (orderErr) throw orderErr;

    return true;
  }
  // ═══════════════════════════════════════
  // 👥 1. Clients & Stage Status API (مدمج)
  // ═══════════════════════════════════════
  async getProductionFlowData() {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('client_code, client_name, project_name, storage, supply, item_count, created_at')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      const { data: statusData, error: statusError } = await supabase
        .from('production_stage_status')
        .select('client_code, stage_status_cutting, stage_status_edge, stage_status_cnc, stage_status_pressing, stage_status_assembly, stage_status_finalQC, status')
        .order('created_at', { ascending: false });

      if (statusError) throw statusError;

      const mergedData = (clientsData || []).map(client => {
        const status = (statusData || []).find(s => s.client_code === client.client_code);
        
        return {
          client_code: client.client_code,
          client_name: client.client_name || 'غير محدد',
          project_name: client.project_name || 'غير محدد',
          storage: client.storage || false,
          supply: client.supply || false,
          item_count: client.item_count || 0,
          stage_status_cutting: status ? status.stage_status_cutting : '-',
          stage_status_edge: status ? status.stage_status_edge : '-',
          stage_status_cnc: status ? status.stage_status_cnc : '-',
          stage_status_pressing: status ? status.stage_status_pressing : '-',
          stage_status_assembly: status ? status.stage_status_assembly : '-',
          stage_status_finalQC: status ? status.stage_status_finalQC : '-',
          overall_status: status ? status.status : 'in-progress'
        };
      });

      return mergedData;
    } catch (error) {
      console.error('❌ Error fetching production flow data:', error);
      throw error;
    }
  }

  async getProjects() {
    const { data, error } = await supabase
      .from('production_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const projectsMap = {};
    (data || []).forEach(item => {
      if (!projectsMap[item.client_code]) {
        projectsMap[item.client_code] = {
          id: item.client_code,
          clientCode: item.client_code,
          clientName: item.client_name,
          projectName: item.client_name,
          items: [],
          createdAt: item.created_at
        };
      }
      projectsMap[item.client_code].items.push({
        id: item.id,
        code: item.item_code,
        name: item.item_name,
        width: item.width,
        depth: item.depth,
        height: item.height,
        quantity: item.quantity,
        stage: item.stage_name ? item.stage_name.toLowerCase().replace(' ', '-') : 'cutting',
        technician: item.technician,
        status: item.is_done ? 'completed' : 'in-progress',
        hasIssue: item.has_issue,
        notes: item.notes
      });
    });

    return Object.values(projectsMap).map(p => ({
      ...p,
      currentStage: this._calculateCurrentStage(p.items),
      overallStatus: p.items.every(i => i.status === 'completed') ? 'completed' : 'in-progress'
    }));
  }

  async getProjectsByStage(stageId) {
    const normalizedStage = stageId.replace('-', ' ');
    const { data, error } = await supabase
      .from('production_items')
      .select('*')
      .ilike('stage_name', `%${normalizedStage}%`);
    
    if (error) throw error;

    const projectsMap = {};
    (data || []).forEach(item => {
      if (!projectsMap[item.client_code]) {
        projectsMap[item.client_code] = {
          id: item.client_code,
          clientCode: item.client_code,
          clientName: item.client_name,
          projectName: item.client_name,
          items: [],
          currentStage: stageId,
          overallStatus: 'in-progress',
          createdAt: item.created_at
        };
      }
      projectsMap[item.client_code].items.push({
        id: item.id,
        code: item.item_code,
        name: item.item_name,
        width: item.width, depth: item.depth, height: item.height,
        quantity: item.quantity,
        stage: stageId,
        technician: item.technician,
        status: item.is_done ? 'completed' : 'in-progress'
      });
    });
    return Object.values(projectsMap);
  }

  async updateItemStage(itemId, newStage) {
    const { data, error } = await supabase
      .from('production_items')
      .update({ 
        stage_name: newStage.replace('-', ' '),
        status: 'in-progress'
      })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getProjectStats() {
    const { data, error } = await supabase.from('production_items').select('stage_name, is_done');
    if (error) throw error;
    
    const stats = { total: 0, inProduction: 0, completed: 0, byStage: {} };
    STAGES.forEach(s => { stats.byStage[s.id] = 0; });

    data.forEach(item => {
      stats.total++;
      if (item.is_done) stats.completed++;
      else stats.inProduction++;
      
      const stageKey = item.stage_name ? item.stage_name.toLowerCase().replace(' ', '-') : 'cutting';
      if (stats.byStage[stageKey] !== undefined) stats.byStage[stageKey]++;
    });
    return stats;
  }

  async getItemsByClient(clientCode) {
    const { data, error } = await supabase
      .from('production_items')
      .select('*')
      .eq('client_code', clientCode)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async saveClient(clientData) {
    const { data, error } = await supabase
      .from('clients')
      .upsert([clientData], { onConflict: 'client_code' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getShortages() {
    const { data, error } = await supabase
      .from('production_stage_shortages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(s => ({
      id: s.id,
      clientCode: s.client_code,
      stage: s.stage_name ? s.stage_name.toLowerCase().replace(' ', '-') : 'unknown',
      description: s.description,
      status: s.status || 'pending',
      createdAt: s.created_at
    }));
  }

  async getShortageStats() {
    const { data, error } = await supabase.from('production_stage_shortages').select('stage_name, status');
    if (error) throw error;
    
    const stats = { total: data.length, pending: 0, inProgress: 0, resolved: 0, byStage: {} };
    STAGES.forEach(s => { stats.byStage[s.id] = 0; });

    data.forEach(s => {
      if (s.status === 'pending') stats.pending++;
      else if (s.status === 'resolved') stats.resolved++;
      else stats.inProgress++;

      const stageKey = s.stage_name ? s.stage_name.toLowerCase().replace(' ', '-') : 'unknown';
      if (stats.byStage[stageKey] !== undefined) stats.byStage[stageKey]++;
    });
    return stats;
  }

  async createShortage(shortageData) {
    const newShortage = {
      client_code: shortageData.clientCode,
      stage_name: shortageData.stage.replace('-', ' '),
      description: shortageData.description,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('production_stage_shortages').insert([newShortage]).select().single();
    if (error) throw error;
    return data;
  }

  async resolveShortage(id) {
    const { data, error } = await supabase
      .from('production_stage_shortages')
      .update({ status: 'resolved' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getMessages(clientCode, stageId) {
    const normalizedStage = stageId.replace('-', ' ');
    const { data, error } = await supabase
      .from('production_chat')
      .select('*')
      .eq('client_code', clientCode)
      .ilike('stage_name', `%${normalizedStage}%`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    
    return (data || []).map(m => ({
      id: m.id,
      sender: m.sender_name,
      text: m.message,
      time: m.created_at,
      role: m.sender_role
    }));
  }

  async sendMessage(clientCode, stageId, messageData) {
    const newMessage = {
      client_code: clientCode,
      stage_name: stageId.replace('-', ' '),
      sender_name: messageData.sender,
      sender_role: messageData.senderRole || 'user',
      message: messageData.text,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('production_chat').insert([newMessage]).select().single();
    if (error) throw error;
    return {
      id: data.id,
      sender: data.sender_name,
      text: data.message,
      time: data.created_at
    };
  }

  async getProductionReport(filters = {}) {
    const { data, error } = await supabase.from('production_items').select('*');
    if (error) throw error;
    
    let report = (data || []).map(item => ({
      clientCode: item.client_code,
      clientName: item.client_name,
      projectName: item.client_name,
      itemName: item.item_name,
      stage: item.stage_name ? item.stage_name.toLowerCase().replace(' ', '-') : 'cutting',
      technician: item.technician,
      status: item.is_done ? 'completed' : 'in-progress',
      duration: item.duration || '0'
    }));

    if (filters.stage) report = report.filter(r => r.stage === filters.stage);
    if (filters.status) report = report.filter(r => r.status === filters.status);
    return report;
  }

  async getStagesDashboard() {
    const { data, error } = await supabase.from('production_stage_status').select('*');
    if (error) throw error;
    return (data || []).map(s => ({
      clientCode: s.client_code,
      clientName: s.client_code,
      projectName: s.client_code,
      lastStage: s.stage || 'cutting',
      stageStatus: s.status || 'in-progress',
      overallStatus: s.status || 'in-progress',
      updateDate: s.updated_at || s.created_at
    }));
  }

  async getStageDurations() {
    const { data, error } = await supabase.from('production_items').select('*');
    if (error) throw error;
    return (data || []).map(item => ({
      clientCode: item.client_code,
      clientName: item.client_name,
      projectName: item.client_name,
      stage: item.stage_name ? item.stage_name.toLowerCase().replace(' ', '-') : 'cutting',
      itemName: item.item_name,
      technician: item.technician,
      status: item.is_done ? 'completed' : 'in-progress',
      duration: item.duration || '0',
      startDate: item.start_date || item.created_at,
      endDate: item.completed_at || item.real_end
    }));
  }

  async getReadyProjects() {
    const { data, error } = await supabase
      .from('clients')
      .select('client_code, client_name, project_name, storage_date, supply_date, storage, supply, item_count')
      .eq('storage', true)
      .eq('supply', true);
    if (error) throw error;
    
    return (data || []).map(c => ({
      clientCode: c.client_code,
      clientName: c.client_name,
      projectName: c.project_name,
      completionDate: c.storage_date,
      storage: c.storage ? 'stored' : 'pending',
      supply: c.supply ? 'ready' : 'pending',
      itemCount: c.item_count
    }));
  }

  _calculateCurrentStage(items) {
    if (!items || items.length === 0) return 'cutting';
    const stagesOrder = STAGES.map(s => s.id);
    let maxStageIndex = 0;
    items.forEach(item => {
      const idx = stagesOrder.indexOf(item.stage);
      if (idx > maxStageIndex) maxStageIndex = idx;
    });
    return stagesOrder[maxStageIndex] || 'cutting';
  }
}


export const api = new ApiClient();
export default { api };
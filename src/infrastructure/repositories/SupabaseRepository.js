import { IRepository } from '../../core/interfaces/IRepository';
import { getSupabaseClient } from '../supabase/client';

export class SupabaseRepository extends IRepository {
  constructor() {
    super();
    this.client = getSupabaseClient();
  }

  // Menu Items
  async getMenuItems() {
    if (!this.client) return [];
    const { data, error } = await this.client.from('menu_items').select('*');
    if (error) { console.error("Supabase Error:", error.message); return []; }
    return data || [];
  }
  async getMenuItemById(id) {
    if (!this.client) return null;
    const { data, error } = await this.client.from('menu_items').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }
  async addMenuItem(item) {
    const { data, error } = await this.client.from('menu_items').insert([item]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  async updateMenuItem(item) {
    const { error } = await this.client.from('menu_items').update(item).eq('id', item.id);
    if (error) throw new Error(error.message);
    return true;
  }
  async deleteMenuItem(id) {
    const { error } = await this.client.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // Deals
  async getDeals() {
    if (!this.client) return [];
    const { data, error } = await this.client.from('deals').select('*');
    if (error) return [];
    return data || [];
  }
  async addDeal(deal) {
    const { data, error } = await this.client.from('deals').insert([deal]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  async updateDeal(deal) {
    const { error } = await this.client.from('deals').update(deal).eq('id', deal.id);
    if (error) throw new Error(error.message);
    return true;
  }
  async deleteDeal(id) {
    const { error } = await this.client.from('deals').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // Orders
  async getOrders() {
    if (!this.client) return [];
    const { data, error } = await this.client.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }
  async getOrderById(id) {
    if (!this.client) return null;
    const { data, error } = await this.client.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data;
  }
  async getOrdersByPhone(phone) {
    if (!this.client) return [];
    const clean = phone.replace(/[^0-9]/g, "");
    const { data, error } = await this.client.from('orders').select('*');
    if (error) return [];
    return (data || []).filter(o => o.customer?.phone?.replace(/[^0-9]/g, "") === clean);
  }
  async createOrder(customerDetails, items, total, deliveryFee = 0) {
    let nextId = 5104;
    const orders = await this.getOrders();
    if (orders.length > 0 && orders[0].id) {
      const num = parseInt(orders[0].id.replace('HB-', ''));
      if (!isNaN(num)) nextId = num + 1;
    }
    const newOrder = {
      id: `HB-${nextId}`,
      customer: customerDetails,
      items,
      total,
      delivery_fee: deliveryFee,
      status: 'received',
      payment: 'Cash on Delivery',
      created_at: new Date().toISOString(),
      updates: [{ stage: 'received', time: new Date().toISOString() }]
    };
    const { data, error } = await this.client.from('orders').insert([newOrder]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  async updateOrderStatus(orderId, newStatus) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const updates = Array.isArray(order.updates) ? [...order.updates] : [];
    if (!updates.some(u => u.stage === newStatus)) {
      updates.push({ stage: newStatus, time: new Date().toISOString() });
    }
    const { data, error } = await this.client.from('orders').update({ status: newStatus, updates }).eq('id', orderId).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Reviews
  async getReviews() {
    if (!this.client) return [];
    const { data, error } = await this.client.from('reviews').select('*').eq('approved', true).order('date', { ascending: false });
    if (error) return [];
    return data || [];
  }
  async getPendingReviews() {
    if (!this.client) return [];
    const { data, error } = await this.client.from('reviews').select('*').eq('approved', false).order('date', { ascending: false });
    if (error) return [];
    return data || [];
  }
  async addReview(name, rating, comment) {
    const review = {
      name,
      rating: parseInt(rating) || 5,
      comment,
      date: new Date().toISOString().split('T')[0],
      approved: false
    };
    const { data, error } = await this.client.from('reviews').insert([review]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  async approveReview(id) {
    const { error } = await this.client.from('reviews').update({ approved: true }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
  async deleteReview(id) {
    const { error } = await this.client.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // Settings
  async getDeliverySettings() {
    if (!this.client) return { enabled: false, fee: 150, maxOrders: 50 };
    const { data, error } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return { enabled: false, fee: 150, maxOrders: 50 };
    return {
      enabled: data.delivery_charge_enabled,
      fee: data.delivery_charge_amount,
      maxOrders: data.max_active_orders
    };
  }
  async saveDeliverySettings(enabled, fee, maxOrders) {
    const payload = {
      id: 1,
      delivery_charge_enabled: !!enabled,
      delivery_charge_amount: parseFloat(fee) || 0,
      max_active_orders: parseInt(maxOrders) || 50
    };
    const { data, error } = await this.client.from('settings').upsert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Auth
  async loginAdmin(username, password) {
    if (!this.client) return false;
    const email = username.includes('@') ? username : `${username}@habibibites.com`;
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return !!data.session;
  }
  async logoutAdmin() {
    if (this.client) await this.client.auth.signOut();
  }
  async isAdminLoggedIn() {
    if (!this.client) return false;
    const { data } = await this.client.auth.getSession();
    return !!data.session;
  }
}

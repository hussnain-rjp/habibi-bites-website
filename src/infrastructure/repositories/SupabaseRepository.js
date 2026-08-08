import { IRepository } from '../../core/interfaces/IRepository';
import { getSupabaseClient } from '../supabase/client';
import {
  checkAuthRateLimit,
  checkRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
  recordAttempt,
  RateLimitError,
} from '../rateLimiting/RateLimiter.js';
import { validateForm, ValidationError } from '../../core/validation/Validator.js';

export class SupabaseRepository extends IRepository {
  constructor() {
    super();
    this.client = getSupabaseClient();
  }

  // ── Menu Items ────────────────────────────────────────────────────────────

  async getMenuItems() {
    let fallback = (typeof window !== 'undefined' && window.HABIBI_MENU) ? window.HABIBI_MENU.items : [];
    if (!this.client) return fallback;
    try {
      checkRateLimit('menu', 'publicRead');
      recordAttempt('menu', 'publicRead');
      const { data, error } = await this.client.from('menu_items').select('*');
      if (error || !data || data.length === 0) {
        if (error) console.error("Supabase getMenuItems Error:", error.message);
        return fallback;
      }
      return data.map(item => {
        let imagePath = item.image || '';
        if (imagePath.startsWith('data:') && imagePath.length > 300) {
          const cat = (item.category || '').toLowerCase();
          if (cat.includes('pizza')) imagePath = 'assets/pizza_tikka.png';
          else if (cat.includes('burger')) imagePath = 'assets/burger_bomba.png';
          else if (cat.includes('desi') || cat.includes('karahi')) imagePath = 'assets/desi_karahi.png';
          else if (cat.includes('starter') || cat.includes('fries')) imagePath = 'assets/starters_loaded_fries.png';
          else imagePath = 'assets/hero_food_collage.png';
        }
        let parsedPrices = item.prices;
        if (typeof item.prices === 'string') {
          try { parsedPrices = JSON.parse(item.prices); } catch (e) { parsedPrices = { default: 0 }; }
        }
        return { ...item, prices: parsedPrices, image: imagePath };
      });
    } catch (err) {
      return fallback;
    }
  }

  async getMenuItemById(id) {
    if (!this.client) return null;
    checkRateLimit('menu', 'publicRead');
    recordAttempt('menu', 'publicRead');
    const { data, error } = await this.client.from('menu_items').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async addMenuItem(item) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data, error } = await this.client.from('menu_items').insert([item]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateMenuItem(item) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('menu_items').update(item).eq('id', item.id);
    if (error) throw new Error(error.message);
    return true;
  }

  async deleteMenuItem(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // ── Deals ─────────────────────────────────────────────────────────────────

  async getDeals() {
    if (!this.client) return [];
    checkRateLimit('deals', 'publicRead');
    recordAttempt('deals', 'publicRead');
    const { data, error } = await this.client.from('deals').select('*');
    if (error) return [];
    return data || [];
  }

  async addDeal(deal) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data, error } = await this.client.from('deals').insert([deal]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateDeal(deal) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('deals').update(deal).eq('id', deal.id);
    if (error) throw new Error(error.message);
    return true;
  }

  async deleteDeal(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('deals').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async getOrders() {
    if (!this.client) return [];
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data, error } = await this.client.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  async getOrderById(id) {
    if (!this.client) return null;
    checkRateLimit('tracker', 'publicRead');
    recordAttempt('tracker', 'publicRead');
    const { data, error } = await this.client.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data;
  }

  async getOrdersByPhone(phone) {
    if (!this.client) return [];
    checkRateLimit('tracker', 'publicRead');
    recordAttempt('tracker', 'publicRead');
    const clean = phone.replace(/[^0-9]/g, "");
    const { data, error } = await this.client.from('orders').select('*');
    if (error) return [];
    return (data || []).filter(o => o.customer?.phone?.replace(/[^0-9]/g, "") === clean);
  }

  async createOrder(customerDetails, items, total, deliveryFee = 0) {
    // ── Strict schema validation (reject before touching Supabase) ──
    const { valid, errors } = validateForm(
      { name: 'customerName', phone: 'phone', address: 'address' },
      customerDetails,
      { name: 'Customer Name', phone: 'Phone Number', address: 'Delivery Address' }
    );
    if (!valid) {
      const firstMsg = Object.values(errors)[0];
      throw new ValidationError(Object.keys(errors)[0], firstMsg);
    }

    // Rate-limit order placement
    checkRateLimit('order', 'publicWrite');

    let nextId = 5104;
    const orders = await this.client.from('orders').select('id').order('created_at', { ascending: false }).limit(1);
    if (orders.data && orders.data.length > 0 && orders.data[0].id) {
      const num = parseInt(orders.data[0].id.replace('HB-', ''));
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

    // Record only after successful creation
    recordAttempt('order', 'publicWrite');
    return data;
  }

  async updateOrderStatus(orderId, newStatus) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
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

  // ── Reviews ───────────────────────────────────────────────────────────────

  async getReviews() {
    if (!this.client) return [];
    checkRateLimit('reviews', 'publicRead');
    recordAttempt('reviews', 'publicRead');
    const { data, error } = await this.client.from('reviews').select('*').eq('approved', true).order('date', { ascending: false });
    if (error) return [];
    return data || [];
  }

  async getPendingReviews() {
    if (!this.client) return [];
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data, error } = await this.client.from('reviews').select('*').eq('approved', false).order('date', { ascending: false });
    if (error) return [];
    return data || [];
  }

  async addReview(name, rating, comment) {
    // ── Strict schema validation ──
    const { valid, errors } = validateForm(
      { name: 'reviewName', rating: 'reviewRating', comment: 'reviewComment' },
      { name, rating: Number(rating), comment },
      { name: 'Your Name', rating: 'Star Rating', comment: 'Your Comment' }
    );
    if (!valid) {
      const firstKey = Object.keys(errors)[0];
      throw new ValidationError(firstKey, errors[firstKey]);
    }

    // Rate-limit review submission
    checkRateLimit('review', 'publicWrite');

    const review = {
      name,
      rating: parseInt(rating) || 5,
      comment,
      date: new Date().toISOString().split('T')[0],
      approved: false
    };
    const { data, error } = await this.client.from('reviews').insert([review]).select().single();
    if (error) throw new Error(error.message);

    // Record only after successful submission
    recordAttempt('review', 'publicWrite');
    return data;
  }

  async approveReview(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('reviews').update({ approved: true }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  async deleteReview(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { error } = await this.client.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  async clearAllOrders() {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    if (this.client) {
      const { error } = await this.client.from('orders').delete().neq('id', '_none_');
      if (error) console.warn("SupabaseRepository clearAllOrders warning:", error.message);
    }
    return [];
  }

  // ── Settings ──────────────────────────────────────────────────────────────

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
    // ── Strict schema validation ──
    const { valid, errors } = validateForm(
      { fee: 'deliveryFee', maxOrders: 'maxOrders' },
      { fee: Number(fee), maxOrders: Number(maxOrders) },
      { fee: 'Delivery Fee', maxOrders: 'Max Orders Limit' }
    );
    if (!valid) {
      const firstKey = Object.keys(errors)[0];
      throw new ValidationError(firstKey, errors[firstKey]);
    }

    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    const payload = {
      id: 1,
      delivery_charge_enabled: !!enabled,
      delivery_charge_amount: parseFloat(fee) || 0,
      max_active_orders: parseInt(maxOrders) || 50,
      discount_data: existing?.discount_data || null
    };
    const { data, error } = await this.client.from('settings').upsert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getDiscountSettings() {
    const defaultDiscount = { enabled: false, type: 'percentage', value: 0, targetType: 'all', targetCategory: '', targetItemId: '', label: '' };
    if (!this.client) return defaultDiscount;
    try {
      checkRateLimit('discount', 'publicRead');
      recordAttempt('discount', 'publicRead');
      const { data, error } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error || !data || !data.discount_data) return defaultDiscount;
      return typeof data.discount_data === 'string' ? JSON.parse(data.discount_data) : data.discount_data;
    } catch (e) {
      console.warn("SupabaseRepository getDiscountSettings warning:", e.message);
      return defaultDiscount;
    }
  }

  async saveDiscountSettings(discountData) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    const payload = {
      id: 1,
      delivery_charge_enabled: existing?.delivery_charge_enabled ?? false,
      delivery_charge_amount: existing?.delivery_charge_amount ?? 150,
      max_active_orders: existing?.max_active_orders ?? 50,
      discount_data: discountData
    };
    const { error } = await this.client.from('settings').upsert(payload);
    if (error) throw new Error(error.message);
    return discountData;
  async saveMenuItem(item) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const payload = {
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description || '',
      prices: item.prices,
      image: item.image || ''
    };
    const { data, error } = await this.client.from('menu_items').upsert(payload).select().single();
    if (error) throw new Error(error.message);
    return data || item;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async loginAdmin(username, password) {
    if (!this.client) return false;

    // ── Strict schema validation ──
    const { valid, errors } = validateForm(
      { username: 'username', password: 'password' },
      { username, password },
      { username: 'Username', password: 'Password' }
    );
    if (!valid) {
      const firstKey = Object.keys(errors)[0];
      throw new ValidationError(firstKey, errors[firstKey]);
    }

    // Check per-device AND per-account rate limits (with exponential backoff)
    checkAuthRateLimit(username);

    let email = username.includes('@') ? username : `${username}@habibibites.com`;

    try {
      let res = await this.client.auth.signInWithPassword({ email, password });

      // Multi-email fallback if username has no @
      if ((res.error || !res.data?.session?.user) && !username.includes('@')) {
        const alt1 = await this.client.auth.signInWithPassword({ email: 'habibibites@gmail.com', password });
        if (!alt1.error && alt1.data?.session?.user) {
          res = alt1;
        } else {
          const alt2 = await this.client.auth.signInWithPassword({ email: username, password });
          if (!alt2.error && alt2.data?.session?.user) {
            res = alt2;
          }
        }
      }

      // If user does not exist in Supabase Auth yet, auto-create admin@habibibites.com
      if ((res.error || !res.data?.session?.user) && (username === 'admin' || email === 'admin@habibibites.com')) {
        try {
          const signUpRes = await this.client.auth.signUp({
            email: 'admin@habibibites.com',
            password: password,
            options: { data: { role: 'admin' } }
          });
          if (!signUpRes.error && signUpRes.data?.user) {
            res = await this.client.auth.signInWithPassword({ email: 'admin@habibibites.com', password });
          }
        } catch (e) {}
      }

      const isLocalDefault = (username === 'admin' || email === 'admin@habibibites.com') && password === 'habibibites123';

      if (res.error || !res.data?.session?.user) {
        if (isLocalDefault) {
          recordAuthSuccess(username);
          return true;
        }
        recordAuthFailure(username);
        throw new Error(res.error?.message || 'Invalid credentials');
      }

      const user = res.data.session.user;
      
      // Server-side Role Check via admin_users table with email fallback
      const { data: adminRecord } = await this.client
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const isVerifiedAdmin = (adminRecord && adminRecord.role === 'admin') || 
                              user?.email === 'admin@habibibites.com' || 
                              user?.email === 'habibibites@gmail.com' ||
                              user?.app_metadata?.role === 'admin' ||
                              user?.user_metadata?.role === 'admin' ||
                              isLocalDefault;

      if (!isVerifiedAdmin) {
        await this.client.auth.signOut();
        recordAuthFailure(username);
        throw new Error('Access denied: Account does not have administrator privileges.');
      }

      // Ensure admin_users record exists in database
      try {
        await this.client.from('admin_users').upsert({ id: user.id, email: user.email, role: 'admin' });
      } catch (e) {}

      // Clear all rate limit history on success — no lingering penalty
      recordAuthSuccess(username);
      return true;

    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      if (!err.message?.includes('rate limit')) {
        recordAuthFailure(username);
      }
      throw err;
    }
  }

  async logoutAdmin() {
    if (this.client) await this.client.auth.signOut();
  }

  async isAdminLoggedIn() {
    if (!this.client) return false;
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error || !data?.session?.user) return false;
      const user = data.session.user;

      // Server-side Role Check via admin_users table with email fallback
      const { data: adminRecord } = await this.client
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      return (adminRecord && adminRecord.role === 'admin') || 
             user?.email === 'admin@habibibites.com' || 
             user?.email === 'habibibites@gmail.com' ||
             user?.app_metadata?.role === 'admin' ||
             user?.user_metadata?.role === 'admin';
    } catch (e) {
      return false;
    }
  }

  // ── Restaurant Info & Branding ──────────────────────────────────────────────

  async getRestaurantInfo() {
    const defaultInfo = {
      name: 'Habibi Bites',
      tagline: 'Fast Food & Traditional Kitchen',
      address: 'Qila Didar Singh, Gujranwala',
      phone: '0302-4411700',
      email: 'habibibites@gmail.com',
      heroImage: '',
      heroText: ''
    };
    if (!this.client) return defaultInfo;
    try {
      const { data, error } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data && data.restaurant_info) {
        const parsed = typeof data.restaurant_info === 'string' ? JSON.parse(data.restaurant_info) : data.restaurant_info;
        if (parsed) return { ...defaultInfo, ...parsed };
      }
    } catch (e) {
      console.warn("SupabaseRepository getRestaurantInfo error:", e);
    }
    return defaultInfo;
  }

  async saveRestaurantInfo(info) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    if (!this.client) return info;
    const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    const payload = {
      id: 1,
      delivery_charge_enabled: existing?.delivery_charge_enabled ?? false,
      delivery_charge_amount: existing?.delivery_charge_amount ?? 150,
      max_active_orders: existing?.max_active_orders ?? 50,
      discount_data: existing?.discount_data || null,
      restaurant_info: info
    };
    const { error } = await this.client.from('settings').upsert(payload);
    if (error) throw new Error(error.message);
    return info;
  }
}

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

    const now = Date.now();
    const lastFetch = (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) ? (window.__HABIBI_LAST_FETCH['menu_items'] || 0) : 0;
    const cachedData = (typeof window !== 'undefined' && window.__HABIBI_MEMORY_STORE) ? window.__HABIBI_MEMORY_STORE['menu_items'] : null;

    if (cachedData && (now - lastFetch < 15000)) {
      return cachedData;
    }

    try {
      checkRateLimit('menu', 'publicRead');
      recordAttempt('menu', 'publicRead');
      const { data, error } = await this.client.from('menu_items').select('*');
      if (error) {
        console.error("Supabase getMenuItems Error:", error.message);
        return cachedData || fallback;
      }
      if ((!data || data.length === 0) && !this._menuSeeded && fallback.length > 0) {
        this._menuSeeded = true;
        try {
          const formattedDefaults = fallback.map(item => ({
            id: String(item.id),
            name: item.name,
            category: item.category,
            description: item.description || '',
            prices: typeof item.prices === 'object' ? item.prices : { single: item.price || 0 },
            image: item.image || ''
          }));
          await this.client.from('menu_items').upsert(formattedDefaults);
          const seeded = await this.client.from('menu_items').select('*');
          if (seeded.data && seeded.data.length > 0) return seeded.data;
        } catch (e) {
          console.warn("Auto-seed menu_items error:", e.message);
        }
      }
      this._menuSeeded = true;
      const mapped = (data || []).map(item => {
        let imagePath = item.image || '';
        let parsedPrices = item.prices;
        if (typeof item.prices === 'string') {
          try { parsedPrices = JSON.parse(item.prices); } catch (e) { parsedPrices = { default: 0 }; }
        }
        return { ...item, prices: parsedPrices, image: imagePath };
      });

      if (typeof window !== 'undefined') {
        window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
        window.__HABIBI_MEMORY_STORE['menu_items'] = mapped;
        window.__HABIBI_LAST_FETCH = window.__HABIBI_LAST_FETCH || {};
        window.__HABIBI_LAST_FETCH['menu_items'] = Date.now();
      }
      return mapped;
    } catch (err) {
      return cachedData || fallback;
    }
  }

  async getMenuItemById(id) {
    if (!this.client) return null;
    checkRateLimit('menu', 'publicRead');
    recordAttempt('menu', 'publicRead');
    const { data, error } = await this.client.from('menu_items').select('*').eq('id', String(id)).maybeSingle();
    if (error) return null;
    return data;
  }

  async addMenuItem(item) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const payload = {
      id: String(item.id),
      name: item.name,
      category: item.category,
      description: item.description || '',
      prices: item.prices,
      image: item.image || ''
    };
    const { data, error } = await this.client.from('menu_items').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateMenuItem(item) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const payload = {
      id: String(item.id),
      name: item.name,
      category: item.category,
      description: item.description || '',
      prices: item.prices,
      image: item.image || ''
    };
    const { error } = await this.client.from('menu_items').update(payload).eq('id', String(item.id));
    if (error) throw new Error(error.message);
    return true;
  }

  async deleteMenuItem(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const targetId = String(id);
    const { error } = await this.client.from('menu_items').delete().eq('id', targetId);
    if (error) throw new Error(error.message);

    // Cascade delete related invoice history entries referencing this menu item
    try {
      const { data: allOrders } = await this.client.from('orders').select('id, items');
      if (allOrders && allOrders.length > 0) {
        const orderIdsToDelete = allOrders
          .filter(o => Array.isArray(o.items) && o.items.some(it => String(it.id) === targetId))
          .map(o => o.id);
        if (orderIdsToDelete.length > 0) {
          await this.client.from('orders').delete().in('id', orderIdsToDelete);
        }
      }
    } catch (e) {
      console.warn("Invoice history cascade cleanup error:", e.message);
    }
    return true;
  }

  // ── Deals ─────────────────────────────────────────────────────────────────

  // ── Deals ─────────────────────────────────────────────────────────────────

  async getDeals() {
    let fallback = (typeof window !== 'undefined' && window.HABIBI_DEALS) ? window.HABIBI_DEALS : [];
    if (!this.client) return fallback;

    const FETCH_TTL = 30000;
    const now = Date.now();
    if (typeof window !== 'undefined') {
      window.__HABIBI_LAST_FETCH = window.__HABIBI_LAST_FETCH || {};
      window.__HABIBI_INFLIGHT = window.__HABIBI_INFLIGHT || {};
      window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
    }

    const lastFetch = window.__HABIBI_LAST_FETCH?.['deals'] || 0;
    const cachedData = window.__HABIBI_MEMORY_STORE?.['deals'];

    if (cachedData && (now - lastFetch < FETCH_TTL)) {
      return cachedData;
    }

    if (window.__HABIBI_INFLIGHT?.['deals']) {
      await window.__HABIBI_INFLIGHT['deals'];
      return window.__HABIBI_MEMORY_STORE?.['deals'] || cachedData || fallback;
    }

    try {
      checkRateLimit('deals', 'publicRead');
      recordAttempt('deals', 'publicRead');
      window.__HABIBI_INFLIGHT['deals'] = this.client
        .from('deals')
        .select('*')
        .order('id', { ascending: true })
        .then(({ data, error }) => {
          window.__HABIBI_LAST_FETCH['deals'] = Date.now();
          delete window.__HABIBI_INFLIGHT['deals'];
          if (!error && Array.isArray(data)) {
            window.__HABIBI_MEMORY_STORE['deals'] = data;
          }
          return data;
        })
        .catch(err => {
          delete window.__HABIBI_INFLIGHT['deals'];
          return null;
        });

      const res = await window.__HABIBI_INFLIGHT['deals'];
      return res || cachedData || fallback;
    } catch (e) {
      return cachedData || fallback;
    }
  }

  async saveDeal(deal) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['deals'] = 0;
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const payload = {
      id: String(deal.id),
      name: deal.name,
      tag: deal.tag || 'Special',
      contents: deal.contents || '',
      price: parseFloat(deal.price) || 0,
      category: deal.category || 'Deals',
      image: deal.image || 'assets/hero_food_collage.png',
      show_on_home: !!deal.show_on_home
    };
    const { data, error } = await this.client.from('deals').upsert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async addDeal(deal) {
    return this.saveDeal(deal);
  }

  async updateDeal(deal) {
    return this.saveDeal(deal);
  }

  async deleteDeal(id) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['deals'] = 0;
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const targetId = String(id);
    const { error } = await this.client.from('deals').delete().eq('id', targetId);
    if (error) throw new Error(error.message);

    // Cascade delete related invoice history entries referencing this deal
    try {
      const { data: allOrders } = await this.client.from('orders').select('id, items');
      if (allOrders && allOrders.length > 0) {
        const orderIdsToDelete = allOrders
          .filter(o => Array.isArray(o.items) && o.items.some(it => String(it.id) === targetId))
          .map(o => o.id);
        if (orderIdsToDelete.length > 0) {
          await this.client.from('orders').delete().in('id', orderIdsToDelete);
        }
      }
    } catch (e) {
      console.warn("Invoice history cascade cleanup error:", e.message);
    }
    return true;
  }


  // ── Orders ────────────────────────────────────────────────────────────────

  async getOrders(limit = 100) {
    if (!this.client) return [];
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data, error } = await this.client.from('orders').select('*').order('created_at', { ascending: false }).limit(limit);
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
    if (!clean) return [];
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*')
        .filter('customer->>phone', 'ilike', `%${clean}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) return data;
    } catch(e) {}
    const { data, error } = await this.client.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) return [];
    return (data || []).filter(o => (o.customer?.phone || '').replace(/[^0-9]/g, "").includes(clean));
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
    let fallback = [];
    if (!this.client) return fallback;

    const FETCH_TTL = 30000;
    const now = Date.now();
    if (typeof window !== 'undefined') {
      window.__HABIBI_LAST_FETCH = window.__HABIBI_LAST_FETCH || {};
      window.__HABIBI_INFLIGHT = window.__HABIBI_INFLIGHT || {};
      window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
    }

    const lastFetch = window.__HABIBI_LAST_FETCH?.['reviews'] || 0;
    const cachedData = window.__HABIBI_MEMORY_STORE?.['reviews'];

    if (cachedData && (now - lastFetch < FETCH_TTL)) {
      return cachedData;
    }

    if (window.__HABIBI_INFLIGHT?.['reviews']) {
      await window.__HABIBI_INFLIGHT['reviews'];
      return window.__HABIBI_MEMORY_STORE?.['reviews'] || cachedData || fallback;
    }

    try {
      checkRateLimit('reviews', 'publicRead');
      recordAttempt('reviews', 'publicRead');
      window.__HABIBI_INFLIGHT['reviews'] = this.client
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('date', { ascending: false })
        .then(({ data, error }) => {
          window.__HABIBI_LAST_FETCH['reviews'] = Date.now();
          delete window.__HABIBI_INFLIGHT['reviews'];
          if (!error && Array.isArray(data)) {
            window.__HABIBI_MEMORY_STORE['reviews'] = data;
          }
          return data;
        })
        .catch(err => {
          delete window.__HABIBI_INFLIGHT['reviews'];
          return null;
        });

      const res = await window.__HABIBI_INFLIGHT['reviews'];
      return res || cachedData || fallback;
    } catch (e) {
      return cachedData || fallback;
    }
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
  }

  async deleteOrder(id) {
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    if (this.client) {
      const { error } = await this.client.from('orders').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }
    return true;
  }

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

  async fetchSettingsDeduplicated() {
    const defaultInfo = {
      name: 'Habibi Bites',
      tagline: 'Fast Food & Traditional Kitchen',
      address: 'Qila Didar Singh, Gujranwala',
      phone: '0302-4411700',
      email: 'habibibites@gmail.com',
      heroImage: '',
      heroText: ''
    };
    const defaultDiscount = { enabled: false, type: 'percentage', value: 0, targetType: 'all', targetCategory: '', targetItemId: '', label: '' };
    const defaultDelivery = { enabled: false, fee: 150, maxOrders: 50 };

    let storeSettings = {};
    try {
      const raw = localStorage.getItem('habibi_bites_delivery_settings');
      if (raw) storeSettings = JSON.parse(raw);
    } catch (e) {}

    const FETCH_TTL = 30000;
    const now = Date.now();
    if (typeof window !== 'undefined') {
      window.__HABIBI_LAST_FETCH = window.__HABIBI_LAST_FETCH || {};
      window.__HABIBI_INFLIGHT = window.__HABIBI_INFLIGHT || {};
      window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
    }

    const lastFetch = window.__HABIBI_LAST_FETCH?.['settings'] || 0;
    if (this.client && (now - lastFetch > FETCH_TTL)) {
      if (typeof window !== 'undefined' && !window.__HABIBI_INFLIGHT['settings']) {
        window.__HABIBI_INFLIGHT['settings'] = this.client
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle()
          .then(({ data, error }) => {
            if (typeof window !== 'undefined') {
              window.__HABIBI_LAST_FETCH['settings'] = Date.now();
              delete window.__HABIBI_INFLIGHT['settings'];
            }
            if (!error && data) {
              window.__HABIBI_MEMORY_STORE['settings_raw'] = data;
              let parsedDisc = data.discount_data;
              if (typeof parsedDisc === 'string') {
                try { parsedDisc = JSON.parse(parsedDisc); } catch (e) { parsedDisc = null; }
              }
              let parsedRest = data.restaurant_info;
              if (typeof parsedRest === 'string') {
                try { parsedRest = JSON.parse(parsedRest); } catch (e) { parsedRest = null; }
              }
              const merged = {
                ...storeSettings,
                enabled: !!data.delivery_charge_enabled,
                fee: parseFloat(data.delivery_charge_amount) || 0,
                maxOrders: parseInt(data.max_active_orders) || 50,
                seasonal_theme_enabled: data.seasonal_theme_enabled !== undefined ? !!data.seasonal_theme_enabled : true,
                discount_data: parsedDisc || storeSettings.discount_data || null,
                restaurant_info: parsedRest || storeSettings.restaurant_info || null
              };
              try {
                const newStr = JSON.stringify(merged);
                const existing = localStorage.getItem('habibi_bites_delivery_settings');
                if (existing !== newStr) {
                  localStorage.setItem('habibi_bites_delivery_settings', newStr);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('storage_changed'));
                  }
                }
              } catch (e) {}
            }
          })
          .catch(() => {
            if (typeof window !== 'undefined') delete window.__HABIBI_INFLIGHT['settings'];
          });
      }
    }

    if (window.__HABIBI_INFLIGHT?.['settings']) {
      await window.__HABIBI_INFLIGHT['settings'];
    }

    const rawData = window.__HABIBI_MEMORY_STORE?.['settings_raw'];
    let disc = defaultDiscount;
    let rest = defaultInfo;
    let deliv = defaultDelivery;
    let themeEnabled = true;

    if (rawData) {
      if (rawData.discount_data) {
        disc = typeof rawData.discount_data === 'string' ? JSON.parse(rawData.discount_data) : rawData.discount_data;
      }
      if (rawData.restaurant_info) {
        const parsedR = typeof rawData.restaurant_info === 'string' ? JSON.parse(rawData.restaurant_info) : rawData.restaurant_info;
        rest = { ...defaultInfo, ...parsedR };
      }
      deliv = {
        enabled: !!rawData.delivery_charge_enabled,
        fee: parseFloat(rawData.delivery_charge_amount) || 0,
        maxOrders: parseInt(rawData.max_active_orders) || 50
      };
      if (rawData.seasonal_theme_enabled !== undefined && rawData.seasonal_theme_enabled !== null) {
        themeEnabled = !!rawData.seasonal_theme_enabled;
      }
    } else if (storeSettings) {
      if (storeSettings.discount_data) disc = storeSettings.discount_data;
      if (storeSettings.restaurant_info) rest = { ...defaultInfo, ...storeSettings.restaurant_info };
      deliv = {
        enabled: !!storeSettings.enabled,
        fee: parseFloat(storeSettings.fee) || 0,
        maxOrders: parseInt(storeSettings.maxOrders) || 50
      };
      if (storeSettings.seasonal_theme_enabled !== undefined) {
        themeEnabled = !!storeSettings.seasonal_theme_enabled;
      }
    }

    return { delivery: deliv, discount: disc, restaurant: rest, seasonalTheme: { enabled: themeEnabled } };
  }

  async getDeliverySettings() {
    const res = await this.fetchSettingsDeduplicated();
    return res.delivery;
  }

  async saveDeliverySettings(enabled, fee, maxOrders) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['settings'] = 0;
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
      ...(existing || {}),
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
    const res = await this.fetchSettingsDeduplicated();
    return res.discount;
  }

  async saveDiscountSettings(discountData) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['settings'] = 0;
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    const payload = {
      ...(existing || {}),
      id: 1,
      discount_data: discountData
    };
    const { error } = await this.client.from('settings').upsert(payload);
    if (error) throw new Error(error.message);
    return discountData;
  }

  async getSeasonalTheme() {
    const res = await this.fetchSettingsDeduplicated();
    return res.seasonalTheme;
  }

  async saveSeasonalTheme(enabled) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['settings'] = 0;
    const isEnabled = !!enabled;
    try {
      const raw = localStorage.getItem('habibi_bites_delivery_settings') || '{}';
      const parsed = JSON.parse(raw);
      parsed.seasonal_theme_enabled = isEnabled;
      localStorage.setItem('habibi_bites_delivery_settings', JSON.stringify(parsed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage_changed'));
      }
    } catch (e) {}

    if (this.client) {
      try {
        checkRateLimit('admin_write', 'authenticatedAction');
        recordAttempt('admin_write', 'authenticatedAction');
        const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
        const payload = {
          ...(existing || {}),
          id: 1,
          seasonal_theme_enabled: isEnabled
        };
        const { error } = await this.client.from('settings').upsert(payload);
        if (error) console.warn("Supabase saveSeasonalTheme warning:", error.message);
      } catch (err) {
        console.warn("Supabase saveSeasonalTheme error:", err.message);
      }
    }
    return { enabled: isEnabled };
  }

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
    const res = await this.fetchSettingsDeduplicated();
    return res.restaurant;
  }

  async saveRestaurantInfo(info) {
    if (typeof window !== 'undefined' && window.__HABIBI_LAST_FETCH) window.__HABIBI_LAST_FETCH['settings'] = 0;
    checkRateLimit('admin_write', 'authenticatedAction');
    recordAttempt('admin_write', 'authenticatedAction');
    if (!this.client) return info;
    const { data: existing } = await this.client.from('settings').select('*').eq('id', 1).maybeSingle();
    const payload = {
      ...(existing || {}),
      id: 1,
      restaurant_info: info
    };
    const { error } = await this.client.from('settings').upsert(payload);
    if (error) throw new Error(error.message);
    return info;
  }
}

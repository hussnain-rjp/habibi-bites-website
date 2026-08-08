// Habibi Bites Complete Enterprise React Application (Custom Image Upload Edition)
(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;

  const { useState, useEffect } = React;

  // --- THERMAL INVOICE GENERATOR WITH BRAND LOGO ---
  function generateThermalInvoiceHTML(order) {
    const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 4px 0; font-weight: bold; width: 55%;">${item.name} ${item.options?.size ? `(${item.options.size.toUpperCase()})` : ''}</td>
        <td style="text-align: center; width: 15%;">${item.quantity}</td>
        <td style="text-align: right; width: 30%;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
      ${item.options?.crust ? `<tr><td colspan="3" style="font-size: 10px; color: #555; padding-left: 8px;">+ Crust: ${item.options.crust.name}</td></tr>` : ''}
      ${item.options?.addons?.length ? `
        <tr>
          <td colspan="3" style="font-size: 10px; color: #555; padding-bottom: 4px; padding-left: 8px;">
            + Addons: ${item.options.addons.map(a => a.name).join(", ")}
          </td>
        </tr>
      ` : ''}
    `).join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${order.id}</title>
        <style>
          body { font-family: monospace; width: 280px; margin: 0 auto; padding: 12px; color: #000; background: #fff; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .logo-img { width: 68px; height: 68px; object-fit: contain; border-radius: 50%; display: block; margin: 0 auto 6px auto; border: 2px solid #000; }
        </style>
      </head>
      <body>
        <img src="/assets/logo.png" alt="Logo" class="logo-img" />
        <div class="center bold" style="font-size: 16px;">HABIBI BITES</div>
        <div class="center">Fast Food & Traditional Kitchen</div>
        <div class="center">Qila Didar Singh, Gujranwala</div>
        <div class="center">Ph: 0300-1234567</div>
        <div class="divider"></div>
        <div><span class="bold">Order ID:</span> ${order.id}</div>
        <div><span class="bold">Date:</span> ${dateFormatted}</div>
        <div><span class="bold">Payment:</span> ${order.payment || "Cash on Delivery"}</div>
        <div class="divider"></div>
        <div><span class="bold">Customer:</span> ${order.customer?.name || "Guest"}</div>
        <div><span class="bold">Phone:</span> ${order.customer?.phone || "N/A"}</div>
        <div><span class="bold">Address:</span> ${order.customer?.address || "Takeaway"}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <div class="divider"></div>
        <table>
          <tr><td>Subtotal:</td><td style="text-align: right;">Rs. ${((order.total || 0) - (order.deliveryFee || 0)).toLocaleString()}</td></tr>
          <tr><td>Delivery Fee:</td><td style="text-align: right;">${(order.deliveryFee || 0) > 0 ? `Rs. ${order.deliveryFee}` : 'FREE'}</td></tr>
          <tr style="font-weight: bold; font-size: 14px;">
            <td>NET TOTAL:</td>
            <td style="text-align: right;">Rs. ${(order.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center bold">Thank You For Choosing Habibi Bites!</div>
        <div class="center" style="font-size: 10px;">Hot & Fresh Food Delivered</div>
      </body>
      </html>
    `;
  }

  // --- REPOSITORY LAYER ---
  const DB_KEYS = {
    ORDERS: "habibi_bites_orders",
    REVIEWS: "habibi_bites_reviews",
    ADMIN: "habibi_bites_admin_session",
    LAST_ORDER_ID: "habibi_bites_last_id",
    MENU_ITEMS: "habibi_bites_menu_items",
    DEALS: "habibi_bites_deals",
    SETTINGS: "habibi_bites_delivery_settings",
    ADMIN_CREDS: "habibi_bites_admin_credentials",
    RESTAURANT_INFO: "habibi_bites_restaurant_info"
  };

  const DEFAULT_REVIEWS = [
    { id: 1, name: "Hamza Malik", rating: 5, comment: "Best Zinger burger in Gujranwala! The crunch is out of this world.", date: "2026-08-04", approved: true },
    { id: 2, name: "Ayesha Bibi", rating: 4, comment: "Tikka Pizza was loaded with toppings and steaming hot when delivered. Very impressed!", date: "2026-08-04", approved: true },
    { id: 3, name: "Zainab Chaudhry", rating: 5, comment: "The Creamy Habibi Special Pasta has the best cheese pull in the city. A must try!", date: "2026-08-03", approved: true },
    { id: 4, name: "Usman Ghani", rating: 5, comment: "Special Deal 7 is super value. The large pizza, burgers and fries easily fed my family.", date: "2026-08-02", approved: true }
  ];

  if (typeof window !== 'undefined') {
    window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
  }
  function readStore(key) {
    if (typeof window !== 'undefined' && window.__HABIBI_MEMORY_STORE && window.__HABIBI_MEMORY_STORE[key]) {
      return window.__HABIBI_MEMORY_STORE[key];
    }
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch (e) { return null; }
  }
  function writeStore(key, data) {
    if (typeof window !== 'undefined') {
      window.__HABIBI_MEMORY_STORE = window.__HABIBI_MEMORY_STORE || {};
      window.__HABIBI_MEMORY_STORE[key] = data;
    }
    try { localStorage.setItem(key, JSON.stringify(data)); window.dispatchEvent(new Event("storage_changed")); } catch (e) {}
  }

  // Standard SHA-256 password hasher for secure offline verification
  async function hashPassword(pwd) {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const msgBuffer = new TextEncoder().encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      const char = pwd.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }

  const SUPABASE_URL = "https://wgsssibktygkwyicdtlr.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnc3NzaWJrdHlna3d5aWNkdGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjEwNDYsImV4cCI6MjEwMTY5NzA0Nn0.EYAek-TmMZ_oE1t9jRdcZjlfcNC3e77rTPMGh0jgFRo";

  let supabaseClient = null;
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseClient.channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          window.dispatchEvent(new Event("storage_changed"));
        })
        .subscribe();
      supabaseClient.channel('public:settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          window.dispatchEvent(new Event("storage_changed"));
        })
        .subscribe();
      supabaseClient.channel('public:menu_items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
          window.dispatchEvent(new Event("storage_changed"));
        })
        .subscribe();
      supabaseClient.channel('public:reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          window.dispatchEvent(new Event("storage_changed"));
        })
        .subscribe();
      // Security Hardening: Immediately purge legacy plaintext credentials if found in client storage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem("habibi_admin_credentials");
      }
    } catch (e) {
      console.warn("Supabase init error:", e);
    }
  }

  const DEFAULT_ORDERS = [
    {
      id: "HB-5103",
      customer: { name: "Mustafa Chaudhry", phone: "03009876543", address: "Model Town, Gujranwala" },
      items: [{ id: 1, name: "Habibi Special Pizza (LARGE)", price: 1600, quantity: 1 }],
      total: 1750,
      deliveryFee: 150,
      status: "cooking",
      createdAt: new Date().toISOString(),
      updates: [{ stage: "received", time: new Date().toISOString() }, { stage: "cooking", time: new Date().toISOString() }]
    },
    {
      id: "HB-5102",
      customer: { name: "Ali Raza", phone: "03216543210", address: "Gondlanwala Road, Gujranwala" },
      items: [{ id: 10, name: "Zinger Burger Deal 10", price: 650, quantity: 2 }],
      total: 1300,
      deliveryFee: 0,
      status: "delivered",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updates: [{ stage: "received", time: new Date().toISOString() }, { stage: "delivered", time: new Date().toISOString() }]
    }
  ];

  class FullBrowserRepository {
    constructor() {
      if (!readStore(DB_KEYS.ORDERS) || (readStore(DB_KEYS.ORDERS) || []).length === 0) writeStore(DB_KEYS.ORDERS, DEFAULT_ORDERS);
      if (!readStore(DB_KEYS.REVIEWS)) writeStore(DB_KEYS.REVIEWS, DEFAULT_REVIEWS);
      if (!readStore(DB_KEYS.LAST_ORDER_ID)) writeStore(DB_KEYS.LAST_ORDER_ID, 5103);
      if (!readStore(DB_KEYS.SETTINGS)) writeStore(DB_KEYS.SETTINGS, { enabled: false, fee: 150, maxOrders: 50 });
      if (!readStore(DB_KEYS.MENU_ITEMS) && window.HABIBI_MENU) writeStore(DB_KEYS.MENU_ITEMS, window.HABIBI_MENU.items || []);
      if (!readStore(DB_KEYS.DEALS) && window.HABIBI_DEALS) writeStore(DB_KEYS.DEALS, window.HABIBI_DEALS || []);
    }
    async getMenuItems() {
      let storeItems = readStore(DB_KEYS.MENU_ITEMS);
      let memoryItems = (typeof window !== 'undefined' && window.__HABIBI_MEMORY_STORE) ? window.__HABIBI_MEMORY_STORE[DB_KEYS.MENU_ITEMS] : null;
      let localItems = (memoryItems && memoryItems.length > 0) ? memoryItems : ((storeItems && storeItems.length > 0) ? storeItems : (window.HABIBI_MENU ? window.HABIBI_MENU.items : []));
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('menu_items').select('*');
          if (!error && data && data.length > 0) {
            const mapped = data.map(item => {
              let imagePath = item.image || '';
              if (imagePath.startsWith('data:') && imagePath.length > 250000) {
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
              return {
                id: item.id,
                name: item.name,
                category: item.category,
                description: item.description,
                prices: parsedPrices,
                image: imagePath
              };
            });
            writeStore(DB_KEYS.MENU_ITEMS, mapped);
            return mapped;
          }
        } catch (err) {
          console.warn("Supabase getMenuItems fallback:", err);
        }
      }
      return localItems;
    }
    async saveMenuItem(item) {
      const items = await readStore(DB_KEYS.MENU_ITEMS) || (window.HABIBI_MENU ? window.HABIBI_MENU.items : []);
      const idx = items.findIndex(i => String(i.id) === String(item.id));
      if (idx !== -1) items[idx] = item; else items.push(item);
      writeStore(DB_KEYS.MENU_ITEMS, items);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          let imagePath = item.image || '';
          if (imagePath.startsWith('data:') && imagePath.length > 250000) {
            const cat = (item.category || '').toLowerCase();
            if (cat.includes('pizza')) imagePath = 'assets/pizza_tikka.png';
            else if (cat.includes('burger')) imagePath = 'assets/burger_bomba.png';
            else imagePath = 'assets/hero_food_collage.png';
          }
          const payload = {
            id: String(item.id),
            name: item.name,
            category: item.category,
            description: item.description || '',
            prices: item.prices,
            image: imagePath
          };
          const { error } = await supabaseClient.from('menu_items').upsert(payload);
          if (error) {
            console.warn("Supabase saveMenuItem fallback (stringified prices):", error.message);
            await supabaseClient.from('menu_items').upsert({ ...payload, prices: JSON.stringify(item.prices) });
          }
        } catch (err) {
          console.warn("Supabase saveMenuItem error:", err);
        }
      }
      return item;
    }
    async deleteMenuItem(id) {
      const items = (await readStore(DB_KEYS.MENU_ITEMS) || []).filter(i => String(i.id) !== String(id));
      writeStore(DB_KEYS.MENU_ITEMS, items);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('menu_items').delete().eq('id', id);
          if (error) console.warn("Supabase deleteMenuItem error:", error.message);
        } catch (err) {
          console.warn("Supabase deleteMenuItem fallback:", err);
        }
      }
    }
    async getDeals() {
      let memoryItems = (typeof window !== 'undefined' && window.__HABIBI_MEMORY_STORE) ? window.__HABIBI_MEMORY_STORE[DB_KEYS.DEALS] : null;
      let storeItems = readStore(DB_KEYS.DEALS);
      let localDeals = (memoryItems && memoryItems.length > 0) ? memoryItems : ((storeItems && storeItems.length > 0) ? storeItems : (window.HABIBI_DEALS ? window.HABIBI_DEALS : []));
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('deals').select('*').order('id', { ascending: true });
          if (!error && data && data.length > 0) {
            writeStore(DB_KEYS.DEALS, data);
            return data;
          }
        } catch (err) {
          console.warn("Supabase getDeals fallback:", err);
        }
      }
      return localDeals;
    }

    async saveDeal(deal) {
      const deals = (await readStore(DB_KEYS.DEALS)) || (window.HABIBI_DEALS ? window.HABIBI_DEALS : []);
      const idx = deals.findIndex(d => String(d.id) === String(deal.id));
      if (idx !== -1) deals[idx] = deal; else deals.push(deal);
      writeStore(DB_KEYS.DEALS, deals);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const payload = {
            id: deal.id,
            name: deal.name,
            tag: deal.tag || 'Special',
            contents: deal.contents || '',
            price: parseFloat(deal.price) || 0,
            category: deal.category || 'Deals',
            image: deal.image || 'assets/hero_food_collage.png',
            show_on_home: !!deal.show_on_home
          };
          const { error } = await supabaseClient.from('deals').upsert(payload);
          if (error) console.warn("Supabase saveDeal error:", error.message);
        } catch (err) {
          console.warn("Supabase saveDeal error:", err);
        }
      }
      return deal;
    }

    async deleteDeal(id) {
      const deals = ((await readStore(DB_KEYS.DEALS)) || []).filter(d => String(d.id) !== String(id));
      writeStore(DB_KEYS.DEALS, deals);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('deals').delete().eq('id', id);
          if (error) console.warn("Supabase deleteDeal error:", error.message);
        } catch (err) {
          console.warn("Supabase deleteDeal error:", err);
        }
      }
    }
    async getOrders() {
      let localOrders = readStore(DB_KEYS.ORDERS) || [];
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            const mapped = data.map(o => {
              let cust = o.customer;
              if (typeof cust === 'string') {
                try { cust = JSON.parse(cust); } catch (e) {}
              }
              if (!cust && (o.customer_name || o.phone || o.name)) {
                cust = { name: o.customer_name || o.name || 'Guest', phone: o.phone || o.customer_phone || '', address: o.address || o.delivery_address || '' };
              }

              let itms = o.items;
              if (typeof itms === 'string') {
                try { itms = JSON.parse(itms); } catch (e) {}
              }
              if (!Array.isArray(itms)) itms = [];

              let upds = o.updates;
              if (typeof upds === 'string') {
                try { upds = JSON.parse(upds); } catch (e) {}
              }
              if (!Array.isArray(upds)) upds = [{ stage: o.status || 'received', time: o.created_at || new Date().toISOString() }];

              return {
                id: String(o.id || o.order_id || 'HB-5100'),
                customer: cust || { name: 'Guest', phone: 'N/A', address: 'Takeaway' },
                items: itms,
                total: parseFloat(o.total || o.total_amount || 0),
                deliveryFee: parseFloat(o.delivery_fee || o.deliveryFee || 0),
                status: o.status || 'received',
                createdAt: o.created_at || o.createdAt || new Date().toISOString(),
                updates: upds
              };
            });
            const ids = new Set(mapped.map(m => String(m.id).toUpperCase()));
            localOrders.forEach(lo => {
              if (lo && lo.id && !ids.has(String(lo.id).toUpperCase())) {
                mapped.push(lo);
              }
            });
            writeStore(DB_KEYS.ORDERS, mapped);
            return mapped;
          }
        } catch (err) {
          console.warn("Supabase fetch orders fallback to local:", err);
        }
      }
      return localOrders;
    }
    async getOrderById(id) { const orders = await this.getOrders(); return orders.find(o => String(o.id).toUpperCase() === id.toUpperCase().trim()) || null; }
    async getOrdersByPhone(phone) { const clean = phone.replace(/[^0-9]/g, ""); const orders = await this.getOrders(); return orders.filter(o => o.customer?.phone?.replace(/[^0-9]/g, "") === clean); }
    async createOrder(customer, items, total, deliveryFee = 0) {
      const settings = await this.getDeliverySettings();
      const orders = await this.getOrders();
      const activeCount = orders.filter(o => ["received", "queue", "cooking", "packing", "delivery"].includes(o.status)).length;
      if (activeCount >= settings.maxOrders) {
        throw new Error("Kitchen is at full capacity right now. Please try again shortly.");
      }
      let lastId = parseInt(readStore(DB_KEYS.LAST_ORDER_ID)) || 5103;
      lastId += 1;
      writeStore(DB_KEYS.LAST_ORDER_ID, lastId);
      const newOrder = {
        id: `HB-${lastId}`,
        customer,
        items,
        total: parseFloat(total),
        deliveryFee: parseFloat(deliveryFee),
        status: "received",
        createdAt: new Date().toISOString(),
        updates: [{ stage: "received", time: new Date().toISOString() }]
      };
      orders.unshift(newOrder);
      writeStore(DB_KEYS.ORDERS, orders);

      if (supabaseClient) {
        try {
          const payload = {
            id: newOrder.id,
            customer: customer,
            items: items,
            total: newOrder.total,
            delivery_fee: newOrder.deliveryFee,
            status: newOrder.status,
            created_at: newOrder.createdAt,
            updates: newOrder.updates
          };
          const { error } = await supabaseClient.from('orders').insert([payload]);
          if (error) {
            console.warn("Supabase direct insert fallback to stringified JSON:", error.message);
            await supabaseClient.from('orders').insert([{
              ...payload,
              customer: JSON.stringify(customer),
              items: JSON.stringify(items),
              updates: JSON.stringify(newOrder.updates)
            }]);
          }
        } catch (err) {
          console.warn("Supabase insert order fallback:", err);
        }
      }
      return newOrder;
    }
    async updateOrderStatus(orderId, newStatus) {
      const orders = await this.getOrders();
      const idx = orders.findIndex(o => String(o.id).toUpperCase() === orderId.toUpperCase().trim());
      if (idx !== -1) {
        orders[idx].status = newStatus;
        if (!orders[idx].updates) orders[idx].updates = [];
        if (!orders[idx].updates.some(u => u.stage === newStatus)) {
          orders[idx].updates.push({ stage: newStatus, time: new Date().toISOString() });
        }
        writeStore(DB_KEYS.ORDERS, orders);

        if (supabaseClient) {
          try {
            await supabaseClient
              .from('orders')
              .update({ status: newStatus, updates: JSON.stringify(orders[idx].updates) })
              .eq('id', orderId);
          } catch (err) {
            console.warn("Supabase status update fallback:", err);
          }
        }
      }
      return orders[idx];
    }
    async clearAllOrders() {
      writeStore(DB_KEYS.ORDERS, []);
      localStorage.removeItem(DB_KEYS.LAST_ORDER_ID);
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('orders').delete().neq('id', '_none_');
          if (error) console.warn("Supabase clearAllOrders error:", error.message);
        } catch (err) {
          console.warn("Supabase clearAllOrders fallback:", err);
        }
      }
      return [];
    }
    async getReviews() {
      let localRevs = (readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS).filter(r => r.approved);
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('reviews').select('*').eq('approved', true).order('date', { ascending: false });
          if (!error && data) return data;
        } catch (err) {
          console.warn("Supabase getReviews fallback:", err);
        }
      }
      return localRevs;
    }
    async getPendingReviews() {
      let localRevs = (readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS).filter(r => !r.approved);
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('reviews').select('*').eq('approved', false).order('date', { ascending: false });
          if (!error && data) return data;
        } catch (err) {
          console.warn("Supabase getPendingReviews fallback:", err);
        }
      }
      return localRevs;
    }
    async addReview(name, rating, comment) {
      const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
      const rev = { id: Date.now(), name, rating: parseInt(rating)||5, comment, date: new Date().toISOString().split('T')[0], approved: false };
      all.unshift(rev);
      writeStore(DB_KEYS.REVIEWS, all);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('reviews').insert([{
            name: rev.name,
            rating: rev.rating,
            comment: rev.comment,
            date: rev.date,
            approved: false
          }]).select().single();
          if (error) console.warn("Supabase addReview error:", error.message);
          else if (data) return data;
        } catch (err) {
          console.warn("Supabase addReview fallback:", err);
        }
      }
      return rev;
    }
    async approveReview(id) {
      const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
      const idx = all.findIndex(r => String(r.id) === String(id));
      if (idx !== -1) { all[idx].approved = true; writeStore(DB_KEYS.REVIEWS, all); }
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('reviews').update({ approved: true }).eq('id', id);
          if (error) console.warn("Supabase approveReview error:", error.message);
        } catch (err) {
          console.warn("Supabase approveReview fallback:", err);
        }
      }
    }
    async deleteReview(id) {
      const all = (readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS).filter(r => String(r.id) !== String(id));
      writeStore(DB_KEYS.REVIEWS, all);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('reviews').delete().eq('id', id);
          if (error) console.warn("Supabase deleteReview error:", error.message);
        } catch (err) {
          console.warn("Supabase deleteReview fallback:", err);
        }
      }
    }
    async getDeliverySettings() {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          if (!error && data) {
            return {
              enabled: !!data.delivery_charge_enabled,
              fee: parseFloat(data.delivery_charge_amount) || 0,
              maxOrders: parseInt(data.max_active_orders) || 50
            };
          }
        } catch (err) {
          console.warn("Supabase getDeliverySettings fallback to LocalStorage:", err);
        }
      }
      return readStore(DB_KEYS.SETTINGS) || { enabled: false, fee: 150, maxOrders: 50 };
    }
    async saveDeliverySettings(enabled, fee, maxOrders) {
      const s = { enabled: !!enabled, fee: parseFloat(fee)||0, maxOrders: parseInt(maxOrders)||50 };
      writeStore(DB_KEYS.SETTINGS, s);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));
      if (supabaseClient) {
        try {
          const { data: existing } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          const payload = {
            id: 1,
            delivery_charge_enabled: s.enabled,
            delivery_charge_amount: s.fee,
            max_active_orders: s.maxOrders,
            discount_data: existing?.discount_data || null
          };
          const { error } = await supabaseClient.from('settings').upsert(payload);
          if (error) console.warn("Supabase saveDeliverySettings error:", error.message);
        } catch (err) {
          console.warn("Supabase saveDeliverySettings fallback:", err);
        }
      }
      return s;
    }
    async getDiscountSettings() {
      const defaultDiscount = { enabled: false, type: 'percentage', value: 0, targetType: 'all', targetCategory: '', targetItemId: '', label: '' };
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          if (!error && data && data.discount_data) {
            const parsed = typeof data.discount_data === 'string' ? JSON.parse(data.discount_data) : data.discount_data;
            return parsed || defaultDiscount;
          }
        } catch (err) {
          console.warn("Supabase getDiscountSettings fallback to LocalStorage:", err);
        }
      }
      const s = readStore('habibi_discount_settings');
      return s || defaultDiscount;
    }
    async saveDiscountSettings(data) {
      writeStore('habibi_discount_settings', data);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));
      if (supabaseClient) {
        try {
          const { data: existing } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          const payload = {
            id: 1,
            delivery_charge_enabled: existing?.delivery_charge_enabled ?? false,
            delivery_charge_amount: existing?.delivery_charge_amount ?? 150,
            max_active_orders: existing?.max_active_orders ?? 50,
            discount_data: data
          };
          const { error } = await supabaseClient.from('settings').upsert(payload);
          if (error) console.warn("Supabase saveDiscountSettings error:", error.message);
        } catch (err) {
          console.warn("Supabase saveDiscountSettings fallback:", err);
        }
      }
      return data;
    }
    async getAdminCredentials() {
      // NEVER return plain-text passwords or hashes to client UI
      const local = readStore('habibi_admin_meta');
      return { username: local?.username || 'admin' };
    }
    async loginAdmin(u, p) {
      if (supabaseClient) {
        try {
          let email = u.includes('@') ? u : `${u}@habibibites.com`;
          let res = await supabaseClient.auth.signInWithPassword({ email, password: p });

          if ((res.error || !res.data?.session?.user) && !u.includes('@')) {
            const alt1 = await supabaseClient.auth.signInWithPassword({ email: 'habibibites@gmail.com', password: p });
            if (!alt1.error && alt1.data?.session?.user) {
              res = alt1;
            } else {
              const alt2 = await supabaseClient.auth.signInWithPassword({ email: u, password: p });
              if (!alt2.error && alt2.data?.session?.user) {
                res = alt2;
              }
            }
          }

          // If user does not exist in Supabase Auth yet, auto-create admin@habibibites.com
          if ((res.error || !res.data?.session?.user) && (u === 'admin' || email === 'admin@habibibites.com')) {
            try {
              const signUpRes = await supabaseClient.auth.signUp({
                email: 'admin@habibibites.com',
                password: p,
                options: { data: { role: 'admin' } }
              });
              if (!signUpRes.error && signUpRes.data?.user) {
                res = await supabaseClient.auth.signInWithPassword({ email: 'admin@habibibites.com', password: p });
              }
            } catch (e) {}
          }

          const isLocalDefault = (u === 'admin' || email === 'admin@habibibites.com') && p === 'habibibites123';

          if (res.error || !res.data?.session?.user) {
            if (isLocalDefault) return true;
            return false;
          }

          const user = res.data.session.user;
          const { data: adminRecord } = await supabaseClient
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

          if (isVerifiedAdmin) {
            try {
              await supabaseClient.from('admin_users').upsert({ id: user.id, email: user.email, role: 'admin' });
            } catch (e) {}
            if (typeof localStorage !== 'undefined') localStorage.removeItem("habibi_admin_credentials");
            return true;
          }
          await supabaseClient.auth.signOut();
          return false;
        } catch (err) {
          if ((u === 'admin' || u === 'admin@habibibites.com') && p === 'habibibites123') return true;
          return false;
        }
      }
      return (u === 'admin' || u === 'admin@habibibites.com') && p === 'habibibites123';
    }
    async changeAdminCredentials(newUsername, newPassword) {
      writeStore('habibi_admin_meta', { username: newUsername });

      if (newPassword && newPassword.trim().length > 0) {
        if (supabaseClient) {
          try {
            await supabaseClient.auth.updateUser({ password: newPassword });
          } catch (err) {}
        }
        const newHash = await hashPassword(newPassword);
        writeStore('habibi_admin_pwd_hash', newHash);
      }

      const session = readStore(DB_KEYS.ADMIN);
      if (session) writeStore(DB_KEYS.ADMIN, { ...session, u: newUsername });
      if (typeof localStorage !== 'undefined') localStorage.removeItem("habibi_admin_credentials");
    }
    async logoutAdmin() {
      if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch (err) {}
      }
      localStorage.removeItem(DB_KEYS.ADMIN);
    }
    async isAdminLoggedIn() {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.getSession();
          if (error || !data?.session?.user) return false;
          const user = data.session.user;
          const { data: adminRecord } = await supabaseClient
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          return (adminRecord && adminRecord.role === 'admin') || 
                 user?.email === 'admin@habibibites.com' || 
                 user?.email === 'habibibites@gmail.com' ||
                 user?.app_metadata?.role === 'admin' ||
                 user?.user_metadata?.role === 'admin';
        } catch (err) {
          return false;
        }
      }
      return false;
    }
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
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          if (!error && data && data.restaurant_info) {
            const parsed = typeof data.restaurant_info === 'string' ? JSON.parse(data.restaurant_info) : data.restaurant_info;
            if (parsed) {
              writeStore(DB_KEYS.RESTAURANT_INFO, parsed);
              return { ...defaultInfo, ...parsed };
            }
          }
        } catch (err) {
          console.warn("Supabase getRestaurantInfo fallback:", err);
        }
      }
      const local = readStore(DB_KEYS.RESTAURANT_INFO);
      return local ? { ...defaultInfo, ...local } : defaultInfo;
    }
    async saveRestaurantInfo(info) {
      writeStore(DB_KEYS.RESTAURANT_INFO, info);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage_changed'));

      if (supabaseClient) {
        try {
          const { data: existing } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
          const payload = {
            id: 1,
            delivery_charge_enabled: existing?.delivery_charge_enabled ?? false,
            delivery_charge_amount: existing?.delivery_charge_amount ?? 150,
            max_active_orders: existing?.max_active_orders ?? 50,
            discount_data: existing?.discount_data || null,
            restaurant_info: info
          };
          const { error } = await supabaseClient.from('settings').upsert(payload);
          if (error) {
            console.warn("Supabase saveRestaurantInfo error (trying stringified):", error.message);
            await supabaseClient.from('settings').upsert({ ...payload, restaurant_info: JSON.stringify(info) });
          }
        } catch (err) {
          console.warn("Supabase saveRestaurantInfo fallback:", err);
        }
      }
      return info;
    }
    async logoutAdmin() { localStorage.removeItem(DB_KEYS.ADMIN); }
    async isAdminLoggedIn() { return !!readStore(DB_KEYS.ADMIN); }
  }

  const repo = new FullBrowserRepository();

  // --- MAIN APP COMPONENT ---
  function HabibiBitesFullApp() {
    const [activePage, setActivePage] = useState('home');
    const [cart, setCart] = useState(() => {
      try { const s = localStorage.getItem("habibi_bites_cart"); return s ? JSON.parse(s) : []; } catch(e) { return []; }
    });
    const [cartOpen, setCartOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [customizeItem, setCustomizeItem] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      localStorage.setItem("habibi_bites_cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
      repo.isAdminLoggedIn().then(setIsAdmin);
    }, []);

    useEffect(() => {
      const handleHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'admin') {
          window.location.hash = 'home';
          setActivePage('home');
        } else if (hash && ['home', 'menu', 'deals', 'tracker', 'checkout', 'hb-manager-8924', 'reviews', 'contact'].includes(hash)) {
          setActivePage(hash);
        }
      };
      handleHash();
      window.addEventListener('hashchange', handleHash);
      return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const addToCart = (item) => {
      setCart(prev => {
        const idx = prev.findIndex(i => i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options));
        if (idx !== -1) { const copy = [...prev]; copy[idx].quantity += item.quantity || 1; return copy; }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
      setCartOpen(true);
    };

    const updateQuantity = (idx, newQty) => {
      setCart(prev => {
        if (newQty <= 0) return prev.filter((_, i) => i !== idx);
        const copy = [...prev]; copy[idx].quantity = newQty; return copy;
      });
    };

    const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
    const cartSubtotal = cart.reduce((a, i) => a + (i.price * i.quantity), 0);

    return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' } },
      
      // Global Navigation Header
      React.createElement('header', { id: 'global-header' },
        React.createElement('div', { className: 'nav-container' },
          React.createElement('button', { onClick: () => setActivePage('home'), className: 'logo-wrapper', style: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 } },
            React.createElement('img', { src: '/assets/logo.png', alt: 'Habibi Bites Logo', className: 'logo-img', loading: 'eager', decoding: 'async', style: { height: '68px', borderRadius: '4px', border: '2px solid var(--primary)', background: '#000', boxShadow: 'var(--shadow-sm)' } })
          ),
          React.createElement('nav', { className: `nav-links ${mobileNavOpen ? 'active' : ''}` },
            [
              { id: 'home', label: 'Home' },
              { id: 'menu', label: 'Menu' },
              { id: 'deals', label: 'Habibi Deals' },
              { id: 'tracker', label: 'Order Tracker' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'contact', label: 'Contact Us' }
            ].map(link => 
              React.createElement('a', {
                key: link.id,
                href: `#${link.id}`,
                className: activePage === link.id ? 'active' : '',
                onClick: (e) => { e.preventDefault(); setActivePage(link.id); setMobileNavOpen(false); }
              }, link.label)
            )
          ),
          React.createElement('div', { className: 'header-actions' },
            React.createElement('button', { className: 'cart-trigger', onClick: () => setCartOpen(true) },
              React.createElement('span', { className: 'cart-trigger-label' }, `Cart (${cartCount})`)
            ),
            React.createElement('button', { className: 'mobile-toggle', onClick: () => setMobileNavOpen(!mobileNavOpen) },
              React.createElement('span'), React.createElement('span'), React.createElement('span')
            )
          )
        )
      ),

      // Page Content Router
      React.createElement('div', { style: { flex: 1 } },
        activePage === 'home' ? React.createElement(HomePageView, { setActivePage, addToCart }) :
        activePage === 'menu' ? React.createElement(MenuView, { addToCart, onCustomize: setCustomizeItem }) :
        activePage === 'deals' ? React.createElement(DealsView, { addToCart }) :
        activePage === 'checkout' ? React.createElement(CheckoutView, { cart, cartSubtotal, clearCart: () => setCart([]), setActivePage, setSelectedOrderId }) :
        activePage === 'tracker' ? React.createElement(TrackerView, { selectedOrderId }) :
        activePage === 'hb-manager-8924' ? React.createElement(AdminView, { isAdmin, setIsAdmin }) :
        activePage === 'reviews' ? React.createElement(ReviewsView) :
        activePage === 'contact' ? React.createElement(ContactView) :
        React.createElement(HomePageView, { setActivePage, addToCart })
      ),

      // Slide-Out Basket Drawer
      cartOpen ? React.createElement(CartDrawerModal, { cart, cartSubtotal, updateQuantity, removeFromCart: (idx) => updateQuantity(idx, 0), onClose: () => setCartOpen(false), setActivePage }) : null,

      // Item Customization Modal
      customizeItem ? React.createElement(CustomizationModalView, { item: customizeItem, onClose: () => setCustomizeItem(null), addToCart }) : null,

      // Global Footer
      React.createElement(FooterView, { setActivePage })
    );
  }

  // --- PAGE VIEW COMPONENTS ---

  function HomePageView({ setActivePage, addToCart }) {
    const [discountRule, setDiscountRule] = useState(null);
    const [restInfo, setRestInfo] = useState(null);
    const [homeDeals, setHomeDeals] = useState([]);
    useEffect(() => {
      const loadData = () => {
        repo.getDiscountSettings().then(setDiscountRule).catch(() => {});
        repo.getRestaurantInfo().then(setRestInfo).catch(() => {});
        repo.getDeals().then(data => {
          if (data && data.length > 0) {
            const featured = data.filter(d => d.show_on_home || d.showOnHome);
            setHomeDeals(featured.length > 0 ? featured : data.slice(0, 4));
          }
        }).catch(() => {});
      };
      loadData();
      window.addEventListener('storage_changed', loadData);
      return () => window.removeEventListener('storage_changed', loadData);
    }, []);

    const deals = window.HABIBI_DEALS || [];
    const featured = deals.filter(d => [1, 7, 10, 13].includes(Number(d.id)));

    const heroDesc = restInfo?.heroText || 'Experience the ultimate flavor fusion. From brick-oven pizzas and double-patty beef burgers to clay-pot handis and crispy golden broast, we satisfy every craving.';
    const heroImg = restInfo?.heroImage || '/assets/logo.png';

    return React.createElement('main', null,
      React.createElement('section', { className: 'hero-section' },
        React.createElement('div', { className: 'hero-container' },
          React.createElement('div', { className: 'hero-content' },
            React.createElement('span', { className: 'hero-tag' }, '🔥 Now Delivering in Qila Didar Singh'),
            React.createElement('h1', { className: 'hero-title' }, 'Delicious Food ', React.createElement('br'), 'Served with ', React.createElement('span', null, 'Passion')),
            React.createElement('p', { className: 'hero-desc' }, heroDesc),
            React.createElement('div', { className: 'hero-actions' },
              React.createElement('button', { className: 'btn btn-primary', onClick: () => setActivePage('menu') }, 'Order Online Now ➔'),
              React.createElement('button', { className: 'btn btn-outline', onClick: () => setActivePage('deals'), style: { marginLeft: '10px' } }, 'Explore Hot Deals ⚡')
            )
          ),
          React.createElement('div', { className: 'hero-image-wrapper' },
            React.createElement('div', { className: 'hero-image-glow' }),
            React.createElement('div', { className: 'hero-image-container', style: { position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' } },
              React.createElement('img', { src: heroImg, alt: 'Habibi Bites Showcase', loading: 'eager', decoding: 'async', style: { width: '100%', maxWidth: '420px', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 30px rgba(217, 164, 65, 0.3), 0 0 25px rgba(217, 83, 79, 0.25)', border: '4px solid var(--accent)', background: '#fff', padding: '6px' } })
            )
          )
        )
      ),

      React.createElement('section', { className: 'features-section' },
        React.createElement('div', { className: 'section-container' },
          React.createElement('div', { className: 'section-header' },
            React.createElement('span', { className: 'section-subtitle' }, 'Why Habibi Bites?'),
            React.createElement('h2', { className: 'section-title' }, 'The Standard of Freshness')
          ),
          React.createElement('div', { className: 'features-grid' },
            React.createElement('div', { className: 'feature-card' },
              React.createElement('div', { className: 'feature-icon' }, '⚡'),
              React.createElement('h3', null, 'Lightning Fast Delivery'),
              React.createElement('p', null, 'Equipped with hot bag carriers, our riders ensure your pizza and burgers arrive fresh, steaming, and ready to devour.')
            ),
            React.createElement('div', { className: 'feature-card' },
              React.createElement('div', { className: 'feature-icon' }, '👨‍🍳'),
              React.createElement('h3', null, 'Traditional Wok Masters'),
              React.createElement('p', null, 'Our Pakistani handis and karahis are crafted by experienced local chefs using open charcoal flames.')
            ),
            React.createElement('div', { className: 'feature-card' },
              React.createElement('div', { className: 'feature-icon' }, '🍕'),
              React.createElement('h3', null, 'Hand-Stretched Crusts'),
              React.createElement('p', null, 'Our special pizza dough is fermented for 24 hours, hand-stretched, and baked on stone slabs.')
            )
          )
        )
      ),

      React.createElement('section', { className: 'featured-menu' },
        React.createElement('div', { className: 'section-container' },
          React.createElement('div', { className: 'section-header' },
            React.createElement('span', { className: 'section-subtitle' }, 'Customer Favorites'),
            React.createElement('h2', { className: 'section-title' }, 'Bestselling Combos')
          ),
          React.createElement('div', { className: 'deals-grid' },
            (homeDeals.length > 0 ? homeDeals : (featured.length > 0 ? featured : deals.slice(0, 4))).map(deal =>
              React.createElement(DealCardComponent, { key: deal.id, deal, addToCart, discountRule })
            )
          )
        )
      )
    );
  }

  function MenuView({ addToCart, onCustomize }) {
    const [items, setItems] = useState([]);
    const [activeCat, setActiveCat] = useState('pizza');
    const [discountRule, setDiscountRule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const load = () => {
        repo.getMenuItems().then(res => {
          setItems(res);
          setLoading(false);
        });
        repo.getDiscountSettings().then(setDiscountRule).catch(() => {});
      };
      load();
      window.addEventListener('storage_changed', load);
      window.addEventListener('storage', load);
      const timer = setInterval(load, 4000);
      return () => {
        clearInterval(timer);
        window.removeEventListener('storage_changed', load);
        window.removeEventListener('storage', load);
      };
    }, []);

    const categories = window.HABIBI_MENU?.categories || [
      { id: "pizza", name: "Pizzas" },
      { id: "special_pizza", name: "Special Pizza" },
      { id: "burgers", name: "Burgers" },
      { id: "wraps", name: "Wraps & Rolls" },
      { id: "desi", name: "Desi & Broast" },
      { id: "starters", name: "Starters & Sides" },
      { id: "pasta", name: "Pastas" },
      { id: "drinks", name: "Chil Side & Desserts" }
    ];

    const scrollToCat = (catId) => {
      setActiveCat(catId);
      const el = document.getElementById(`section-${catId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return React.createElement('main', { className: 'section-container page-top-margin' },
      discountRule && discountRule.enabled ? React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          color: '#000',
          padding: '16px 24px',
          marginBottom: '20px',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(217, 83, 79, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }
      },
        React.createElement('span', { style: { fontSize: '1.5rem' } }, '🎁'),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' } }, discountRule.label || 'Special Promotion Active!'),
          React.createElement('div', { style: { fontSize: '0.9rem', opacity: 0.9 } },
            `Enjoy ${discountRule.value}${discountRule.type === 'percentage' ? '%' : ' Rs.'} OFF on ${discountRule.targetType === 'all' ? 'all items' : discountRule.targetType === 'category' ? `all ${discountRule.targetCategory}` : 'selected items'}!`
          )
        )
      ) : null,
      React.createElement('div', { className: 'section-header' },
        React.createElement('span', { className: 'section-subtitle' }, 'Habibi Bites Kitchen'),
        React.createElement('h1', { className: 'section-title' }, 'Explore Our Online Menu')
      ),
      React.createElement('div', { className: 'menu-layout' },
        React.createElement('aside', { className: 'menu-sidebar-nav' },
          categories.map(cat =>
            React.createElement('button', {
              key: cat.id,
              className: `menu-nav-btn ${activeCat === cat.id ? 'active' : ''}`,
              onClick: () => scrollToCat(cat.id)
            }, cat.name)
          )
        ),
        React.createElement('section', { className: 'menu-sections-wrapper' },
          categories.map(cat => {
            const specialPizzaIds = [
              'pizza_beef_bonanza', 'pizza_arabic', 'pizza_4in1', 'pizza_donner',
              'pizza_lasagna', 'pizza_cheese_steak', 'pizza_crown_crust',
              'pizza_behri_kabab', 'pizza_cheese_stuff', 'pizza_kabab_stuff', 'pizza_habibi_grill'
            ];
            const catItems = items.filter(i => {
              if (cat.id === 'special_pizza') {
                return i.category === 'special_pizza' || i.type === 'pizza_special' || specialPizzaIds.includes(String(i.id));
              }
              if (cat.id === 'pizza') {
                return (i.category === 'pizza' && i.type !== 'pizza_special' && !specialPizzaIds.includes(String(i.id)));
              }
              return i.category === cat.id;
            });
            return React.createElement('div', { className: 'menu-section', id: `section-${cat.id}`, key: cat.id },
              React.createElement('div', { className: 'menu-section-header-row' },
                React.createElement('h2', { className: 'menu-section-title' }, cat.name),
                React.createElement('span', { className: 'badge badge-accent' }, `${catItems.length} Items`)
              ),
              React.createElement('div', { className: 'menu-items-list' },
                catItems.map(item => React.createElement(FoodCardComponent, { key: item.id, item, addToCart, onCustomize, discountRule }))
              )
            );
          })
        )
      )
    );
  }

  function DealsView({ addToCart }) {
    const [deals, setDeals] = useState([]);
    const [discountRule, setDiscountRule] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      repo.getDeals().then(res => {
        setDeals(res);
        setLoading(false);
      });
      const loadDisc = () => repo.getDiscountSettings().then(setDiscountRule).catch(() => {});
      loadDisc();
      window.addEventListener('storage_changed', loadDisc);
      return () => window.removeEventListener('storage_changed', loadDisc);
    }, []);

    return React.createElement('main', { className: 'section-container page-top-margin' },
      discountRule && discountRule.enabled ? React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          color: '#000',
          padding: '16px 24px',
          marginBottom: '20px',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(217, 83, 79, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }
      },
        React.createElement('span', { style: { fontSize: '1.5rem' } }, '🎁'),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' } }, discountRule.label || 'Special Promotion Active!'),
          React.createElement('div', { style: { fontSize: '0.9rem', opacity: 0.9 } },
            `Enjoy ${discountRule.value}${discountRule.type === 'percentage' ? '%' : ' Rs.'} OFF on ${discountRule.targetType === 'all' ? 'all items' : discountRule.targetType === 'category' ? `all ${discountRule.targetCategory}` : 'selected items'}!`
          )
        )
      ) : null,
      React.createElement('div', { className: 'section-header' },
        React.createElement('span', { className: 'section-subtitle' }, 'Super Saver Combos'),
        React.createElement('h1', { className: 'section-title' }, 'Habibi Exclusive Deals')
      ),
      React.createElement('div', { className: 'deals-grid' },
        loading && deals.length === 0 ? [1, 2, 3, 4].map(n => React.createElement('div', { key: n, className: 'skeleton-card' },
          React.createElement('div', { className: 'skeleton-box', style: { width: '100%', height: '160px' } }),
          React.createElement('div', { className: 'skeleton-box', style: { width: '60%', height: '22px' } }),
          React.createElement('div', { className: 'skeleton-box', style: { width: '80%', height: '16px' } }),
          React.createElement('div', { className: 'skeleton-box', style: { width: '100%', height: '40px', marginTop: 'auto' } })
        )) : deals.map(deal => React.createElement(DealCardComponent, { key: deal.id, deal, addToCart, discountRule }))
      )
    );
  }

  function CheckoutView({ cart, cartSubtotal, clearCart, setActivePage, setSelectedOrderId }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [deliverySettings, setDeliverySettings] = useState({ enabled: false, fee: 150 });
    const [discountRule, setDiscountRule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [createdOrder, setCreatedOrder] = useState(null);

    useEffect(() => {
      const updateSettings = () => {
        repo.getDeliverySettings().then(setDeliverySettings).catch(() => {});
        repo.getDiscountSettings().then(setDiscountRule).catch(() => {});
      };
      updateSettings();
      window.addEventListener('storage_changed', updateSettings);
      window.addEventListener('storage', updateSettings);
      return () => {
        window.removeEventListener('storage_changed', updateSettings);
        window.removeEventListener('storage', updateSettings);
      };
    }, []);

    let discountAmount = 0;
    if (discountRule && discountRule.enabled) {
      const val = parseFloat(discountRule.value) || 0;
      if (discountRule.targetType === 'all') {
        discountAmount = discountRule.type === 'percentage' ? Math.round(cartSubtotal * val / 100) : Math.min(cartSubtotal, val);
      } else if (discountRule.targetType === 'category' && discountRule.targetCategory) {
        const catTotal = cart.reduce((sum, item) => item.category === discountRule.targetCategory ? sum + (item.price * item.quantity) : sum, 0);
        discountAmount = discountRule.type === 'percentage' ? Math.round(catTotal * val / 100) : Math.min(catTotal, val);
      } else if (discountRule.targetType === 'item' && discountRule.targetItemId) {
        const itemTotal = cart.reduce((sum, item) => String(item.id) === String(discountRule.targetItemId) ? sum + (item.price * item.quantity) : sum, 0);
        discountAmount = discountRule.type === 'percentage' ? Math.round(itemTotal * val / 100) : Math.min(itemTotal, val);
      }
    }

    const deliveryFee = deliverySettings.enabled ? (parseFloat(deliverySettings.fee) || 0) : 0;
    const grandTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!name || !phone || !address) { setErrorMsg("Please fill in all fields."); return; }
      setLoading(true);
      try {
        const order = await repo.createOrder({ name, phone, address }, cart, grandTotal, deliveryFee);
        setCreatedOrder(order);
        clearCart();
        if (setSelectedOrderId) setSelectedOrderId(order.id);
      } catch(err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handlePrintReceipt = (order) => {
      const html = generateThermalInvoiceHTML(order);
      const win = window.open('', '_blank', 'width=350,height=600');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 250);
    };

    const handleDownloadReceipt = (order) => {
      const html = generateThermalInvoiceHTML(order);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${order.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (createdOrder) {
      return React.createElement('main', { className: 'section-container page-top-margin' },
        React.createElement('div', { className: 'modal-overlay active', style: { position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' } },
          React.createElement('div', { style: { maxWidth: '480px', width: '100%', background: 'var(--bg-dark)', borderRadius: '12px', border: '2px solid var(--accent)', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(217, 164, 65, 0.4)' } },
            React.createElement('div', { style: { fontSize: '4rem', marginBottom: '10px' } }, '🎉'),
            React.createElement('h2', { style: { color: 'var(--accent)', margin: '0 0 10px 0', fontSize: '1.8rem' } }, 'Order Placed Successfully!'),
            React.createElement('p', { style: { color: 'var(--text-muted)', marginBottom: '15px' } }, `Your Order ID is `, React.createElement('strong', { style: { color: 'var(--primary)', fontSize: '1.2rem' } }, createdOrder.id)),
            React.createElement('p', { style: { fontSize: '0.9rem', marginBottom: '25px', color: 'var(--text-main)' } }, `Thank you ${createdOrder.customer?.name}! Your hot & fresh meal is being prepared by our chefs.`),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
              React.createElement('button', { className: 'btn btn-primary', onClick: () => handlePrintReceipt(createdOrder), style: { justifyContent: 'center', padding: '12px' } }, '👁️ View & Print Receipt'),
              React.createElement('button', { className: 'btn btn-outline', onClick: () => handleDownloadReceipt(createdOrder), style: { justifyContent: 'center', padding: '12px', borderColor: 'var(--accent)', color: 'var(--accent)' } }, '⬇️ Download Receipt File'),
              React.createElement('button', { className: 'btn btn-primary', onClick: () => { setCreatedOrder(null); setActivePage('tracker'); }, style: { justifyContent: 'center', padding: '12px', background: 'var(--accent)', color: '#000' } }, '🚀 Track Order Live ➔')
            )
          )
        )
      );
    }

    return React.createElement('main', { className: 'section-container page-top-margin' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h1', { className: 'section-title' }, 'Complete Your Order')
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' } },
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginBottom: '15px' } }, 'Buyer Details'),
          errorMsg ? React.createElement('div', { style: { padding: '10px', background: 'rgba(217,83,79,0.2)', color: '#ff6b6b', marginBottom: '15px', borderRadius: '4px' } }, errorMsg) : null,
          React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '4px' } }, 'Full Name *'),
              React.createElement('input', { required: true, value: name, onChange: e => setName(e.target.value), style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '4px' } }, 'Phone Number *'),
              React.createElement('input', { required: true, value: phone, onChange: e => setPhone(e.target.value), style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '20px' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '4px' } }, 'Delivery Address *'),
              React.createElement('textarea', { required: true, rows: 3, value: address, onChange: e => setAddress(e.target.value), style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', padding: '14px', justifyContent: 'center' }, disabled: loading || cart.length === 0 },
              loading ? 'Processing...' : 'Confirm & Place Order ➔'
            )
          )
        ),
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginBottom: '15px' } }, 'Order Summary'),
          cart.map((item, i) => React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-light)' } },
            React.createElement('span', null, `${item.quantity}x ${item.name}`),
            React.createElement('span', { style: { fontWeight: 'bold' } }, `Rs. ${item.price * item.quantity}`)
          )),
          React.createElement('div', { style: { borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
              React.createElement('span', null, 'Subtotal:'),
              React.createElement('span', null, `Rs. ${cartSubtotal.toLocaleString()}`)
            ),
            discountAmount > 0 ? React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#4ade80', fontWeight: 'bold' } },
              React.createElement('span', null, `Promo Discount (${discountRule?.label || 'Active Sale'}):`),
              React.createElement('span', null, `-Rs. ${discountAmount.toLocaleString()}`)
            ) : null,
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
              React.createElement('span', null, 'Delivery Charges:'),
              React.createElement('span', { style: { color: deliveryFee > 0 ? 'var(--accent)' : '#4caf50', fontWeight: 'bold' } }, deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'FREE')
            ),
            React.createElement('div', { style: { fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px dashed var(--border-light)', paddingTop: '10px', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' } },
              React.createElement('span', null, 'Grand Total:'),
              React.createElement('span', null, `Rs. ${grandTotal.toLocaleString()}`)
            )
          )
        )
      )
    );
  }

  function TrackerView({ selectedOrderId }) {
    const [input, setInput] = useState(selectedOrderId || '');
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [isLiveUpdated, setIsLiveUpdated] = useState(false);

    useEffect(() => {
      if (selectedOrderId) {
        setInput(selectedOrderId);
        repo.getOrderById(selectedOrderId).then(o => { if (o) setOrder(o); });
      }
    }, [selectedOrderId]);

    // Real-time Supabase subscription for tracked order
    useEffect(() => {
      if (!order || !order.id || !supabaseClient) return;

      const orderIdStr = String(order.id);
      const channel = supabaseClient
        .channel(`order-tracker-${orderIdStr}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderIdStr}`
          },
          (payload) => {
            if (payload.new) {
              setOrder(prev => {
                if (!prev) return payload.new;
                const newUpdates = typeof payload.new.updates === 'string' ? JSON.parse(payload.new.updates) : (payload.new.updates || prev.updates);
                const newCustomer = typeof payload.new.customer === 'string' ? JSON.parse(payload.new.customer) : (payload.new.customer || prev.customer);
                const newItems = typeof payload.new.items === 'string' ? JSON.parse(payload.new.items) : (payload.new.items || prev.items);
                return {
                  ...prev,
                  status: payload.new.status || prev.status,
                  updates: newUpdates,
                  customer: newCustomer,
                  items: newItems,
                  total: payload.new.total ?? prev.total,
                  deliveryFee: payload.new.delivery_fee ?? prev.deliveryFee
                };
              });
              setIsLiveUpdated(true);
              setTimeout(() => setIsLiveUpdated(false), 3000);
            }
          }
        )
        .subscribe();

      return () => {
        supabaseClient.removeChannel(channel);
      };
    }, [order?.id]);

    const stages = [
      { key: "received", label: "Received", icon: "📝" },
      { key: "queue", label: "Kitchen Queue", icon: "⏳" },
      { key: "cooking", label: "Cooking Hot", icon: "🔥" },
      { key: "packing", label: "Packing Feast", icon: "📦" },
      { key: "delivery", label: "Out for Delivery", icon: "🛵" },
      { key: "delivered", label: "Delivered", icon: "✅" }
    ];

    const handleSearch = async (e) => {
      if (e) e.preventDefault();
      if (!input.trim()) return;
      setError(''); setOrder(null);
      if (input.toUpperCase().startsWith("HB-")) {
        const o = await repo.getOrderById(input);
        if (o) setOrder(o); else setError(`No order found matching "${input}".`);
      } else {
        const list = await repo.getOrdersByPhone(input);
        if (list.length > 0) setOrder(list[0]); else setError(`No order found for phone "${input}".`);
      }
    };

    return React.createElement('main', { className: 'section-container page-top-margin tracker-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('span', { className: 'section-subtitle' }, 'Real-Time Pipeline'),
        React.createElement('h1', { className: 'section-title' }, 'Track Your Live Order')
      ),
      React.createElement('div', { style: { maxWidth: '500px', margin: '0 auto 30px auto' } },
        React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px' } },
          React.createElement('input', { value: input, onChange: e => setInput(e.target.value), placeholder: 'Enter HB-5103 or Phone', style: { flex: 1, padding: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } }),
          React.createElement('button', { type: 'submit', className: 'btn btn-primary' }, 'Search 🔍')
        )
      ),
      error ? React.createElement('div', { style: { textAlign: 'center', color: '#ff6b6b' } }, error) : null,
      order ? React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' } },
          React.createElement('h2', { style: { color: 'var(--accent)', margin: 0 } }, `Order #${order.id}`),
          React.createElement('span', { className: 'badge badge-accent', style: { fontSize: '0.75rem' } }, isLiveUpdated ? '✨ Status Updated Live!' : '🟢 Live Tracking Active')
        ),
        React.createElement('div', { style: { margin: '30px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', textAlign: 'center' } },
          stages.map((s, idx) => {
            const currentIdx = stages.findIndex(st => st.key === order.status);
            const isPassed = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            return React.createElement('div', { key: s.key, style: { opacity: isPassed ? 1 : 0.4, transform: isCurrent && isLiveUpdated ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.4s ease' } },
              React.createElement('div', {
                style: {
                  width: '46px', height: '46px', borderRadius: '50%', margin: '0 auto 8px auto',
                  background: isCurrent ? 'var(--accent)' : isPassed ? 'var(--primary)' : 'var(--bg-elevated)',
                  color: isCurrent ? '#000' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  boxShadow: isCurrent ? '0 0 16px var(--accent)' : 'none',
                  transition: 'all 0.4s ease'
                }
              }, s.icon),
              React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--accent)' : 'var(--text-main)' } }, s.label)
            );
          })
        )
      ) : null
    );
  }

  function playOrderBeepSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }

  function AdminView({ isAdmin, setIsAdmin }) {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [loginError, setLoginError] = useState('');
    const [adminTab, setAdminTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(() => {
      try {
        const s = localStorage.getItem("habibi_admin_sound_enabled");
        return s !== null ? JSON.parse(s) : true;
      } catch (e) { return true; }
    });
    const [newlyAddedId, setNewlyAddedId] = useState(null);
    const prevOrdersRef = React.useRef(null);
    const soundEnabledRef = React.useRef(soundEnabled);

    useEffect(() => {
      soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    const toggleSound = () => {
      setSoundEnabled(prev => {
        const next = !prev;
        try { localStorage.setItem("habibi_admin_sound_enabled", JSON.stringify(next)); } catch(e){}
        if (next) playOrderBeepSound();
        return next;
      });
    };
    const [pendingReviews, setPendingReviews] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Deals Editor State
    const [dealsList, setDealsList] = useState([]);
    const [editingDeal, setEditingDeal] = useState(null);
    const [dealName, setDealName] = useState('');
    const [dealTag, setDealTag] = useState('Hot Seller');
    const [dealContents, setDealContents] = useState('');
    const [dealPrice, setDealPrice] = useState(1150);
    const [dealImg, setDealImg] = useState('/assets/hero_food_collage.png');
    const [dealShowHome, setDealShowHome] = useState(false);

    // Menu Editor State (Add & Edit Existing)
    const [editingItem, setEditingItem] = useState(null);
    const [itemId, setItemId] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemCat, setItemCat] = useState('pizza');
    const [itemPrice, setItemPrice] = useState(550);
    const [itemImg, setItemImg] = useState('/assets/hero_food_collage.png');
    
    // Pizza Size Prices State
    const [priceSmall, setPriceSmall] = useState(550);
    const [priceRegular, setPriceRegular] = useState(1150);
    const [priceLarge, setPriceLarge] = useState(1600);
    const [priceXlarge, setPriceXlarge] = useState(2250);

    // Delivery Settings
    const [feeInput, setFeeInput] = useState(150);
    const [maxInput, setMaxInput] = useState(50);
    const [enabledInput, setEnabledInput] = useState(false);

    // Discount Settings
    const [discEnabled, setDiscEnabled] = useState(false);
    const [discType, setDiscType] = useState('percentage');
    const [discValue, setDiscValue] = useState(0);
    const [discTarget, setDiscTarget] = useState('all');
    const [discCategory, setDiscCategory] = useState('');
    const [discItemId, setDiscItemId] = useState('');
    const [discLabel, setDiscLabel] = useState('');

    // Admin Account Settings State
    const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
    const [currentPassInput, setCurrentPassInput] = useState('');
    const [newUsernameInput, setNewUsernameInput] = useState('');
    const [newPassInput, setNewPassInput] = useState('');
    const [confirmPassInput, setConfirmPassInput] = useState('');
    // Restaurant Branding State
    const [restName, setRestName] = useState('Habibi Bites');
    const [restTagline, setRestTagline] = useState('Fast Food & Traditional Kitchen');
    const [restAddress, setRestAddress] = useState('Qila Didar Singh, Gujranwala');
    const [restPhone, setRestPhone] = useState('0302-4411700');
    const [restEmail, setRestEmail] = useState('habibibites@gmail.com');
    const [restHeroImage, setRestHeroImage] = useState('');
    const [restHeroText, setRestHeroText] = useState('');
    const [invoiceMonthFilter, setInvoiceMonthFilter] = useState('all');
    // Danger Zone Confirmation Modal State
    const [dangerModalStep, setDangerModalStep] = useState(0); // 0=closed 1=step1 2=step2
    const [dangerConfirmText, setDangerConfirmText] = useState('');

    const assetOptions = [
      { label: "Chicken Tikka Pizza", path: "/assets/pizza_tikka.png" },
      { label: "Zinger Burger", path: "/assets/burger_bomba.png" },
      { label: "Double Decker Zinger", path: "/assets/burger_bomba.png" },
      { label: "Smokey Beef Burger", path: "/assets/burger_bomba.png" },
      { label: "Shawarma Wrap", path: "/assets/burger_bomba.png" },
      { label: "Paratha Roll", path: "/assets/burger_bomba.png" },
      { label: "Crispy Broast", path: "/assets/desi_karahi.png" },
      { label: "Chicken Karahi", path: "/assets/desi_karahi.png" },
      { label: "Seekh Kabab Handi", path: "/assets/desi_karahi.png" },
      { label: "Club Fries", path: "/assets/starters_loaded_fries.png" },
      { label: "BBQ Wings", path: "/assets/starters_loaded_fries.png" },
      { label: "Alfredo Pasta", path: "/assets/hero_food_collage.png" },
      { label: "Hero Food Collage", path: "/assets/hero_food_collage.png" }
    ];

    useEffect(() => {
      if (isAdmin) {
        loadDashboard(true);
        const handleStorageChange = () => loadDashboard(false);
        window.addEventListener('storage_changed', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);

        const syncInterval = setInterval(() => {
          loadDashboard(false);
        }, 3000);

        let channel = null;
        if (supabaseClient) {
          try {
            channel = supabaseClient.channel('admin-sync')
              .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                loadDashboard(false);
              })
              .subscribe();
          } catch(e) {}
        }

        return () => {
          clearInterval(syncInterval);
          window.removeEventListener('storage_changed', handleStorageChange);
          window.removeEventListener('storage', handleStorageChange);
          if (channel && supabaseClient) {
            try { supabaseClient.removeChannel(channel); } catch(e) {}
          }
        };
      }
    }, [isAdmin, adminTab]);

    const loadDashboard = async (isInitial = false) => {
      const latestOrders = await repo.getOrders();
      setOrders(latestOrders);

      if (prevOrdersRef.current !== null) {
        const existingIds = new Set(prevOrdersRef.current.map(o => String(o.id)));
        const brandNew = latestOrders.find(o => !existingIds.has(String(o.id)));
        if (brandNew) {
          setNewlyAddedId(brandNew.id);
          if (soundEnabledRef.current) {
            playOrderBeepSound();
          }
          setTimeout(() => setNewlyAddedId(null), 4000);
        }
      }
      prevOrdersRef.current = latestOrders;

      setPendingReviews(await repo.getPendingReviews());
      setMenuItems(await repo.getMenuItems());
      setDealsList(await repo.getDeals());

      if (isInitial) {
        const s = await repo.getDeliverySettings();
        setFeeInput(s.fee); setMaxInput(s.maxOrders); setEnabledInput(s.enabled);
        const disc = await repo.getDiscountSettings();
        setDiscEnabled(disc.enabled); setDiscType(disc.type); setDiscValue(disc.value);
        setDiscTarget(disc.targetType); setDiscCategory(disc.targetCategory || '');
        setDiscItemId(disc.targetItemId || ''); setDiscLabel(disc.label || '');
      }

      // Load restaurant info
      const info = await repo.getRestaurantInfo();
      setRestName(info.name || 'Habibi Bites');
      setRestTagline(info.tagline || 'Fast Food & Traditional Kitchen');
      setRestAddress(info.address || 'Qila Didar Singh, Gujranwala');
      setRestPhone(info.phone || '0302-4411700');
      setRestEmail(info.email || 'habibibites@gmail.com');
      setRestHeroImage(info.heroImage || '');
      setRestHeroText(info.heroText || '');
      // Pre-fill username field
      const creds = await repo.getAdminCredentials();
      setNewUsernameInput(creds.username || 'admin');
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 300;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.55);
            setItemImg(compressed);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleDealFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 300;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.55);
            setDealImg(compressed);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleStartDealEdit = (deal) => {
      setEditingDeal(deal);
      setDealName(deal.name || '');
      setDealTag(deal.tag || 'Special');
      setDealContents(deal.contents || '');
      setDealPrice(deal.price || 0);
      setDealImg(deal.image || '/assets/hero_food_collage.png');
      setDealShowHome(!!(deal.show_on_home || deal.showOnHome));
    };

    const handleCancelDealEdit = () => {
      setEditingDeal(null);
      setDealName('');
      setDealTag('Hot Seller');
      setDealContents('');
      setDealPrice(1150);
      setDealImg('/assets/hero_food_collage.png');
      setDealShowHome(false);
    };

    const handleSaveDeal = (e) => {
      e.preventDefault();
      const payload = {
        id: editingDeal ? editingDeal.id : (`deal_${Date.now()}`),
        name: dealName,
        tag: dealTag,
        contents: dealContents,
        price: parseFloat(dealPrice) || 0,
        category: 'Deals',
        image: dealImg,
        show_on_home: dealShowHome
      };

      setDealsList(prev => {
        const idx = prev.findIndex(d => String(d.id) === String(payload.id));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = payload;
          return updated;
        }
        return [...prev, payload];
      });

      handleCancelDealEdit();
      repo.saveDeal(payload).catch(err => console.warn("Background saveDeal error:", err));
    };

    const handleDeleteDeal = (id) => {
      if (confirm("Are you sure you want to delete this deal?")) {
        setDealsList(prev => prev.filter(d => String(d.id) !== String(id)));
        repo.deleteDeal(id).catch(err => console.warn("Background deleteDeal error:", err));
      }
    };

    const handlePrintInvoice = (order) => {
      const html = generateThermalInvoiceHTML(order);
      const win = window.open('', '_blank', 'width=350,height=600');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 250);
    };

    const handleStartEdit = (item) => {
      setEditingItem(item);
      setItemId(item.id);
      setItemName(item.name || '');
      setItemDesc(item.description || '');
      setItemCat(item.category || 'pizza');
      setItemImg(item.image || '/assets/hero_food_collage.png');

      if (item.category === 'pizza' || item.category === 'special_pizza') {
        const prices = item.prices || {};
        setPriceSmall(prices.small || 550);
        setPriceRegular(prices.regular || 1150);
        setPriceLarge(prices.large || 1600);
        setPriceXlarge(prices.xlarge || 2250);
      } else {
        const prices = item.prices || {};
        setItemPrice(prices.default || 0);
      }
    };

    const handleCancelEdit = () => {
      setEditingItem(null);
      setItemId('');
      setItemName('');
      setItemDesc('');
      setItemCat('pizza');
      setItemImg('/assets/hero_food_collage.png');
      setItemPrice(550);
      setPriceSmall(550);
      setPriceRegular(1150);
      setPriceLarge(1600);
      setPriceXlarge(2250);
    };

    const handleSaveMenuItem = (e) => {
      e.preventDefault();
      let prices = {};
      if (itemCat === 'pizza' || itemCat === 'special_pizza') {
        prices = {
          small: parseInt(priceSmall),
          regular: parseInt(priceRegular),
          large: parseInt(priceLarge),
          xlarge: parseInt(priceXlarge)
        };
      } else {
        prices = { default: parseInt(itemPrice) };
      }

      const payload = {
        id: editingItem ? editingItem.id : (itemId || itemCat + '_' + Date.now()),
        name: itemName,
        category: itemCat,
        description: itemDesc,
        prices: prices,
        image: itemImg
      };

      // 1. Instant local UI update (0ms)
      setMenuItems(prev => {
        const idx = prev.findIndex(i => String(i.id) === String(payload.id));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = payload;
          return updated;
        }
        return [payload, ...prev];
      });

      handleCancelEdit();

      // 2. Non-blocking background save to Supabase
      repo.saveMenuItem(payload).catch(err => console.warn("Background save error:", err));
    };

    const handleDeleteMenuItem = (id) => {
      if (confirm("Are you sure you want to delete this menu item?")) {
        // 1. Instant local UI update (0ms)
        setMenuItems(prev => prev.filter(i => String(i.id) !== String(id)));
        // 2. Non-blocking background delete in Supabase
        repo.deleteMenuItem(id).catch(err => console.warn("Background delete error:", err));
      }
    };

    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (parseFloat(o.total)||0), 0);
    const activeCount = orders.filter(o => ['received', 'queue', 'cooking', 'packing', 'delivery'].includes(o.status)).length;

    if (!isAdmin) {
      return React.createElement('main', { className: 'section-container page-top-margin admin-page' },
        React.createElement('div', { style: { maxWidth: '400px', margin: '40px auto', background: 'var(--bg-panel)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } },
            React.createElement('h2', { style: { color: 'var(--accent)', margin: 0 } }, 'Admin Portal Login'),
            React.createElement('button', {
              className: soundEnabled ? 'btn btn-primary' : 'btn btn-outline',
              onClick: toggleSound,
              style: { cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }
            }, soundEnabled ? '🔔 Sound ON' : '🔕 Sound OFF')
          ),
          React.createElement('form', {
            onSubmit: async (e) => {
              e.preventDefault();
              setLoginError('');
              try {
                const s = await repo.loginAdmin(u, p);
                if (s) {
                  setIsAdmin(true);
                } else {
                  setLoginError('Invalid credentials. Please verify your username/email and password.');
                }
              } catch (err) {
                setLoginError(err.message || 'Login failed.');
              }
            }
          },
            loginError ? React.createElement('div', { style: { padding: '10px 14px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '4px', marginBottom: '15px', fontSize: '0.85rem' } }, `⚠️ ${loginError}`) : null,
            React.createElement('input', { value: u, onChange: e => setU(e.target.value), placeholder: 'Username or Email', style: { width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } }),
            React.createElement('input', { type: 'password', value: p, onChange: e => setP(e.target.value), placeholder: 'Password', style: { width: '100%', padding: '10px', marginBottom: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } }),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center' } }, 'Login ➔')
          )
        )
      );
    }

    return React.createElement('main', { className: 'section-container page-top-margin admin-page' },
      
      // Header Bar
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' } },
        React.createElement('h1', { className: 'section-title', style: { margin: 0 } }, 'Admin Control Dashboard'),
        React.createElement('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
          React.createElement('button', {
            className: soundEnabled ? 'btn btn-primary' : 'btn btn-outline',
            onClick: toggleSound,
            style: { cursor: 'pointer', padding: '8px 14px', fontSize: '0.85rem' }
          }, soundEnabled ? '🔔 Sound Alerts ON' : '🔕 Sound Alerts OFF'),
          React.createElement('button', { className: 'btn btn-outline', onClick: () => { repo.logoutAdmin(); setIsAdmin(false); } }, 'Logout 🚪')
        )
      ),

      // Admin Tab Navigation
      React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' } },
        [
          { id: 'orders', label: '⚡ Live Orders Queue' },
          { id: 'menu_editor', label: '📖 Menu Editor' },
          { id: 'deals_editor', label: '🏷️ Deals Manager' },
          { id: 'invoices', label: '📜 Invoice History' },
          { id: 'settings', label: '⚙️ Delivery & Capacity' },
          { id: 'discount', label: '🎁 Discount Manager' },
          { id: 'reviews', label: '⭐ Moderation' },
          { id: 'admin_settings', label: '🔧 Admin Settings' }
        ].map(t => React.createElement('button', {
          key: t.id,
          onClick: () => setAdminTab(t.id),
          style: {
            padding: '10px 16px',
            borderRadius: '4px',
            background: adminTab === t.id ? 'var(--primary)' : 'var(--bg-panel)',
            color: '#fff',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontWeight: adminTab === t.id ? 'bold' : 'normal'
          }
        }, t.label))
      ),

      // KPI Summary Cards
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' } },
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Total Sales Revenue'),
          React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' } }, `Rs. ${totalRevenue.toLocaleString()}`)
        ),
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Total Orders Placed'),
          React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, orders.length)
        ),
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Active Kitchen Queue'),
          React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' } }, activeCount)
        ),
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Delivered Completed'),
          React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' } }, orders.filter(o => o.status === 'delivered').length)
        )
      ),

      // TAB 1: LIVE ORDERS QUEUE
      adminTab === 'orders' ? React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' } },
          React.createElement('h3', { style: { color: 'var(--accent)', margin: 0 } }, '⚡ Live Orders Feed'),
          React.createElement('button', {
            className: soundEnabled ? 'btn btn-primary' : 'btn btn-outline',
            onClick: toggleSound,
            style: { cursor: 'pointer', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold' }
          }, soundEnabled ? '🔔 Order Audio Alerts ON' : '🔕 Order Audio Alerts OFF')
        ),
        React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' } },
                React.createElement('th', { style: { padding: '8px' } }, 'ID'),
                React.createElement('th', { style: { padding: '8px' } }, 'Customer'),
                React.createElement('th', { style: { padding: '8px' } }, 'Items'),
                React.createElement('th', { style: { padding: '8px' } }, 'Total'),
                React.createElement('th', { style: { padding: '8px' } }, 'Status Stage'),
                React.createElement('th', { style: { padding: '8px' } }, 'Actions')
              )
            ),
            React.createElement('tbody', null,
              orders.map(o => React.createElement('tr', {
                key: o.id,
                style: {
                  borderBottom: '1px solid var(--border-light)',
                  background: newlyAddedId === o.id ? 'rgba(76, 175, 80, 0.25)' : 'transparent',
                  transition: 'background 0.8s ease'
                }
              },
                React.createElement('td', { style: { padding: '10px', fontWeight: 'bold', color: 'var(--accent)' } }, o.id),
                React.createElement('td', { style: { padding: '10px' } },
                  React.createElement('strong', null, o.customer?.name), React.createElement('br'),
                  React.createElement('span', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, o.customer?.phone)
                ),
                React.createElement('td', { style: { padding: '10px', fontSize: '0.85rem' } }, (o.items||[]).map(i => `${i.quantity}x ${i.name}`).join(", ")),
                React.createElement('td', { style: { padding: '10px', fontWeight: 'bold' } }, `Rs. ${o.total}`),
                React.createElement('td', { style: { padding: '10px' } },
                  React.createElement('select', {
                    value: o.status,
                    onChange: async (e) => { await repo.updateOrderStatus(o.id, e.target.value); loadDashboard(); },
                    style: { padding: '6px', background: 'var(--bg-elevated)', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px' }
                  },
                    ['received', 'queue', 'cooking', 'packing', 'delivery', 'delivered', 'cancelled'].map(s => React.createElement('option', { key: s, value: s }, s))
                  )
                ),
                React.createElement('td', { style: { padding: '10px' } },
                  React.createElement('button', {
                    onClick: () => handlePrintInvoice(o),
                    style: { padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', cursor: 'pointer', borderRadius: '4px' }
                  }, '🖨️ Print Invoice')
                )
              ))
            )
          )
        )
      ) : null,

      // TAB 2: MENU & CATEGORIES EDITOR WITH CUSTOM LOCAL FILE UPLOAD SUPPORT FROM PC
      adminTab === 'menu_editor' ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' } },
        
        // Add / Edit Menu Item Form with PC File Upload Control & Live Preview
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } },
            React.createElement('h3', { style: { color: 'var(--accent)', margin: 0 } }, editingItem ? `✏️ Edit Item (${editingItem.name})` : '➕ Add New Menu Item'),
            editingItem ? React.createElement('button', { onClick: handleCancelEdit, style: { background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' } }, 'Cancel ❌') : null
          ),
          React.createElement('form', { onSubmit: handleSaveMenuItem },
            
            // Image Preview, PC File Upload & Preset Picker Section
            React.createElement('div', { style: { marginBottom: '15px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' } },
              React.createElement('div', { style: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' } },
                React.createElement('img', { src: itemImg || '/assets/hero_food_collage.png', alt: 'Preview', style: { width: '75px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--accent)' } }),
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('label', { style: { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: 'var(--accent)' } }, '📁 Upload Custom Photo from PC:'),
                  React.createElement('input', {
                    type: 'file',
                    accept: 'image/*',
                    onChange: handleFileUpload,
                    style: { width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }
                  })
                )
              ),
              React.createElement('div', { style: { borderTop: '1px dashed var(--border-light)', paddingTop: '8px' } },
                React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' } }, 'Or select existing asset preset / enter URL:'),
                React.createElement('select', { value: itemImg, onChange: e => setItemImg(e.target.value), style: { width: '100%', padding: '6px', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' } },
                  assetOptions.map(opt => React.createElement('option', { key: opt.path, value: opt.path }, opt.label))
                )
              )
            ),

            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Item Name'),
              React.createElement('input', { required: true, value: itemName, onChange: e => setItemName(e.target.value), placeholder: 'e.g. Malai Boti Pizza', style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Category'),
              React.createElement('select', { value: itemCat, onChange: e => setItemCat(e.target.value), style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } },
                [
                  { id: 'pizza', label: 'Pizzas' },
                  { id: 'special_pizza', label: 'Special Pizza' },
                  { id: 'burgers', label: 'Burgers' },
                  { id: 'wraps', label: 'Wraps & Rolls' },
                  { id: 'desi', label: 'Desi & Broast' },
                  { id: 'starters', label: 'Starters' },
                  { id: 'pasta', label: 'Pastas' },
                  { id: 'drinks', label: 'Chill Side & Desserts' }
                ].map(c => React.createElement('option', { key: c.id, value: c.id }, c.label))
              )
            ),

            // Price Fields
            (itemCat === 'pizza' || itemCat === 'special_pizza') ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' } },
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '0.75rem' } }, 'Small Price (Rs.)'),
                React.createElement('input', { type: 'number', value: priceSmall, onChange: e => setPriceSmall(e.target.value), style: { width: '100%', padding: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
              ),
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '0.75rem' } }, 'Regular Price (Rs.)'),
                React.createElement('input', { type: 'number', value: priceRegular, onChange: e => setPriceRegular(e.target.value), style: { width: '100%', padding: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
              ),
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '0.75rem' } }, 'Large Price (Rs.)'),
                React.createElement('input', { type: 'number', value: priceLarge, onChange: e => setPriceLarge(e.target.value), style: { width: '100%', padding: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
              ),
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '0.75rem' } }, 'XL Price (Rs.)'),
                React.createElement('input', { type: 'number', value: priceXlarge, onChange: e => setPriceXlarge(e.target.value), style: { width: '100%', padding: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
              )
            ) : React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Price (Rs.)'),
              React.createElement('input', { type: 'number', required: true, value: itemPrice, onChange: e => setItemPrice(e.target.value), style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),

            React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Description'),
              React.createElement('textarea', { rows: 2, value: itemDesc, onChange: e => setItemDesc(e.target.value), placeholder: 'Ingredients and details...', style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { flex: 1, justifyContent: 'center' } }, editingItem ? 'Save Changes 💾' : 'Add Item ➕'),
              editingItem ? React.createElement('button', { type: 'button', onClick: handleCancelEdit, className: 'btn btn-outline', style: { padding: '0 15px' } }, 'Cancel') : null
            )
          )
        ),

        // Category Filter & Existing Items List with Image Thumbnails
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } },
            React.createElement('h3', { style: { color: 'var(--accent)', margin: 0 } }, 'Menu Catalog'),
            React.createElement('select', { value: selectedCategory, onChange: e => setSelectedCategory(e.target.value), style: { padding: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } },
              ['all', 'pizza', 'special_pizza', 'burgers', 'wraps', 'desi', 'starters', 'pasta', 'drinks'].map(c => React.createElement('option', { key: c, value: c }, c.toUpperCase()))
            )
          ),
          React.createElement('div', { style: { maxHeight: '450px', overflowY: 'auto' } },
            menuItems.filter(i => {
              if (!selectedCategory || selectedCategory === 'all') return true;
              const specialPizzaIds = [
                'pizza_beef_bonanza', 'pizza_arabic', 'pizza_4in1', 'pizza_donner',
                'pizza_lasagna', 'pizza_cheese_steak', 'pizza_crown_crust',
                'pizza_behri_kabab', 'pizza_cheese_stuff', 'pizza_kabab_stuff', 'pizza_habibi_grill'
              ];
              if (selectedCategory === 'special_pizza') {
                return i.category === 'special_pizza' || i.type === 'pizza_special' || specialPizzaIds.includes(String(i.id));
              }
              if (selectedCategory === 'pizza') {
                return (i.category === 'pizza' || i.category === 'pizzas') && i.type !== 'pizza_special' && !specialPizzaIds.includes(String(i.id));
              }
              const cat = String(i.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const sel = String(selectedCategory || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              return cat === sel || cat.includes(sel);
            }).map(item => React.createElement('div', { key: item.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-elevated)', marginBottom: '8px', borderRadius: '4px', border: editingItem?.id === item.id ? '1px solid var(--accent)' : '1px solid var(--border)' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                React.createElement('img', { src: item.image || '/assets/hero_food_collage.png', alt: item.name, style: { width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' } }),
                React.createElement('div', null,
                  React.createElement('strong', { style: { color: 'var(--text-main)' } }, item.name),
                  React.createElement('div', { style: { fontSize: '0.75rem', color: 'var(--accent)' } }, (() => {
                    let pObj = item.prices;
                    if (typeof pObj === 'string') {
                      try { pObj = JSON.parse(pObj); } catch(e) { pObj = {}; }
                    }
                    if (pObj && typeof pObj === 'object' && pObj !== null) {
                      return Object.entries(pObj).map(([k, v]) => `${k}: Rs.${v}`).join(" | ");
                    }
                    return 'Rs. 0';
                  })())
                )
              ),
              React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                React.createElement('button', { onClick: () => handleStartEdit(item), style: { background: 'var(--bg-panel)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' } }, '✏️ Edit'),
                React.createElement('button', { onClick: () => handleDeleteMenuItem(item.id), style: { background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' } }, '🗑️ Delete')
              )
            ))
          )
        )
      ) : null,

      // TAB: DEALS MANAGER
      adminTab === 'deals_editor' ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' } },
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } },
            React.createElement('h3', { style: { color: 'var(--accent)', margin: 0 } }, editingDeal ? `✏️ Edit Deal (${editingDeal.name})` : '➕ Add New Deal'),
            editingDeal ? React.createElement('button', { onClick: handleCancelDealEdit, style: { background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' } }, 'Cancel ❌') : null
          ),
          React.createElement('form', { onSubmit: handleSaveDeal },
            React.createElement('div', { style: { marginBottom: '15px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' } },
              React.createElement('div', { style: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' } },
                React.createElement('img', { src: dealImg || '/assets/hero_food_collage.png', alt: 'Preview', style: { width: '75px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--accent)' } }),
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('label', { style: { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: 'var(--accent)' } }, '📁 Upload Deal Photo:'),
                  React.createElement('input', {
                    type: 'file',
                    accept: 'image/*',
                    onChange: handleDealFileUpload,
                    style: { width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }
                  })
                )
              )
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Deal Title'),
              React.createElement('input', { required: true, value: dealName, onChange: e => setDealName(e.target.value), placeholder: 'e.g. Habibi Special Deal 1', style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Badge Tag'),
              React.createElement('input', { value: dealTag, onChange: e => setDealTag(e.target.value), placeholder: 'e.g. Hot Seller / Mega Feast', style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Price (Rs.)'),
              React.createElement('input', { type: 'number', required: true, value: dealPrice, onChange: e => setDealPrice(e.target.value), style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Deal Contents & Items included'),
              React.createElement('textarea', { rows: 2, required: true, value: dealContents, onChange: e => setDealContents(e.target.value), placeholder: 'e.g. 1 Large Pizza + 6 Wings + 1.5L Drink', style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
            ),
            React.createElement('div', { style: { marginBottom: '15px', background: 'rgba(245, 166, 35, 0.1)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)' } },
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--accent)', fontWeight: 'bold' } },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: dealShowHome,
                  onChange: e => setDealShowHome(e.target.checked),
                  style: { width: '18px', height: '18px', cursor: 'pointer' }
                }),
                '⭐ Show on Home Page (Bestselling Combos Grid)'
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { flex: 1, justifyContent: 'center' } }, editingDeal ? 'Save Deal 💾' : 'Add Deal ➕'),
              editingDeal ? React.createElement('button', { type: 'button', onClick: handleCancelDealEdit, className: 'btn btn-outline', style: { padding: '0 15px' } }, 'Cancel') : null
            )
          )
        ),
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginBottom: '15px' } }, `Deals Catalog (${dealsList.length} Active)`),
          React.createElement('div', { style: { maxHeight: '450px', overflowY: 'auto' } },
            dealsList.map(deal => React.createElement('div', { key: deal.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-elevated)', marginBottom: '8px', borderRadius: '4px', border: editingDeal?.id === deal.id ? '1px solid var(--accent)' : '1px solid var(--border)' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                React.createElement('img', { src: deal.image || '/assets/hero_food_collage.png', alt: deal.name, style: { width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' } }),
                React.createElement('div', null,
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement('strong', { style: { color: 'var(--text-main)' } }, deal.name),
                    (deal.show_on_home || deal.showOnHome) ? React.createElement('span', { style: { fontSize: '0.7rem', background: 'var(--primary)', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' } }, '⭐ HOME') : null
                  ),
                  React.createElement('div', { style: { fontSize: '0.75rem', color: 'var(--accent)' } }, `Rs. ${deal.price} | ${deal.contents}`)
                )
              ),
              React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                React.createElement('button', { onClick: () => handleStartDealEdit(deal), style: { background: 'var(--bg-panel)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' } }, '✏️ Edit'),
                React.createElement('button', { onClick: () => handleDeleteDeal(deal.id), style: { background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' } }, '🗑️ Delete')
              )
            ))
          )
        )
      ) : null,

      // TAB 3: INVOICE HISTORY
      adminTab === 'invoices' ? React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' } },
          React.createElement('h3', { style: { color: 'var(--accent)', margin: 0 } }, '📜 Complete Invoice History'),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement('span', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Filter by Month:'),
            React.createElement('select', {
              value: invoiceMonthFilter,
              onChange: e => setInvoiceMonthFilter(e.target.value),
              style: { padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }
            },
              React.createElement('option', { value: 'all' }, '🗓️ All Months & Years'),
              Array.from(new Set(orders.map(o => {
                const d = new Date(o.createdAt || Date.now());
                if (isNaN(d.getTime())) return null;
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              }).filter(Boolean))).sort().reverse().map(m => {
                const [yr, mo] = m.split('-');
                const monthName = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString('default', { month: 'long' });
                return React.createElement('option', { key: m, value: m }, `${monthName} ${yr}`);
              })
            )
          )
        ),
        React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' } },
                React.createElement('th', { style: { padding: '8px' } }, 'Order ID'),
                React.createElement('th', { style: { padding: '8px' } }, 'Date'),
                React.createElement('th', { style: { padding: '8px' } }, 'Customer'),
                React.createElement('th', { style: { padding: '8px' } }, 'Total Amount'),
                React.createElement('th', { style: { padding: '8px' } }, 'Status'),
                React.createElement('th', { style: { padding: '8px' } }, 'Invoice Action')
              )
            ),
            React.createElement('tbody', null,
              orders.filter(o => {
                if (invoiceMonthFilter === 'all') return true;
                const d = new Date(o.createdAt || Date.now());
                if (isNaN(d.getTime())) return true;
                const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return period === invoiceMonthFilter;
              }).map(o => React.createElement('tr', { key: o.id, style: { borderBottom: '1px solid var(--border-light)' } },
                React.createElement('td', { style: { padding: '10px', fontWeight: 'bold', color: 'var(--accent)' } }, o.id),
                React.createElement('td', { style: { padding: '10px', fontSize: '0.8rem' } }, new Date(o.createdAt || Date.now()).toLocaleDateString()),
                React.createElement('td', { style: { padding: '10px' } }, o.customer?.name),
                React.createElement('td', { style: { padding: '10px', fontWeight: 'bold' } }, `Rs. ${o.total}`),
                React.createElement('td', { style: { padding: '10px' } }, o.status),
                React.createElement('td', { style: { padding: '10px' } },
                  React.createElement('button', { className: 'btn btn-outline', onClick: () => handlePrintInvoice(o), style: { padding: '4px 10px', fontSize: '0.8rem' } }, '🖨️ Receipt')
                )
              ))
            )
          )
        )
      ) : null,

      // TAB 4: DELIVERY & CAPACITY SETTINGS
      adminTab === 'settings' ? React.createElement('div', { style: { maxWidth: '480px', background: 'var(--bg-panel)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' } },
        React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0 } }, 'Delivery & Capacity Settings'),
        React.createElement('form', { onSubmit: async (e) => { e.preventDefault(); await repo.saveDeliverySettings(enabledInput, feeInput, maxInput); alert("Delivery settings saved successfully!"); loadDashboard(); } },
          React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer' } },
            React.createElement('input', { type: 'checkbox', checked: enabledInput, onChange: e => setEnabledInput(e.target.checked) }),
            React.createElement('span', { style: { fontWeight: 'bold' } }, 'Enable Delivery Charges')
          ),
          React.createElement('div', { style: { marginBottom: '14px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Delivery Fee (Rs.)'),
            React.createElement('input', { type: 'number', value: feeInput, onChange: e => setFeeInput(e.target.value), style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
          ),
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '4px' } }, 'Max Kitchen Orders Cap'),
            React.createElement('input', { type: 'number', value: maxInput, onChange: e => setMaxInput(e.target.value), style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } })
          ),
          React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center' } }, 'Save Settings 💾')
        )
      ) : null,

      // TAB 4b: DISCOUNT MANAGER
      adminTab === 'discount' ? React.createElement('div', { style: { maxWidth: '520px', background: 'var(--bg-panel)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border)' } },
        React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' } }, '🎁 Promotional Discount Manager'),

        // TOGGLE SWITCH
        React.createElement('div', {
          onClick: () => setDiscEnabled(!discEnabled),
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', marginBottom: '20px', cursor: 'pointer', borderRadius: '10px',
            background: discEnabled ? 'rgba(22,163,74,0.15)' : 'var(--bg-elevated)',
            border: `2px solid ${discEnabled ? '#16a34a' : 'var(--border)'}`,
            transition: 'all 0.2s ease'
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', { style: { fontSize: '1.4rem' } }, discEnabled ? '🟢' : '⚪'),
            React.createElement('span', { style: { fontWeight: 800, fontSize: '1rem', color: discEnabled ? '#4ade80' : '#fff' } },
              discEnabled ? 'Store Discount is ACTIVE' : 'Store Discount is OFF'
            )
          ),
          React.createElement('div', { style: { width: '52px', height: '28px', borderRadius: '20px', background: discEnabled ? '#16a34a' : '#4b5563', position: 'relative', transition: 'all 0.2s ease' } },
            React.createElement('div', { style: { width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: discEnabled ? '27px' : '3px', transition: 'all 0.2s ease' } })
          )
        ),

        // DISCOUNT TYPE
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, 'Discount Type'),
          React.createElement('select', { value: discType, onChange: e => setDiscType(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } },
            React.createElement('option', { value: 'percentage' }, 'Percentage (%) OFF'),
            React.createElement('option', { value: 'fixed' }, 'Fixed Amount (Rs.) OFF')
          )
        ),

        // DISCOUNT VALUE
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, `Discount Value (${discType === 'percentage' ? '%' : 'Rs.'})`),
          React.createElement('input', { type: 'number', min: '0', value: discValue, onChange: e => setDiscValue(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } })
        ),

        // TARGET SCOPE
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, 'Apply Discount To'),
          React.createElement('select', { value: discTarget, onChange: e => setDiscTarget(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } },
            React.createElement('option', { value: 'all' }, '🌐 All Items (Store-Wide)'),
            React.createElement('option', { value: 'category' }, '📁 Specific Category'),
            React.createElement('option', { value: 'item' }, '🍔 Specific Menu Item')
          )
        ),

        // CATEGORY PICKER
        discTarget === 'category' ? React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, 'Select Category'),
          React.createElement('select', { value: discCategory, onChange: e => setDiscCategory(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } },
            React.createElement('option', { value: '' }, '-- Choose Category --'),
            ['pizza','special_pizza','burgers','wraps','desi','starters','pasta','drinks'].map(c =>
              React.createElement('option', { key: c, value: c }, c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' '))
            )
          )
        ) : null,

        // ITEM PICKER
        discTarget === 'item' ? React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, 'Select Specific Item'),
          React.createElement('select', { value: discItemId, onChange: e => setDiscItemId(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } },
            React.createElement('option', { value: '' }, '-- Choose Item --'),
            menuItems.map(i =>
              React.createElement('option', { key: i.id, value: String(i.id) }, `${i.name} (Rs. ${i.prices ? Object.values(i.prices)[0] : i.price || 0})`)
            )
          )
        ) : null,

        // BANNER LABEL
        React.createElement('div', { style: { marginBottom: '24px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' } }, 'Sale Banner Label (Optional)'),
          React.createElement('input', { type: 'text', placeholder: 'e.g. Weekend Flash Sale', value: discLabel, onChange: e => setDiscLabel(e.target.value), style: { width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' } })
        ),

        // SAVE BUTTON
        React.createElement('button', {
          className: 'btn btn-primary',
          style: { width: '100%', padding: '14px', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' },
          onClick: async () => {
            await repo.saveDiscountSettings({ enabled: discEnabled, type: discType, value: parseFloat(discValue)||0, targetType: discTarget, targetCategory: discCategory, targetItemId: discItemId, label: discLabel });
            alert('✅ Discount settings saved! Menu will update immediately.');
            loadDashboard();
          }
        }, 'Save Discount Settings 🏷️')

      ) : null,

      // TAB 5: REVIEWS MODERATION
      adminTab === 'reviews' ? React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
        React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0 } }, `Pending Customer Reviews (${pendingReviews.length})`),
        pendingReviews.length === 0 ? React.createElement('p', { style: { color: 'var(--text-muted)' } }, 'No pending reviews to moderate.') :
        pendingReviews.map(r => React.createElement('div', { key: r.id, style: { padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '10px' } },
          React.createElement('strong', null, `${r.name} (${'⭐'.repeat(r.rating)})`),
          React.createElement('p', { style: { margin: '6px 0', fontSize: '0.85rem', color: 'var(--text-muted)' } }, `"${r.comment}"`),
          React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
            React.createElement('button', { onClick: async () => { await repo.approveReview(r.id); loadDashboard(); }, style: { padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, 'Approve & Publish ✅'),
            React.createElement('button', { onClick: async () => { await repo.deleteReview(r.id); loadDashboard(); }, style: { padding: '6px 12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, 'Delete 🗑️')
          )
        ))
      ) : null,

      // TAB 6: ADMIN SETTINGS (Credentials + Restaurant Info)
      adminTab === 'admin_settings' ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' } },

        // ─── CHANGE CREDENTIALS PANEL ─────────────────────────────────────
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0, marginBottom: '6px' } }, '🔐 Change Admin Credentials'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px', marginTop: 0 } }, 'Update your admin username and password. You will need your current password to make changes.'),

          settingsMsg.text ? React.createElement('div', {
            style: {
              padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.9rem', fontWeight: 'bold',
              background: settingsMsg.type === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
              border: `1px solid ${settingsMsg.type === 'success' ? '#4caf50' : '#f44336'}`,
              color: settingsMsg.type === 'success' ? '#4caf50' : '#ff6b6b'
            }
          }, settingsMsg.text) : null,

          React.createElement('form', {
            onSubmit: async (e) => {
              e.preventDefault();
              setSettingsMsg({ type: '', text: '' });
              const creds = await repo.getAdminCredentials();
              if (currentPassInput !== creds.password) {
                setSettingsMsg({ type: 'error', text: '❌ Current password is incorrect. Please try again.' });
                return;
              }
              if (!newUsernameInput.trim()) {
                setSettingsMsg({ type: 'error', text: '❌ Username cannot be empty.' });
                return;
              }
              if (newPassInput && newPassInput.length < 6) {
                setSettingsMsg({ type: 'error', text: '❌ New password must be at least 6 characters long.' });
                return;
              }
              if (newPassInput && newPassInput !== confirmPassInput) {
                setSettingsMsg({ type: 'error', text: '❌ New passwords do not match.' });
                return;
              }
              const finalPass = newPassInput || creds.password;
              await repo.changeAdminCredentials(newUsernameInput.trim(), finalPass);
              setCurrentPassInput('');
              setNewPassInput('');
              setConfirmPassInput('');
              setSettingsMsg({ type: 'success', text: '✅ Admin credentials updated successfully!' });
              setTimeout(() => setSettingsMsg({ type: '', text: '' }), 4000);
            }
          },
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: 'var(--text-muted)' } }, 'Current Password *'),
              React.createElement('input', {
                type: 'password', required: true, value: currentPassInput,
                onChange: e => setCurrentPassInput(e.target.value),
                placeholder: 'Enter your current password',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),
            React.createElement('div', { style: { borderTop: '1px dashed var(--border)', paddingTop: '14px', marginBottom: '12px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '5px' } }, 'New Username'),
              React.createElement('input', {
                type: 'text', value: newUsernameInput,
                onChange: e => setNewUsernameInput(e.target.value),
                placeholder: 'e.g. admin or habibi_admin',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '5px' } }, 'New Password (leave blank to keep current)'),
              React.createElement('input', {
                type: 'password', value: newPassInput,
                onChange: e => setNewPassInput(e.target.value),
                placeholder: 'Min. 6 characters',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),
            React.createElement('div', { style: { marginBottom: '20px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '5px' } }, 'Confirm New Password'),
              React.createElement('input', {
                type: 'password', value: confirmPassInput,
                onChange: e => setConfirmPassInput(e.target.value),
                placeholder: 'Re-enter new password',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center' } }, '🔐 Update Credentials')
          ),

          // Danger Zone
          React.createElement('div', { style: { marginTop: '24px', padding: '14px', background: 'rgba(244,67,54,0.07)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '6px' } },
            React.createElement('h4', { style: { color: '#ff6b6b', margin: '0 0 6px 0', fontSize: '0.95rem' } }, '⚠️ Danger Zone'),
            React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 10px 0' } }, 'This will permanently clear ALL order history and invoice records. This action cannot be undone.'),
            React.createElement('button', {
              type: 'button',
              onClick: () => { setDangerModalStep(1); setDangerConfirmText(''); },
              style: { padding: '8px 16px', background: 'rgba(244,67,54,0.2)', border: '1px solid #f44336', color: '#ff6b6b', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }
            }, '🗑️ Clear All Order History')
          ),

          // ─── 2-STEP CUSTOM DANGER CONFIRMATION MODAL ─────────────────────
          dangerModalStep > 0 ? React.createElement('div', {
            style: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
          },
            React.createElement('div', { style: { width: '100%', maxWidth: '440px', background: '#1a1a2e', border: '2px solid #f44336', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 60px rgba(244,67,54,0.4)' } },

              // Modal Header
              React.createElement('div', { style: { background: 'rgba(244,67,54,0.15)', padding: '16px 20px', borderBottom: '1px solid rgba(244,67,54,0.3)', display: 'flex', alignItems: 'center', gap: '10px' } },
                React.createElement('span', { style: { fontSize: '1.4rem' } }, '⚠️'),
                React.createElement('div', null,
                  React.createElement('div', { style: { color: '#ff6b6b', fontWeight: 'bold', fontSize: '1rem' } }, 'Delete All Order History'),
                  React.createElement('div', { style: { color: 'var(--text-muted)', fontSize: '0.75rem' } }, `Step ${dangerModalStep} of 2 — ${dangerModalStep === 1 ? 'Review what will be deleted' : 'Type DELETE to confirm'}`)
                )
              ),

              // STEP 1: Review warning
              dangerModalStep === 1 ? React.createElement('div', { style: { padding: '20px' } },
                React.createElement('p', { style: { color: '#fff', marginTop: 0, marginBottom: '14px' } }, 'You are about to permanently delete:'),
                React.createElement('ul', { style: { color: '#ff6b6b', paddingLeft: '20px', margin: '0 0 18px 0', lineHeight: '2' } },
                  React.createElement('li', null, '🗃️ All order records'),
                  React.createElement('li', null, '📜 Complete invoice history'),
                  React.createElement('li', null, '🔢 Order ID counter (resets to start)')
                ),
                React.createElement('div', { style: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '6px', padding: '10px 12px', marginBottom: '18px' } },
                  React.createElement('span', { style: { color: '#ff6b6b', fontSize: '0.82rem', fontWeight: 'bold' } }, '🔴 This action is PERMANENT and CANNOT be undone. Menu items and settings are NOT affected.')
                ),
                React.createElement('div', { style: { display: 'flex', gap: '10px' } },
                  React.createElement('button', {
                    onClick: () => { setDangerModalStep(0); setDangerConfirmText(''); },
                    style: { flex: 1, padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
                  }, '← Cancel, Keep Data'),
                  React.createElement('button', {
                    onClick: () => { setDangerModalStep(2); setDangerConfirmText(''); },
                    style: { flex: 1, padding: '10px', background: 'rgba(244,67,54,0.3)', border: '1px solid #f44336', color: '#ff6b6b', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
                  }, 'I Understand → Continue')
                )
              ) : null,

              // STEP 2: Type DELETE to confirm
              dangerModalStep === 2 ? React.createElement('div', { style: { padding: '20px' } },
                React.createElement('p', { style: { color: '#fff', marginTop: 0, marginBottom: '6px' } }, 'To confirm deletion, type ', React.createElement('strong', { style: { color: '#f44336', letterSpacing: '2px' } }, 'DELETE'), ' in the box below:'),
                React.createElement('input', {
                  type: 'text',
                  value: dangerConfirmText,
                  onChange: e => setDangerConfirmText(e.target.value),
                  placeholder: 'Type DELETE here...',
                  autoFocus: true,
                  style: { width: '100%', padding: '12px', background: 'rgba(244,67,54,0.08)', border: '2px solid rgba(244,67,54,0.4)', color: dangerConfirmText === 'DELETE' ? '#f44336' : '#fff', borderRadius: '6px', fontSize: '1rem', letterSpacing: '2px', fontWeight: 'bold', boxSizing: 'border-box', outline: 'none', marginBottom: '16px' }
                }),
                React.createElement('div', { style: { display: 'flex', gap: '10px' } },
                  React.createElement('button', {
                    onClick: () => { setDangerModalStep(0); setDangerConfirmText(''); },
                    style: { flex: 1, padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
                  }, '← Go Back'),
                  React.createElement('button', {
                    disabled: dangerConfirmText !== 'DELETE',
                    onClick: async () => {
                      if (dangerConfirmText !== 'DELETE') return;
                      await repo.clearAllOrders();
                      setDangerModalStep(0);
                      setDangerConfirmText('');
                      await loadDashboard(true);
                      setSettingsMsg({ type: 'success', text: '✅ All order history has been permanently cleared from database and storage.' });
                      setTimeout(() => setSettingsMsg({ type: '', text: '' }), 5000);
                    },
                    style: {
                      flex: 1, padding: '10px',
                      background: dangerConfirmText === 'DELETE' ? '#c62828' : 'rgba(244,67,54,0.1)',
                      border: '1px solid #f44336', color: dangerConfirmText === 'DELETE' ? '#fff' : 'rgba(255,107,107,0.4)',
                      borderRadius: '6px', cursor: dangerConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold', transition: 'all 0.2s ease'
                    }
                  }, '🗑️ Yes, Delete Everything')
                )
              ) : null

            )
          ) : null
        ),

        // ─── RESTAURANT BRANDING INFO PANEL ──────────────────────────────
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0, marginBottom: '6px' } }, '🏪 Restaurant Info & Branding'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px', marginTop: 0 } }, 'Update the restaurant name, address, and contact info shown on receipts and the storefront footer.'),

          React.createElement('form', {
            onSubmit: async (e) => {
              e.preventDefault();
              await repo.saveRestaurantInfo({
                name: restName,
                tagline: restTagline,
                address: restAddress,
                phone: restPhone,
                email: restEmail,
                heroImage: restHeroImage,
                heroText: restHeroText
              });
              setSettingsMsg({ type: 'success', text: '✅ Restaurant info & Home Hero settings saved successfully!' });
              setTimeout(() => setSettingsMsg({ type: '', text: '' }), 4000);
            }
          },
            [
              { label: '🏠 Restaurant Name', value: restName, setter: setRestName, placeholder: 'e.g. Habibi Bites' },
              { label: '💬 Tagline / Slogan', value: restTagline, setter: setRestTagline, placeholder: 'e.g. Fast Food & Traditional Kitchen' },
              { label: '📍 Full Address', value: restAddress, setter: setRestAddress, placeholder: 'e.g. Qila Didar Singh, Gujranwala' },
              { label: '📞 Phone Number (Editable)', value: restPhone, setter: setRestPhone, placeholder: 'e.g. 0302-4411700' },
              { label: '📧 Email Address', value: restEmail, setter: setRestEmail, placeholder: 'e.g. info@habibibites.com' }
            ].map(field =>
              React.createElement('div', { key: field.label, style: { marginBottom: '12px' } },
                React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', marginBottom: '5px' } }, field.label),
                React.createElement('input', {
                  type: 'text', value: field.value,
                  onChange: e => field.setter(e.target.value),
                  placeholder: field.placeholder,
                  style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
                })
              )
            ),

            React.createElement('div', { style: { marginBottom: '14px', borderTop: '1px dashed var(--border)', paddingTop: '14px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: 'var(--accent)' } }, '🖼️ Home Page Hero Banner Image (Upload or URL)'),
              React.createElement('input', {
                type: 'file',
                accept: 'image/*',
                onChange: (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setRestHeroImage(reader.result);
                    reader.readAsDataURL(file);
                  }
                },
                style: { width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', marginBottom: '8px' }
              }),
              React.createElement('input', {
                type: 'text',
                value: restHeroImage,
                onChange: e => setRestHeroImage(e.target.value),
                placeholder: 'Or paste image URL (e.g. /assets/hero_food_collage.png)',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),

            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: 'var(--accent)' } }, '📝 Home Page Hero Paragraph Description'),
              React.createElement('textarea', {
                rows: 3,
                value: restHeroText,
                onChange: e => setRestHeroText(e.target.value),
                placeholder: 'e.g. Experience the ultimate flavor fusion. From brick-oven pizzas to crispy golden broast...',
                style: { width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }
              })
            ),

            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center', marginTop: '8px' } }, '💾 Save Restaurant & Home Settings'),

            // Info Preview Card
            React.createElement('div', { style: { marginTop: '18px', padding: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-light)', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.7' } },
              React.createElement('div', { style: { fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' } }, '📄 Receipt Preview:'),
              React.createElement('div', { style: { textAlign: 'center', color: 'var(--text-muted)' } },
                React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1rem', color: '#fff' } }, restName.toUpperCase()),
                React.createElement('div', null, restTagline),
                React.createElement('div', null, restAddress),
                React.createElement('div', null, `Ph: ${restPhone}`)
              )
            )
          )
        )

      ) : null
    );
  }

  function ReviewsView() {
    const [reviews, setReviews] = useState([]);
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { repo.getReviews().then(setReviews); }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!name || !comment) return;
      await repo.addReview(name, rating, comment);
      alert("Review submitted! It will appear on the storefront after Admin approval.");
      setShowModal(false); setName(''); setComment('');
    };

    return React.createElement('main', { className: 'section-container page-top-margin' },
      React.createElement('div', { className: 'section-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' } },
        React.createElement('div', null,
          React.createElement('span', { className: 'section-subtitle' }, 'Customer Reviews'),
          React.createElement('h1', { className: 'section-title' }, 'What Food Lovers Say')
        ),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setShowModal(true) }, 'Write a Review ⭐')
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' } },
        reviews.map(r => React.createElement('div', { key: r.id, style: { background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('strong', null, r.name),
          React.createElement('div', { style: { color: 'var(--accent)', margin: '4px 0' } }, '⭐'.repeat(r.rating)),
          React.createElement('p', { style: { color: 'var(--text-muted)' } }, `"${r.comment}"`)
        ))
      ),

      showModal ? React.createElement('div', { className: 'modal-overlay active', style: { position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        React.createElement('div', { style: { width: '400px', background: 'var(--bg-dark)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' } },
          React.createElement('h3', { style: { color: 'var(--accent)', marginTop: 0 } }, 'Write a Review'),
          React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('input', { required: true, value: name, onChange: e => setName(e.target.value), placeholder: 'Your Name', style: { width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } }),
            React.createElement('select', { value: rating, onChange: e => setRating(e.target.value), style: { width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } },
              [5, 4, 3, 2, 1].map(num => React.createElement('option', { key: num, value: num }, `${'⭐'.repeat(num)} (${num}/5)`))
            ),
            React.createElement('textarea', { required: true, rows: 3, value: comment, onChange: e => setComment(e.target.value), placeholder: 'Your Feedback...', style: { width: '100%', padding: '10px', marginBottom: '15px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' } }),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center' } }, 'Submit Review ➔')
          )
        )
      ) : null
    );
  }

  function ContactView() {
    const [cName, setCName] = React.useState('');
    const [cEmail, setCEmail] = React.useState('');
    const [cMsg, setCMsg] = React.useState('');

    const handleWhatsApp = (e) => {
      e.preventDefault();
      if (!cName.trim() || !cMsg.trim()) return;
      const text = `Hi Habibi Bites! 👋\n\nName: ${cName.trim()}\nEmail: ${cEmail.trim() || 'N/A'}\n\nMessage:\n${cMsg.trim()}`;
      const waUrl = `https://wa.me/923001234567?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    };

    const inpStyle = {
      width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)',
      border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: '8px',
      fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
    };
    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' };
    const cardStyle = { background: 'var(--bg-panel)', padding: '26px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' };

    return React.createElement('main', { className: 'section-container page-top-margin' },

      // Page Header
      React.createElement('div', { className: 'section-header', style: { textAlign: 'center', marginBottom: '36px' } },
        React.createElement('span', { className: 'section-subtitle' }, "We'd Love to Hear From You"),
        React.createElement('h1', { className: 'section-title' }, 'Contact Habibi Bites')
      ),

      // ── ROW 1: 3 Equal Cards ─────────────────────────────────────────────
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px', alignItems: 'stretch' } },

        // CARD 1 — Send Us a Message
        React.createElement('div', { style: cardStyle },
          React.createElement('h2', { style: { color: '#fff', marginTop: 0, marginBottom: '5px', fontSize: '1.1rem' } }, '💬 Send Us a Message'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 0, marginBottom: '18px' } }, 'Fill in the form below and your message will open directly in WhatsApp.'),
          React.createElement('form', { onSubmit: handleWhatsApp, style: { display: 'flex', flexDirection: 'column', flex: 1 } },
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: labelStyle }, 'Full Name'),
              React.createElement('input', { required: true, type: 'text', value: cName, onChange: e => setCName(e.target.value), placeholder: 'e.g. Ahmed Ali', style: inpStyle })
            ),
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('label', { style: labelStyle }, 'Email Address'),
              React.createElement('input', { type: 'email', value: cEmail, onChange: e => setCEmail(e.target.value), placeholder: 'john@example.com (optional)', style: inpStyle })
            ),
            React.createElement('div', { style: { marginBottom: '16px', flex: 1 } },
              React.createElement('label', { style: labelStyle }, 'Message'),
              React.createElement('textarea', { required: true, rows: 4, value: cMsg, onChange: e => setCMsg(e.target.value), placeholder: "Hi Habibi Bites, I'd like to ask about...", style: { ...inpStyle, resize: 'vertical', lineHeight: '1.6' } })
            ),
            React.createElement('button', {
              type: 'submit',
              style: { width: '100%', padding: '12px', background: 'linear-gradient(135deg,#25d366,#128c7e)', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,211,102,0.3)', marginTop: 'auto' }
            },
              React.createElement('svg', { width: '19', height: '19', viewBox: '0 0 24 24', fill: '#fff' },
                React.createElement('path', { d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' })
              ),
              'Send via WhatsApp'
            )
          )
        ),

        // CARD 2 — Get In Touch
        React.createElement('div', { style: cardStyle },
          React.createElement('h2', { style: { color: '#fff', marginTop: 0, marginBottom: '5px', fontSize: '1.1rem' } }, '📞 Get In Touch'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 0, marginBottom: '18px' } }, 'Have questions or need help with your order? Reach us through any channel below.'),
          [
            { icon: '📍', label: 'Address', value: 'Main Boulevard, Qila Didar Singh, Gujranwala, Punjab, Pakistan.' },
            { icon: '📞', label: 'Phone', value: '0300-1234567 / 0321-7654321' },
            { icon: '🕐', label: 'Hours', value: '12:00 PM – 2:00 AM (Daily)' },
            { icon: '📧', label: 'Email', value: 'habibibites@gmail.com' }
          ].map(item =>
            React.createElement('div', { key: item.label, style: { display: 'flex', gap: '11px', marginBottom: '12px', alignItems: 'flex-start', padding: '11px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' } },
              React.createElement('span', { style: { fontSize: '1.15rem', flexShrink: 0, marginTop: '1px' } }, item.icon),
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' } }, item.label),
                React.createElement('div', { style: { color: '#fff', fontSize: '0.87rem', lineHeight: '1.5' } }, item.value)
              )
            )
          )
        ),

        // CARD 3 — Follow Us
        React.createElement('div', { style: cardStyle },
          React.createElement('h2', { style: { color: '#fff', marginTop: 0, marginBottom: '5px', fontSize: '1.1rem' } }, '🌐 Follow Us'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 0, marginBottom: '18px' } }, 'Stay connected for the latest deals, menu drops, and behind-the-scenes content.'),

          // Instagram
          React.createElement('a', {
            href: 'https://www.instagram.com/habibi_bites_qds?igsh=ZDEyNDFqY2JhMmIx', target: '_blank', rel: 'noopener noreferrer',
            style: { display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 15px', borderRadius: '10px', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', textDecoration: 'none', marginBottom: '12px', boxShadow: '0 3px 14px rgba(220,39,67,0.3)' }
          },
            React.createElement('svg', { width: '21', height: '21', viewBox: '0 0 24 24', fill: 'currentColor', style: { flexShrink: 0 } },
              React.createElement('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' })
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: '700', fontSize: '0.9rem' } }, 'Instagram'),
              React.createElement('div', { style: { fontSize: '0.74rem', opacity: 0.85 } }, '@habibi_bites_qds')
            )
          ),

          // Facebook
          React.createElement('a', {
            href: 'https://www.facebook.com/share/195qQ7gAJp/', target: '_blank', rel: 'noopener noreferrer',
            style: { display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 15px', borderRadius: '10px', background: '#1877f2', color: '#fff', textDecoration: 'none', marginBottom: '12px', boxShadow: '0 3px 14px rgba(24,119,242,0.3)' }
          },
            React.createElement('svg', { width: '21', height: '21', viewBox: '0 0 24 24', fill: 'currentColor', style: { flexShrink: 0 } },
              React.createElement('path', { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' })
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: '700', fontSize: '0.9rem' } }, 'Facebook'),
              React.createElement('div', { style: { fontSize: '0.74rem', opacity: 0.85 } }, 'Habibi Bites')
            )
          ),

          // TikTok
          React.createElement('a', {
            href: 'https://www.tiktok.com/@habibi_qila?_r=1&_t=ZS-98gtpRf8j8q', target: '_blank', rel: 'noopener noreferrer',
            style: { display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 15px', borderRadius: '10px', background: '#010101', border: '1px solid rgba(255,255,255,0.13)', color: '#fff', textDecoration: 'none', marginBottom: '0', boxShadow: '0 3px 14px rgba(0,0,0,0.4)' }
          },
            React.createElement('svg', { width: '21', height: '21', viewBox: '0 0 24 24', fill: 'currentColor', style: { flexShrink: 0 } },
              React.createElement('path', { d: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.02-.05z' })
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: '700', fontSize: '0.9rem' } }, 'TikTok'),
              React.createElement('div', { style: { fontSize: '0.74rem', opacity: 0.85 } }, '@habibi_qila')
            )
          )
        )
      ),

      // ── ROW 2: Google Maps Full Width ─────────────────────────────────────
      React.createElement('div', { style: { marginTop: '26px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' } },
        React.createElement('div', { style: { background: 'var(--bg-panel)', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' } },
          React.createElement('span', { style: { fontSize: '1.1rem' } }, '📍'),
                React.createElement('span', { style: { fontWeight: '700', fontSize: '0.98rem' } }, 'Find Us on Google Maps'),
          React.createElement('span', { style: { color: 'var(--text-muted)', fontSize: '0.8rem' } }, '— Qila Didar Singh, Gujranwala'),
          React.createElement('a', {
            href: 'https://maps.google.com/?q=Qila+Didar+Singh+Gujranwala+Pakistan',
            target: '_blank', rel: 'noopener noreferrer',
            style: { marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: '700', padding: '5px 12px', border: '1px solid var(--accent)', borderRadius: '6px' }
          }, 'Open Full Map ↗')
        ),
        React.createElement('iframe', {
          title: 'Habibi Bites Location — Qila Didar Singh, Gujranwala',
          src: 'https://maps.google.com/maps?q=Qila+Didar+Singh,+Gujranwala,+Pakistan&t=&z=14&ie=UTF8&iwloc=&output=embed',
          width: '100%',
          height: '380',
          style: { border: 0, display: 'block' },
          allowFullScreen: true,
          loading: 'lazy',
          referrerPolicy: 'no-referrer-when-downgrade'
        })
      )
    );
  }

  // --- HELPER CARD & MODAL COMPONENTS ---

  function FoodCardComponent({ item, addToCart, onCustomize, discountRule }) {
    let rawPrice = item.prices ? (Object.keys(item.prices).length === 1 ? Object.values(item.prices)[0] : Math.min(...Object.values(item.prices))) : 0;
    let hasMultiple = item.prices && Object.keys(item.prices).length > 1;

    let discountAmount = 0;
    if (discountRule && discountRule.enabled && rawPrice > 0) {
      if (discountRule.targetType === 'all' ||
         (discountRule.targetType === 'category' && discountRule.targetCategory === item.category) ||
         (discountRule.targetType === 'item' && String(discountRule.targetItemId) === String(item.id))) {
        const val = parseFloat(discountRule.value) || 0;
        discountAmount = discountRule.type === 'percentage' ? Math.round(rawPrice * val / 100) : Math.min(rawPrice, val);
      }
    }
    const finalPrice = Math.max(0, rawPrice - discountAmount);

    let priceDisplay = "";
    if (hasMultiple) {
      priceDisplay = `From Rs. ${finalPrice.toLocaleString()}`;
    } else if (discountAmount > 0) {
      priceDisplay = React.createElement('span', null,
        React.createElement('s', { style: { color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '6px' } }, `Rs. ${rawPrice}`),
        React.createElement('span', { style: { color: '#4ade80', fontWeight: 'bold' } }, `Rs. ${finalPrice}`)
      );
    } else {
      priceDisplay = `Rs. ${rawPrice}`;
    }

    return React.createElement('div', { className: 'menu-item-row', id: `item-${item.id}` },
      React.createElement('img', {
        src: item.image || '/assets/hero_food_collage.png',
        className: 'menu-item-img',
        alt: item.name,
        loading: 'lazy',
        decoding: 'async',
        onError: (e) => { e.target.onerror = null; e.target.src = '/assets/hero_food_collage.png'; }
      }),
      React.createElement('div', { className: 'menu-item-info' },
        React.createElement('h3', null, item.name),
        React.createElement('p', { className: 'menu-item-description' }, item.description)
      ),
      React.createElement('div', { className: 'menu-item-cta' },
        React.createElement('div', { className: 'menu-item-main-price', style: { fontWeight: 'bold', color: 'var(--accent)' } }, priceDisplay),
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: () => (hasMultiple || item.category === 'pizza' || item.category === 'special_pizza') ? onCustomize(item) : addToCart({ id: item.id, name: item.name, price: finalPrice })
        }, hasMultiple ? "Choose Options" : "Add to Basket")
      )
    );
  }

  function DealCardComponent({ deal, addToCart, discountRule }) {
    let rawPrice = deal.price || 0;
    let discountAmount = 0;
    if (discountRule && discountRule.enabled && rawPrice > 0 && discountRule.targetType === 'all') {
      const val = parseFloat(discountRule.value) || 0;
      discountAmount = discountRule.type === 'percentage' ? Math.round(rawPrice * val / 100) : Math.min(rawPrice, val);
    }
    const finalPrice = Math.max(0, rawPrice - discountAmount);

    return React.createElement('div', { className: 'deal-card', id: `deal-${deal.id}` },
      deal.tag ? React.createElement('div', { className: 'deal-card-badge' }, deal.tag) : null,
      React.createElement('div', { className: 'deal-card-image-box' },
        React.createElement('img', {
          src: deal.image || '/assets/hero_food_collage.png',
          alt: deal.name,
          loading: 'lazy',
          decoding: 'async',
          onError: (e) => { e.target.onerror = null; e.target.src = '/assets/hero_food_collage.png'; }
        }),
        React.createElement('div', { className: 'deal-flyer-glow-ribbon' })
      ),
      React.createElement('div', { className: 'deal-card-body' },
        React.createElement('h3', { className: 'deal-card-title' }, deal.name),
        React.createElement('p', { className: 'deal-card-contents' }, deal.description || deal.contents || ''),
        React.createElement('div', { className: 'deal-card-footer' },
          discountAmount > 0 ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('s', { style: { color: 'var(--text-muted)', fontSize: '0.85rem' } }, `Rs. ${rawPrice}`),
            React.createElement('span', { style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#4ade80' } }, `Rs. ${finalPrice.toLocaleString()}`)
          ) : React.createElement('div', { style: { fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' } }, `Rs. ${rawPrice.toLocaleString()}`),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: () => addToCart({ id: `deal_${deal.id}`, name: deal.name, price: finalPrice })
          }, 'Add to Basket +')
        )
      )
    );
  }

  function CartDrawerModal({ cart, cartSubtotal, updateQuantity, removeFromCart, onClose, setActivePage }) {
    return React.createElement('div', { className: 'cart-drawer-overlay active', style: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' } },
      React.createElement('div', { className: 'cart-drawer active', style: { width: '100%', maxWidth: '420px', background: 'var(--bg-dark)', height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)', right: 0 } },
        React.createElement('div', { style: { padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('h3', { style: { margin: 0 } }, `Your Basket (${cart.length})`),
          React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' } }, '×')
        ),
        React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '20px' } },
          cart.length === 0 ? React.createElement('div', { style: { textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' } },
            React.createElement('div', { style: { fontSize: '3rem' } }, '🛒'),
            React.createElement('p', null, 'Your basket is empty.'),
            React.createElement('button', { className: 'btn btn-primary', onClick: () => { onClose(); setActivePage('menu'); } }, 'Browse Menu')
          ) : cart.map((item, idx) => React.createElement('div', { key: idx, style: { padding: '12px', background: 'var(--bg-panel)', marginBottom: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' } },
            React.createElement('strong', null, item.name),
            React.createElement('div', { style: { color: 'var(--primary)', fontWeight: 'bold' } }, `Rs. ${item.price}`),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' } },
              React.createElement('div', null,
                React.createElement('button', { onClick: () => updateQuantity(idx, item.quantity - 1), style: { padding: '2px 8px' } }, '-'),
                React.createElement('span', { style: { padding: '0 8px' } }, item.quantity),
                React.createElement('button', { onClick: () => updateQuantity(idx, item.quantity + 1), style: { padding: '2px 8px' } }, '+')
              ),
              React.createElement('button', { onClick: () => removeFromCart(idx), style: { background: 'none', border: 'none', cursor: 'pointer' } }, '🗑️')
            )
          ))
        ),
        cart.length > 0 ? React.createElement('div', { style: { padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' } },
            React.createElement('span', null, 'Subtotal:'),
            React.createElement('span', { style: { color: 'var(--accent)' } }, `Rs. ${cartSubtotal.toLocaleString()}`)
          ),
          React.createElement('button', { className: 'btn btn-primary', style: { width: '100%', padding: '14px', justifyContent: 'center' }, onClick: () => { onClose(); setActivePage('checkout'); } }, 'Proceed to Checkout ➔')
        ) : null
      )
    );
  }

  function CustomizationModalView({ item, onClose, addToCart }) {
    const availableSizes = item?.prices ? Object.keys(item.prices) : ['default'];
    const [size, setSize] = useState(availableSizes[0] || 'small');
    const [crust, setCrust] = useState({ id: 'normal', name: 'Standard Crust', price: 0 });
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [qty, setQty] = useState(1);

    const crusts = [
      { id: 'normal', name: 'Standard Pan Crust', price: 0 },
      { id: 'cheese_crust', name: 'Cheese Stuffed Crust', price: 250 },
      { id: 'kabab_crust', name: 'Kabab Stuffed Crust', price: 350 }
    ];

    const availableAddons = window.HABIBI_MENU?.addons || [
      { id: "garlic_mayo", name: "Garlic Mayo Dip Sauce", price: 80 },
      { id: "habibi_special_sauce", name: "Habibi Special Spicy Sauce", price: 100 },
      { id: "extra_cheese", name: "Extra Cheese Slice", price: 60 },
      { id: "extra_patty", name: "Extra Chicken Patty", price: 150 },
      { id: "mushrooms_olives", name: "Extra Mushrooms & Olives", price: 120 }
    ];

    const basePrice = item.prices ? (item.prices[size] || Object.values(item.prices)[0] || 0) : 0;
    const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    const unitPrice = basePrice + crust.price + addonsTotal;
    const grandTotal = unitPrice * qty;

    const toggleAddon = (addon) => {
      setSelectedAddons(prev => {
        const exists = prev.some(a => a.id === addon.id);
        if (exists) return prev.filter(a => a.id !== addon.id);
        return [...prev, addon];
      });
    };

    return React.createElement('div', { className: 'modal-overlay active', style: { position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' } },
      React.createElement('div', { className: 'custom-modal', style: { width: '100%', maxWidth: '520px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' } },
        React.createElement('div', { style: { padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)' } },
          React.createElement('h3', { style: { margin: 0 } }, `Customize ${item.name}`),
          React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' } }, '×')
        ),
        React.createElement('div', { style: { padding: '20px', maxHeight: '65vh', overflowY: 'auto' } },
          availableSizes.length > 1 ? React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' } }, '1. Select Pizza Size:'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' } },
              availableSizes.map(s => React.createElement('button', {
                key: s,
                type: 'button',
                onClick: () => setSize(s),
                style: { padding: '10px', borderRadius: '4px', border: size === s ? '2px solid var(--primary)' : '1px solid var(--border)', background: size === s ? 'var(--primary-glow)' : 'var(--bg-panel)', color: '#fff', cursor: 'pointer', textTransform: 'uppercase' }
              }, `${s}`, React.createElement('br'), React.createElement('span', { style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, `Rs. ${item.prices[s]}`)))
            )
          ) : null,
          (item.category === 'pizza' || item.category === 'special_pizza') ? React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' } }, '2. Select Stuffed Crust Option:'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
              crusts.map(c => React.createElement('label', {
                key: c.id,
                style: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '4px', background: crust.id === c.id ? 'var(--primary-glow)' : 'var(--bg-panel)', border: crust.id === c.id ? '1px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }
              },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                  React.createElement('input', { type: 'radio', name: 'crust', checked: crust.id === c.id, onChange: () => setCrust(c) }),
                  React.createElement('span', null, c.name)
                ),
                React.createElement('span', { style: { color: 'var(--accent)', fontWeight: 'bold' } }, c.price > 0 ? `+ Rs. ${c.price}` : 'Free')
              ))
            )
          ) : null,
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' } }, '3. Extra Sauces & Dip Addons:'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
              availableAddons.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return React.createElement('label', {
                  key: addon.id,
                  style: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '4px', background: isSelected ? 'var(--primary-glow)' : 'var(--bg-panel)', border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }
                },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement('input', { type: 'checkbox', checked: isSelected, onChange: () => toggleAddon(addon) }),
                    React.createElement('span', null, addon.name)
                  ),
                  React.createElement('span', { style: { color: 'var(--accent)', fontWeight: 'bold' } }, `+ Rs. ${addon.price}`)
                );
              })
            )
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' } },
            React.createElement('span', { style: { fontWeight: 'bold' } }, 'Quantity:'),
            React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px' } },
              React.createElement('button', { onClick: () => setQty(Math.max(1, qty - 1)), style: { padding: '6px 14px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' } }, '-'),
              React.createElement('span', { style: { padding: '0 12px', fontWeight: 'bold' } }, qty),
              React.createElement('button', { onClick: () => setQty(qty + 1), style: { padding: '6px 14px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' } }, '+')
            )
          )
        ),
        React.createElement('div', { style: { padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-panel)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '0.75rem', color: 'var(--text-muted)' } }, 'Net Item Total'),
            React.createElement('div', { style: { fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' } }, `Rs. ${grandTotal.toLocaleString()}`)
          ),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: () => {
              addToCart({
                id: item.id,
                name: item.name,
                price: unitPrice,
                quantity: qty,
                options: { size, crust: crust.id !== 'normal' ? crust : null, addons: selectedAddons }
              });
              onClose();
            }
          }, 'Add to Basket')
        )
      )
    );
  }

  function FooterView({ setActivePage }) {
    return React.createElement('footer', { id: 'global-footer' },
      React.createElement('div', { className: 'footer-grid' },
        React.createElement('div', { className: 'footer-col brand-col' },
          React.createElement('h3', { className: 'footer-logo' }, React.createElement('span', { style: { color: 'var(--primary)' } }, 'Fiery '), 'Habibi Bites'),
          React.createElement('p', { className: 'footer-desc' }, 'Serving premium fast food, authentic Pakistani handi and karahis, gourmet pizzas, crispy broasts, and cooling shakes in Gujranwala.')
        ),
        React.createElement('div', { className: 'footer-col' },
          React.createElement('h4', null, 'Working Hours'),
          React.createElement('ul', { className: 'footer-hours' },
            React.createElement('li', null, React.createElement('span', null, 'Mon - Fri: '), React.createElement('span', null, '12:00 PM - 02:00 AM')),
            React.createElement('li', null, React.createElement('span', null, 'Sat - Sun: '), React.createElement('span', null, '12:00 PM - 03:00 AM'))
          )
        ),
        React.createElement('div', { className: 'footer-col' },
          React.createElement('h4', null, 'Kitchen'),
          React.createElement('ul', { className: 'footer-links' },
            React.createElement('li', null, React.createElement('button', { onClick: () => setActivePage('menu'), style: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' } }, 'Gourmet Pizzas')),
            React.createElement('li', null, React.createElement('button', { onClick: () => setActivePage('deals'), style: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' } }, 'Super Saver Deals'))
          )
        ),
        React.createElement('div', { className: 'footer-col' },
          React.createElement('h4', null, 'Find Us'),
          React.createElement('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' } }, 'Main Boulevard, Qila Didar Singh, Gujranwala, Punjab, Pakistan.'),
          React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
            React.createElement('a', { href: 'https://www.facebook.com/share/195qQ7gAJp/', target: '_blank', rel: 'noopener noreferrer', title: 'Facebook', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#1877f2', color: '#fff', textDecoration: 'none' } },
              React.createElement('svg', { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' }))
            ),
            React.createElement('a', { href: 'https://www.instagram.com/habibi_bites_qds?igsh=ZDEyNDFqY2JhMmIx', target: '_blank', rel: 'noopener noreferrer', title: 'Instagram', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', textDecoration: 'none' } },
              React.createElement('svg', { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' }))
            ),
            React.createElement('a', { href: 'https://www.tiktok.com/@habibi_qila?_r=1&_t=ZS-98gtpRf8j8q', target: '_blank', rel: 'noopener noreferrer', title: 'TikTok', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#000', border: '1px solid var(--border-light)', color: '#fff', textDecoration: 'none' } },
              React.createElement('svg', { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.02-.05z' }))
            )
          )
        )
      ),
      React.createElement('div', { className: 'footer-bottom', style: { textAlign: 'center', padding: '15px 0', borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' } },
        React.createElement('span', null,
          '© Habibi Bites. All Rights Reserved. Developed by ',
          React.createElement('a', {
            href: 'https://muhammadhussnainakram.vercel.app/',
            target: '_blank',
            rel: 'noopener noreferrer',
            style: { color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', transition: 'var(--transition)' },
            onMouseEnter: e => e.target.style.textDecoration = 'underline',
            onMouseLeave: e => e.target.style.textDecoration = 'none'
          }, '@Nexbyte-Studio')
        )
      )
    );
  }

  // Render to DOM
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(React.createElement(HabibiBitesFullApp));
  }
})();

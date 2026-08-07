import { IRepository } from '../../core/interfaces/IRepository';
import { OrderFactory } from '../../core/factories/OrderFactory';
import { DeliveryFeeStrategy } from '../../core/strategies/PricingStrategy';

const DB_KEYS = {
  ORDERS: "habibi_bites_orders",
  REVIEWS: "habibi_bites_reviews",
  ADMIN: "habibi_bites_admin_session",
  LAST_ORDER_ID: "habibi_bites_last_id",
  MENU_ITEMS: "habibi_bites_menu_items",
  DEALS: "habibi_bites_deals",
  SETTINGS: "habibi_bites_delivery_settings"
};

const DEFAULT_REVIEWS = [
  { id: 1, name: "Hamza Malik", rating: 5, comment: "Best Zinger burger in Gujranwala! The crunch is absolutely out of this world.", date: "2026-08-04", approved: true },
  { id: 2, name: "Ayesha Bibi", rating: 4, comment: "Tikka Pizza was loaded with toppings and steaming hot when delivered. Very impressed!", date: "2026-08-04", approved: true },
  { id: 3, name: "Zainab Chaudhry", rating: 5, comment: "The Creamy Habibi Special Pasta has the best cheese pull in the city. A must try!", date: "2026-08-03", approved: true },
  { id: 4, name: "Usman Ghani", rating: 5, comment: "Special Deal 7 is super value. The large pizza, burgers and fries easily fed my family.", date: "2026-08-02", approved: true }
];

function readStore(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function writeStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event("storage_changed"));
  } catch (e) {
    console.error("Storage Write Error", e);
  }
}

export class LocalStorageRepository extends IRepository {
  constructor() {
    super();
    this.initDefaults();
  }

  initDefaults() {
    if (!readStore(DB_KEYS.REVIEWS)) writeStore(DB_KEYS.REVIEWS, DEFAULT_REVIEWS);
    if (!readStore(DB_KEYS.LAST_ORDER_ID)) writeStore(DB_KEYS.LAST_ORDER_ID, 5103);
    if (!readStore(DB_KEYS.SETTINGS)) writeStore(DB_KEYS.SETTINGS, { enabled: false, fee: 150, maxOrders: 50 });
    
    if (!readStore(DB_KEYS.MENU_ITEMS) && window.HABIBI_MENU) {
      writeStore(DB_KEYS.MENU_ITEMS, window.HABIBI_MENU.items || []);
    }
    if (!readStore(DB_KEYS.DEALS) && window.HABIBI_DEALS) {
      writeStore(DB_KEYS.DEALS, window.HABIBI_DEALS || []);
    }
  }

  // Menu Items
  async getMenuItems() {
    return readStore(DB_KEYS.MENU_ITEMS) || (window.HABIBI_MENU ? window.HABIBI_MENU.items : []);
  }
  async getMenuItemById(id) {
    const items = await this.getMenuItems();
    return items.find(i => i.id === id) || null;
  }
  async addMenuItem(item) {
    const items = await this.getMenuItems();
    items.push(item);
    writeStore(DB_KEYS.MENU_ITEMS, items);
    return item;
  }
  async updateMenuItem(item) {
    const items = await this.getMenuItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      items[idx] = item;
      writeStore(DB_KEYS.MENU_ITEMS, items);
    }
    return true;
  }
  async deleteMenuItem(id) {
    const items = (await this.getMenuItems()).filter(i => i.id !== id);
    writeStore(DB_KEYS.MENU_ITEMS, items);
    return true;
  }

  // Deals
  async getDeals() {
    return readStore(DB_KEYS.DEALS) || (window.HABIBI_DEALS ? window.HABIBI_DEALS : []);
  }
  async addDeal(deal) {
    const deals = await this.getDeals();
    deals.push(deal);
    writeStore(DB_KEYS.DEALS, deals);
    return deal;
  }
  async updateDeal(deal) {
    const deals = await this.getDeals();
    const idx = deals.findIndex(d => String(d.id) === String(deal.id));
    if (idx !== -1) {
      deals[idx] = deal;
      writeStore(DB_KEYS.DEALS, deals);
    }
    return true;
  }
  async deleteDeal(id) {
    const deals = (await this.getDeals()).filter(d => String(d.id) !== String(id));
    writeStore(DB_KEYS.DEALS, deals);
    return true;
  }

  // Orders
  async getOrders() {
    return readStore(DB_KEYS.ORDERS) || [];
  }
  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find(o => o.id.toUpperCase() === id.toUpperCase().trim()) || null;
  }
  async getOrdersByPhone(phone) {
    const clean = phone.replace(/[^0-9]/g, "");
    const orders = await this.getOrders();
    return orders.filter(o => o.customer?.phone?.replace(/[^0-9]/g, "") === clean);
  }
  async createOrder(customerDetails, items, total, deliveryFee = 0) {
    const settings = await this.getDeliverySettings();
    const orders = await this.getOrders();
    const activeStatuses = ["received", "queue", "cooking", "packing", "delivery"];
    const activeCount = orders.filter(o => activeStatuses.includes(o.status)).length;
    
    if (activeCount >= settings.maxOrders) {
      throw new Error("We're at full capacity right now, please try again shortly.");
    }

    let lastId = parseInt(readStore(DB_KEYS.LAST_ORDER_ID)) || 5103;
    lastId += 1;
    writeStore(DB_KEYS.LAST_ORDER_ID, lastId);

    const actualFee = DeliveryFeeStrategy.calculateFee(settings);
    const newOrder = OrderFactory.createOrder({
      nextNumber: lastId,
      customer: customerDetails,
      items,
      total,
      deliveryFee: actualFee
    });

    orders.unshift(newOrder);
    writeStore(DB_KEYS.ORDERS, orders);
    return newOrder;
  }
  async updateOrderStatus(orderId, newStatus) {
    const orders = await this.getOrders();
    const idx = orders.findIndex(o => o.id.toUpperCase() === orderId.toUpperCase().trim());
    if (idx === -1) return null;

    orders[idx] = OrderFactory.addStatusUpdate(orders[idx], newStatus);
    writeStore(DB_KEYS.ORDERS, orders);
    return orders[idx];
  }

  // Reviews
  async getReviews() {
    const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
    return all.filter(r => r.approved === true);
  }
  async getPendingReviews() {
    const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
    return all.filter(r => r.approved === false || r.approved === undefined);
  }
  async addReview(name, rating, comment) {
    const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
    const newReview = {
      id: Date.now(),
      name,
      rating: parseInt(rating) || 5,
      comment,
      date: new Date().toISOString().split("T")[0],
      approved: false
    };
    all.unshift(newReview);
    writeStore(DB_KEYS.REVIEWS, all);
    return newReview;
  }
  async approveReview(id) {
    const all = readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS;
    const idx = all.findIndex(r => String(r.id) === String(id));
    if (idx !== -1) {
      all[idx].approved = true;
      writeStore(DB_KEYS.REVIEWS, all);
    }
    return true;
  }
  async deleteReview(id) {
    const all = (readStore(DB_KEYS.REVIEWS) || DEFAULT_REVIEWS).filter(r => String(r.id) !== String(id));
    writeStore(DB_KEYS.REVIEWS, all);
    return true;
  }

  // Settings
  async getDeliverySettings() {
    const raw = readStore(DB_KEYS.SETTINGS) || {};
    return {
      enabled: raw.enabled ?? false,
      fee: raw.fee ?? 150,
      maxOrders: raw.maxOrders ?? 50
    };
  }
  async saveDeliverySettings(enabled, fee, maxOrders) {
    const data = { enabled: !!enabled, fee: parseFloat(fee) || 0, maxOrders: parseInt(maxOrders) || 50 };
    writeStore(DB_KEYS.SETTINGS, data);
    return data;
  }

  // Auth
  async loginAdmin(username, password) {
    if (username === "admin" && password === "habibibites123") {
      writeStore(DB_KEYS.ADMIN, { username, loginTime: Date.now() });
      return true;
    }
    return false;
  }
  async logoutAdmin() {
    localStorage.removeItem(DB_KEYS.ADMIN);
    window.dispatchEvent(new Event("storage_changed"));
  }
  async isAdminLoggedIn() {
    const session = readStore(DB_KEYS.ADMIN);
    return !!session;
  }
}

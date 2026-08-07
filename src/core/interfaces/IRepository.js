/**
 * Interface / Contract for Repository Data Access (DIP & ISP Principles)
 * Abstract contracts for data operations. Concrete classes (SupabaseRepository, LocalStorageRepository)
 * implement these methods.
 */
export class IRepository {
  // Menu Items
  async getMenuItems() { throw new Error("Method getMenuItems() not implemented."); }
  async getMenuItemById(id) { throw new Error("Method getMenuItemById() not implemented."); }
  async addMenuItem(item) { throw new Error("Method addMenuItem() not implemented."); }
  async updateMenuItem(item) { throw new Error("Method updateMenuItem() not implemented."); }
  async deleteMenuItem(id) { throw new Error("Method deleteMenuItem() not implemented."); }

  // Deals
  async getDeals() { throw new Error("Method getDeals() not implemented."); }
  async addDeal(deal) { throw new Error("Method addDeal() not implemented."); }
  async updateDeal(deal) { throw new Error("Method updateDeal() not implemented."); }
  async deleteDeal(id) { throw new Error("Method deleteDeal() not implemented."); }

  // Orders
  async getOrders() { throw new Error("Method getOrders() not implemented."); }
  async getOrderById(id) { throw new Error("Method getOrderById() not implemented."); }
  async getOrdersByPhone(phone) { throw new Error("Method getOrdersByPhone() not implemented."); }
  async createOrder(customerDetails, items, total, deliveryFee) { throw new Error("Method createOrder() not implemented."); }
  async updateOrderStatus(orderId, newStatus) { throw new Error("Method updateOrderStatus() not implemented."); }

  // Reviews
  async getReviews() { throw new Error("Method getReviews() not implemented."); }
  async getPendingReviews() { throw new Error("Method getPendingReviews() not implemented."); }
  async addReview(name, rating, comment) { throw new Error("Method addReview() not implemented."); }
  async approveReview(id) { throw new Error("Method approveReview() not implemented."); }
  async deleteReview(id) { throw new Error("Method deleteReview() not implemented."); }

  // Settings
  async getDeliverySettings() { throw new Error("Method getDeliverySettings() not implemented."); }
  async saveDeliverySettings(enabled, fee, maxOrders) { throw new Error("Method saveDeliverySettings() not implemented."); }
  async getDiscountSettings() { throw new Error("Method getDiscountSettings() not implemented."); }
  async saveDiscountSettings(discountData) { throw new Error("Method saveDiscountSettings() not implemented."); }

  // Auth
  async loginAdmin(username, password) { throw new Error("Method loginAdmin() not implemented."); }
  async logoutAdmin() { throw new Error("Method logoutAdmin() not implemented."); }
  async isAdminLoggedIn() { throw new Error("Method isAdminLoggedIn() not implemented."); }
}

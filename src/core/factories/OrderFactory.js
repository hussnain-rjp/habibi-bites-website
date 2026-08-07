/**
 * Factory Pattern: OrderFactory
 * Single Responsibility: Encapsulates creation of Order domain objects.
 */
export class OrderFactory {
  static createOrder({ nextNumber, customer, items, total, deliveryFee = 0 }) {
    const timestamp = new Date().toISOString();
    const orderId = `HB-${nextNumber}`;
    
    return {
      id: orderId,
      customer: {
        name: customer.name || "Valued Customer",
        phone: customer.phone || "",
        address: customer.address || ""
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options || null,
        contents: item.contents || null
      })),
      total: parseFloat(total) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      status: "received",
      payment: "Cash on Delivery",
      createdAt: timestamp,
      updates: [
        { stage: "received", time: timestamp }
      ]
    };
  }

  static addStatusUpdate(existingOrder, newStatus) {
    const timestamp = new Date().toISOString();
    const updates = Array.isArray(existingOrder.updates) ? [...existingOrder.updates] : [];
    
    if (!updates.some(u => u.stage === newStatus)) {
      updates.push({ stage: newStatus, time: timestamp });
    }

    return {
      ...existingOrder,
      status: newStatus,
      updates
    };
  }
}

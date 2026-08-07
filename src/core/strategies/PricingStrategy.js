/**
 * Strategy Pattern: Pricing Strategy Interfaces & Concrete Calculations (OCP Principle)
 * Encapsulates dynamic pricing algorithms for pizzas, addons, and delivery fees.
 */

// Delivery Fee Calculation Strategy
export class DeliveryFeeStrategy {
  static calculateFee(settings) {
    if (!settings) return 0;
    return settings.enabled ? (parseFloat(settings.fee) || 0) : 0;
  }
}

// Item Customization Pricing Strategy
export class CustomizationPricingStrategy {
  static calculateItemTotal(basePrice, selectedSize, selectedCrust, selectedAddons = []) {
    let price = parseFloat(basePrice) || 0;
    
    // Add crust surcharge if applicable
    if (selectedCrust && selectedCrust.price) {
      price += parseFloat(selectedCrust.price) || 0;
    }
    
    // Add addon surcharges
    if (Array.isArray(selectedAddons)) {
      selectedAddons.forEach(addon => {
        price += parseFloat(addon.price) || 0;
      });
    }

    return price;
  }
}

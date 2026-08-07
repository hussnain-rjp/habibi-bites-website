/**
 * Strategy Pattern: Discount Pricing Strategy
 * Evaluates promotional discount rules against menu items.
 */

export class DiscountPricingStrategy {
  /**
   * Calculates discounted price and badge for a given item.
   *
   * @param {object} item - Menu item object { id, name, category, price }
   * @param {object} discountRule - Discount configuration object
   * @returns {{ originalPrice: number, finalPrice: number, discountAmount: number, badgeLabel: string, isDiscounted: boolean }}
   */
  static calculateDiscount(item, discountRule) {
    const originalPrice = parseFloat(item?.price) || 0;

    if (!discountRule || !discountRule.enabled || originalPrice <= 0) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discountAmount: 0,
        badgeLabel: '',
        isDiscounted: false,
      };
    }

    const { type, value, targetType, targetCategory, targetItemId, label } = discountRule;
    const numericValue = parseFloat(value) || 0;

    if (numericValue <= 0) {
      return { originalPrice, finalPrice: originalPrice, discountAmount: 0, badgeLabel: '', isDiscounted: false };
    }

    // Check if this item matches the discount target scope
    let matches = false;
    if (targetType === 'all') {
      matches = true;
    } else if (targetType === 'category') {
      const itemCat = (item.category || '').toLowerCase().trim();
      const targetCat = (targetCategory || '').toLowerCase().trim();
      matches = itemCat === targetCat;
    } else if (targetType === 'item') {
      matches = String(item.id) === String(targetItemId);
    }

    if (!matches) {
      return { originalPrice, finalPrice: originalPrice, discountAmount: 0, badgeLabel: '', isDiscounted: false };
    }

    // Calculate discount deduction
    let discountAmount = 0;
    let badgeLabel = '';

    if (type === 'percentage') {
      const pct = Math.min(Math.max(numericValue, 0), 100);
      discountAmount = (originalPrice * pct) / 100;
      badgeLabel = `${pct}% OFF`;
    } else if (type === 'fixed') {
      discountAmount = Math.min(numericValue, originalPrice);
      badgeLabel = `Rs. ${numericValue} OFF`;
    }

    const finalPrice = Math.max(0, Math.round(originalPrice - discountAmount));

    return {
      originalPrice,
      finalPrice,
      discountAmount: Math.round(discountAmount),
      badgeLabel: label ? `${label} (${badgeLabel})` : badgeLabel,
      isDiscounted: discountAmount > 0,
    };
  }
}

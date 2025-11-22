import { IProduct, SaleMode, BulkPrice } from '../types';

class PricingService {
  /**
   * Calculate price for a product based on quantity and sale mode
   * For catalog (wholesale), use bulk pricing tiers
   * For POS detail (retail), use retail price
   * For POS gros (wholesale), use bulk pricing tiers
   */
  calculatePrice(
    product: IProduct,
    quantity: number,
    saleMode?: SaleMode
  ): number {
    // POS detail mode - always use retail price
    if (saleMode === SaleMode.DETAIL) {
      return product.price.retail;
    }

    // Catalog or POS gros mode - use bulk pricing if available
    if (product.bulkPrices && product.bulkPrices.length > 0) {
      const bulkPrice = this.getBulkPrice(product.bulkPrices, quantity);
      if (bulkPrice) {
        return bulkPrice;
      }
    }

    // Fallback to retail price
    return product.price.retail;
  }

  /**
   * Get applicable bulk price for given quantity
   * Returns the best (lowest) price tier that the quantity qualifies for
   */
  getBulkPrice(bulkPrices: BulkPrice[], quantity: number): number | null {
    if (!bulkPrices || bulkPrices.length === 0) {
      return null;
    }

    // Bulk prices should be sorted by minQty (ascending)
    // Find the highest tier that the quantity qualifies for
    let applicablePrice: number | null = null;

    for (const tier of bulkPrices) {
      if (quantity >= tier.minQty) {
        applicablePrice = tier.price;
      } else {
        // Since sorted, we can break early
        break;
      }
    }

    return applicablePrice;
  }

  /**
   * Calculate total cost for order line including component extra prices
   */
  calculateLineTotal(
    basePrice: number,
    quantity: number,
    componentExtraPrices: number[] = []
  ): number {
    const extraPrice = componentExtraPrices.reduce((sum, price) => sum + price, 0);
    const unitPrice = basePrice + extraPrice;
    return unitPrice * quantity;
  }

  /**
   * Calculate order totals
   */
  calculateOrderTotals(
    subtotal: number,
    remise: number = 0,
    taxRate: number = 0
  ): {
    subtotal: number;
    remise: number;
    tax: number;
    total: number;
  } {
    const afterRemise = Math.max(0, subtotal - remise);
    const tax = afterRemise * taxRate;
    const total = afterRemise + tax;

    return {
      subtotal,
      remise,
      tax,
      total,
    };
  }

  /**
   * Calculate profit margin
   */
  calculateMargin(total: number, costTotal: number): {
    netIncome: number;
    marginPercent: number;
  } {
    const netIncome = total - costTotal;
    const marginPercent = costTotal > 0 ? (netIncome / costTotal) * 100 : 0;

    return {
      netIncome,
      marginPercent,
    };
  }

  /**
   * Validate pricing constraints
   */
  validatePricing(price: number, cost: number): { valid: boolean; error?: string } {
    if (price < 0) {
      return { valid: false, error: 'Price cannot be negative' };
    }

    if (cost < 0) {
      return { valid: false, error: 'Cost cannot be negative' };
    }

    if (price < cost) {
      return { valid: false, error: 'Price cannot be lower than cost (negative margin)' };
    }

    return { valid: true };
  }

  /**
   * Format price for display (with currency)
   */
  formatPrice(price: number, currency: string = 'TND', locale: string = 'ar-TN'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(price);
  }
}

export default new PricingService();

import { type ClassValue, clsx } from 'clsx';
import { LocalizedString } from '@/types';

/**
 * Merge class names using clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format currency in Arabic
 */
export function formatCurrency(amount: number, currency: string = 'TND'): string {
  return new Intl.NumberFormat('ar-TN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number in Arabic
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-TN').format(num);
}

/**
 * Format date in Arabic
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return new Intl.DateTimeFormat('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  return new Intl.DateTimeFormat('ar-TN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Get localized string value (default to Arabic)
 */
export function getLocalizedString(str: LocalizedString | string, locale: string = 'ar'): string {
  if (typeof str === 'string') return str;
  return str[locale as keyof LocalizedString] || str.ar || '';
}

/**
 * Calculate order pricing based on quantity and pricing tiers
 */
export function calculatePrice(
  basePrice: number,
  quantity: number,
  bulkPrices?: Array<{ minQty: number; price: number }>,
  saleMode?: 'gros' | 'detail'
): number {
  // Detail mode always uses retail
  if (saleMode === 'detail') {
    return basePrice;
  }

  // Check bulk pricing tiers
  if (bulkPrices && bulkPrices.length > 0) {
    const sortedPrices = [...bulkPrices].sort((a, b) => b.minQty - a.minQty);

    for (const tier of sortedPrices) {
      if (quantity >= tier.minQty) {
        return tier.price;
      }
    }
  }

  return basePrice;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    processing: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    ready: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
    shipped: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
    delivered: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    paid: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    unpaid: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  };

  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
}

/**
 * Get role display name in Arabic
 */
export function getRoleDisplayName(role: string): string {
  const roles: Record<string, string> = {
    admin: 'مدير',
    client: 'عميل',
    commercial: 'مندوب تجاري',
    store: 'متجر',
  };

  return roles[role.toLowerCase()] || role;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Generate order status steps for timeline
 */
export function getOrderStatusSteps(currentStatus: string) {
  const allSteps = ['new', 'processing', 'ready', 'shipped', 'delivered'];
  const currentIndex = allSteps.indexOf(currentStatus);

  return allSteps.map((step, index) => ({
    name: step,
    completed: index <= currentIndex,
    current: index === currentIndex,
  }));
}

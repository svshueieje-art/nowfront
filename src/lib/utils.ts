// ========================================
// Utility Functions
// ========================================

import { config } from './config';

/**
 * Format a number as ETB currency.
 * Uses locale-aware formatting with proper thousand separators.
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} ${config.currency}`;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: config.timezone,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format a date with time.
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: config.timezone,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Mask phone number for display.
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
}

/**
 * Validate Ethiopian phone number.
 */
export function isValidEthiopianPhone(phone: string): boolean {
  // Accepts: 09XXXXXXXX, +2519XXXXXXXX, 2519XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '');
  return /^(\+?251|0)9\d{8}$/.test(cleaned);
}

/**
 * Normalize phone number to consistent format.
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+251')) return cleaned;
  if (cleaned.startsWith('251')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+251${cleaned.slice(1)}`;
  return cleaned;
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Truncate string with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Get transaction type display label.
 */
export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    REGISTRATION_BONUS: 'Registration Bonus',
    PURCHASE: 'Coffee Purchase',
    DAILY_CLAIM: 'Daily Income',
    REFERRAL_COMMISSION: 'Referral Commission',
    REWARD_CODE: 'Reward Code',
    WITHDRAWAL: 'Withdrawal',
    WITHDRAWAL_REVERSAL: 'Withdrawal Reversal',
    ADMIN_CREDIT: 'Admin Credit',
    ADMIN_DEBIT: 'Admin Debit',
  };
  return labels[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get status color classes.
 */
export function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'unlocked':
      return 'text-success-500 bg-success-500/10';
    case 'pending':
    case 'pending_payment':
    case 'pending_activation':
    case 'processing':
      return 'text-warning-500 bg-warning-500/10';
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return 'text-danger-500 bg-danger-500/10';
    case 'matured':
      return 'text-info-500 bg-info-500/10';
    case 'locked':
      return 'text-surface-400 bg-surface-400/10';
    default:
      return 'text-surface-400 bg-surface-400/10';
  }
}

/**
 * Determine if a transaction type is positive (credit).
 */
export function isPositiveTransaction(type: string): boolean {
  return [
    'REGISTRATION_BONUS',
    'DAILY_CLAIM',
    'REFERRAL_COMMISSION',
    'REWARD_CODE',
    'WITHDRAWAL_REVERSAL',
    'ADMIN_CREDIT',
  ].includes(type);
}

/**
 * Generate a referral link.
 */
export function generateReferralLink(code: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/register?ref=${code}`;
}

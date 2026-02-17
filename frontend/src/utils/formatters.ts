// frontend/src/utils/formatters.ts
/**
 * Formatter Functions
 * Functions for formatting dates, numbers, currencies, and other values
 */

import { DATE_FORMATS } from './constants';

/**
 * Format number with separators
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e9) {
    return sign + (abs / 1e9).toFixed(decimals) + 'B';
  }
  if (abs >= 1e6) {
    return sign + (abs / 1e6).toFixed(decimals) + 'M';
  }
  if (abs >= 1e3) {
    return sign + (abs / 1e3).toFixed(decimals) + 'K';
  }
  return sign + abs.toString();
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(decimals) + ' ' + sizes[i];
}

/**
 * Format date to string
 */
export function formatDate(
  date: Date | string,
  format: string = DATE_FORMATS.ISO,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  // Custom format patterns
  if (format === DATE_FORMATS.ISO) {
    return d.toISOString().split('T')[0];
  }

  if (format === DATE_FORMATS.US) {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  if (format === DATE_FORMATS.EU) {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (format === DATE_FORMATS.FULL) {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  }

  if (format === DATE_FORMATS.TIME) {
    return d.toTimeString().split(' ')[0];
  }

  if (format === DATE_FORMATS.DATETIME) {
    return d.toISOString().replace('T', ' ').split('.')[0];
  }

  // Default to ISO
  return d.toISOString().split('T')[0];
}

/**
 * Format date/time with locale
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

/**
 * Format duration (milliseconds to readable format)
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(endDate: Date | string): string {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string, countryCode: string = 'US'): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  if (countryCode === 'US') {
    // US format: (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }

  // Default: just return cleaned number
  return cleaned;
}

/**
 * Format credit card number
 */
export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
}

/**
 * Format customer ID
 */
export function formatCustomerId(id: string, prefix: string = 'CUST'): string {
  if (id.startsWith(prefix)) return id;
  return `${prefix}-${id}`;
}

/**
 * Format dataset name
 */
export function formatDatasetName(filename: string): string {
  // Remove extension
  const name = filename.replace(/\.[^/.]+$/, '');
  
  // Replace underscores and hyphens with spaces
  return name
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format churn probability
 */
export function formatChurnProbability(probability: number): string {
  return (probability * 100).toFixed(1) + '%';
}

/**
 * Format confidence score
 */
export function formatConfidence(confidence: number): string {
  return (confidence * 100).toFixed(0) + '%';
}

/**
 * Format risk level
 */
export function formatRiskLevel(riskLevel: string): string {
  const levels: Record<string, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk'
  };
  return levels[riskLevel.toLowerCase()] || riskLevel;
}

/**
 * Format contract type
 */
export function formatContractType(contractType: string): string {
  const types: Record<string, string> = {
    'Month-to-month': 'Monthly',
    'One year': '1 Year',
    'Two year': '2 Years'
  };
  return types[contractType] || contractType;
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(value: boolean | string): string {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'yes' || value === '1' ? 'Yes' : 'No';
  }
  return value ? 'Yes' : 'No';
}

/**
 * Format array as comma-separated string
 */
export function formatArray(arr: any[], separator: string = ', '): string {
  return arr.join(separator);
}

/**
 * Format error message
 */
export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unknown error occurred';
}

/**
 * Format API response message
 */
export function formatApiMessage(response: any): string {
  if (response?.message) return response.message;
  if (response?.msg) return response.msg;
  if (response?.error) return formatError(response.error);
  return 'Operation completed';
}

/**
 * Format initials from name
 */
export function formatInitials(name: string): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Format email (hide part of email)
 */
export function formatEmailPrivate(email: string): string {
  const [username, domain] = email.split('@');
  if (!domain) return email;
  
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const hidden = '*'.repeat(username.length - visibleChars);
  
  return `${username.substring(0, visibleChars)}${hidden}@${domain}`;
}

/**
 * Format address (multiline to single line)
 */
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format JSON for display
 */
export function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Format SQL-like field name to readable label
 */
export function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format validation errors
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${formatFieldLabel(field)}: ${messages.join(', ')}`)
    .join('\n');
}

/**
 * Format list with "and"
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1).join(', ');
  return `${otherItems}, ${conjunction} ${lastItem}`;
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Format range
 */
export function formatRange(min: number, max: number, unit: string = ''): string {
  return `${formatNumber(min)}${unit} - ${formatNumber(max)}${unit}`;
}

/**
 * Format model accuracy
 */
export function formatAccuracy(accuracy: number): string {
  return formatPercentage(accuracy, 2);
}

/**
 * Format model version
 */
export function formatModelVersion(version: string): string {
  return `v${version}`;
}

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatBytes,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatPhone,
  formatChurnProbability,
  formatConfidence,
  formatRiskLevel,
  formatContractType,
  formatBoolean,
  formatError,
  formatInitials,
  formatJson
};

/**
 * Formatting utility functions for the CRM application
 */

/**
 * Formats a number as currency (USD)
 * @param {number|string} val - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (val) => {
  if (!val && val !== 0) return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  });
};

/**
 * Masks an SSN, showing only the last 4 digits
 * @param {string} ssn - The SSN to mask
 * @returns {string} Masked SSN in format XXX-XX-1234
 */
export const maskSSN = (ssn) => {
  if (!ssn) return '';
  if (ssn.includes('X') || ssn.length <= 4) return ssn;
  const last4 = ssn.slice(-4);
  return 'XXX-XX-' + last4;
};

/**
 * Formats a phone number
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Formats a date string to a more readable format
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    ...options 
  };
  return dateObj.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Formats a timestamp to a relative time string (e.g., "2 hours ago")
 * @param {string|Date|number} timestamp - The timestamp to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return formatDate(date);
};

/**
 * Formats a number with commas
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '';
  const number = Number(num);
  if (isNaN(number)) return String(num);
  return number.toLocaleString();
};

/**
 * Formats a percentage
 * @param {number|string} val - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (val, decimals = 2) => {
  if (!val && val !== 0) return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return `${num.toFixed(decimals)}%`;
};


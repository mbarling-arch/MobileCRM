/**
 * Helper functions specific to Prospect/Deal management
 */

/**
 * Comprehensive label map for prospect-related keys
 * Converts internal keys to human-readable labels
 */
const LABEL_MAP = {
  // Home types
  singlewide: 'Singlewide',
  doublewide: 'Doublewide',
  triplewide: 'Triple Wide',
  'tiny home': 'Tiny Home',
  
  // Financing types
  cash: 'Cash',
  chattel: 'Chattel',
  'land/home': 'Land/Home',
  lnl: 'LNL',
  land_home: 'Land/Home',
  land_lieu: 'Land/Lieu',
  va: 'VA',
  fha_usda: 'FHA/USDA',
  
  // Housing status
  own: 'Own',
  rent: 'Rent',
  own_free_clear: 'Own Free and Clear',
  buying: 'Buying',
  renting: 'Renting',
  
  // Property types
  apartment: 'Apartment',
  house: 'House',
  condo: 'Condo',
  'mobile home': 'Mobile Home',
  community: 'Community',
  'private property': 'Private Property',
  'family land': 'Family Land',
  family: 'Family',
  park: 'Park',
  subdivide: 'Sub Divide',
  
  // Purpose types
  primary: 'Primary',
  secondary: 'Secondary',
  buy_for: 'Buy-For',
  investment: 'Investment',
  
  // Deal types
  none: 'None',
  selling_mobile: 'Selling Mobile',
  selling_site: 'Selling Site Built',
  tear_down: 'Tear Down',
  other: 'Other',
  
  // Utilities/Improvements
  electric: 'Electric',
  water: 'Water',
  septic: 'Septic',
  drive: 'Drive',
  pad: 'Pad',
  
  // Financial sources
  checking: 'Checking',
  savings: 'Savings',
  gift: 'Gift',
  '401k': '401k',
  land: 'Land',
  sale: 'Sale',
  
  // Contact preferences
  phone: 'Phone',
  email: 'Email',
  text: 'Text',
  
  // Lead sources
  facebook: 'Facebook',
  phone_up: 'Phone Up',
  website: 'Website',
  google: 'Google',
  bandit: 'Bandit',
  referral: 'Referral',
};

/**
 * Converts a key to a human-readable label
 * @param {string} key - The key to convert
 * @returns {string} Human-readable label
 */
export const labelize = (key) => {
  if (!key) return '';
  return LABEL_MAP[key] || key;
};

/**
 * Returns the default housing needs form structure
 * @returns {object} Default housing form object
 */
export const defaultHousing = () => ({
  homeType: '',
  prefBed: '',
  prefBath: '',
  prefSqft: '',
  desiredFeatures: '',
  currentOwnRent: '',
  currentHomeType: '',
  currentHowLong: '',
  currentMonthlyPayment: '',
  currentBed: '',
  currentBath: '',
  likes: '',
  dislikes: '',
  hasIdentifiedLocation: null,
  moveInTimeframe: '',
  preventMovingSooner: '',
  locationType: '',
  landImprovements: {},
  landSize: '',
  landPayoff: '',
  landMonthlyPayment: '',
  desiredArea: '',
  desiredLandSize: '',
  dealType: '',
  idealPrice: '',
  maxPrice: '',
  cashAvailable: '',
  cashSource: '',
  idealMonthlyPayment: '',
  maxMonthlyPayment: '',
  downPayment: '',
  availableToday: '',
  fundsSource: '',
  buyerEmployer: '',
  buyerStartDate: '',
  coBuyerEmployer: '',
  coBuyerStartDate: ''
});

/**
 * Gets the color for a credit score
 * @param {number} score - The credit score
 * @returns {string} Color code for the score
 */
export const getScoreColor = (score) => {
  if (!score) return 'text.disabled';
  const numScore = Number(score);
  if (numScore >= 720) return 'success.main';
  if (numScore >= 660) return 'warning.main';
  return 'error.main';
};

/**
 * Validates if a prospect has required buyer information
 * @param {object} buyerInfo - Buyer information object
 * @returns {boolean} True if valid
 */
export const validateBuyerInfo = (buyerInfo) => {
  if (!buyerInfo) return false;
  return !!(buyerInfo.firstName && buyerInfo.lastName && buyerInfo.phone);
};

/**
 * Calculates the completeness percentage of prospect data
 * @param {object} prospect - The prospect object
 * @returns {number} Completion percentage (0-100)
 */
export const calculateProspectCompleteness = (prospect) => {
  if (!prospect) return 0;
  
  const fields = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'address',
    'city',
    'state',
    'zip'
  ];
  
  const filledFields = fields.filter(field => 
    prospect[field] || prospect.buyerInfo?.[field]
  ).length;
  
  return Math.round((filledFields / fields.length) * 100);
};

/**
 * Generates initials from a name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials (e.g., "JD")
 */
export const getInitials = (firstName = '', lastName = '') => {
  const first = firstName?.trim()[0] || '';
  const last = lastName?.trim()[0] || '';
  return (first + last).toUpperCase();
};

/**
 * Gets the full name from buyer info
 * @param {object} buyerInfo - Buyer information object
 * @returns {string} Full name
 */
export const getFullName = (buyerInfo) => {
  if (!buyerInfo) return '';
  const parts = [
    buyerInfo.firstName,
    buyerInfo.middleName,
    buyerInfo.lastName
  ].filter(Boolean);
  return parts.join(' ');
};

/**
 * Gets the full address from buyer info
 * @param {object} buyerInfo - Buyer information object
 * @returns {string} Full address
 */
export const getFullAddress = (buyerInfo) => {
  if (!buyerInfo) return '';
  const parts = [
    buyerInfo.streetAddress,
    buyerInfo.city,
    buyerInfo.state,
    buyerInfo.zip
  ].filter(Boolean);
  return parts.join(', ');
};


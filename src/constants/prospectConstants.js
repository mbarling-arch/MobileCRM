/**
 * Constants for Prospect/Deal management
 */

/**
 * US States abbreviations
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

/**
 * Race/ethnicity options for demographic information
 */
export const RACE_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Two or More Races',
  'Prefer Not to Answer'
];

/**
 * Gender options
 */
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' }
];

/**
 * Contact preference options
 */
export const CONTACT_PREFERENCES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' }
];

/**
 * Prospect portal main navigation tabs
 */
export const PROSPECT_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'buyer-information', label: 'Buyer Info' },
  { id: 'home-info', label: 'Home Info' },
  { id: 'property-details', label: 'Property Details' },
  { id: 'financing', label: 'Financing' },
  { id: 'project', label: 'Project' }
];

/**
 * Lead source options
 */
export const LEAD_SOURCES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'phone_up', label: 'Phone Up' },
  { value: 'website', label: 'Website' },
  { value: 'google', label: 'Google' },
  { value: 'bandit', label: 'Bandit' },
  { value: 'referral', label: 'Referral' }
];

/**
 * Prospect stage options
 */
export const PROSPECT_STAGES = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'contract', label: 'Contract' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
];

/**
 * Home type options
 */
export const HOME_TYPES = [
  { value: 'singlewide', label: 'Singlewide' },
  { value: 'doublewide', label: 'Doublewide' },
  { value: 'triplewide', label: 'Triple Wide' },
  { value: 'tiny home', label: 'Tiny Home' }
];

/**
 * Financing type options
 */
export const FINANCING_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'chattel', label: 'Chattel' },
  { value: 'land/home', label: 'Land/Home' },
  { value: 'lnl', label: 'LNL' },
  { value: 'land_home', label: 'Land/Home' },
  { value: 'land_lieu', label: 'Land/Lieu' },
  { value: 'va', label: 'VA' },
  { value: 'fha_usda', label: 'FHA/USDA' }
];

/**
 * Housing status options
 */
export const HOUSING_STATUS = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' },
  { value: 'own_free_clear', label: 'Own Free and Clear' },
  { value: 'buying', label: 'Buying' },
  { value: 'renting', label: 'Renting' }
];

/**
 * Property type options
 */
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'mobile home', label: 'Mobile Home' },
  { value: 'community', label: 'Community' },
  { value: 'private property', label: 'Private Property' },
  { value: 'family land', label: 'Family Land' }
];

/**
 * Land type options
 */
export const LAND_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'park', label: 'Park' },
  { value: 'subdivide', label: 'Sub Divide' },
  { value: 'community', label: 'Community' },
  { value: 'private property', label: 'Private Property' }
];

/**
 * Purpose type options
 */
export const PURPOSE_TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'buy_for', label: 'Buy-For' },
  { value: 'investment', label: 'Investment' }
];

/**
 * Deal type options
 */
export const DEAL_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'selling_mobile', label: 'Selling Mobile' },
  { value: 'selling_site', label: 'Selling Site Built' },
  { value: 'tear_down', label: 'Tear Down' },
  { value: 'other', label: 'Other' }
];

/**
 * Utility/Improvement options
 */
export const UTILITIES = [
  { value: 'electric', label: 'Electric' },
  { value: 'water', label: 'Water' },
  { value: 'septic', label: 'Septic' },
  { value: 'drive', label: 'Drive' },
  { value: 'pad', label: 'Pad' }
];

/**
 * Financial source options
 */
export const FINANCIAL_SOURCES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'gift', label: 'Gift' },
  { value: '401k', label: '401k' },
  { value: 'land', label: 'Land' },
  { value: 'sale', label: 'Sale' }
];

/**
 * Credit score ranges for color coding
 */
export const CREDIT_SCORE_RANGES = {
  EXCELLENT: { min: 720, color: 'success.main' },
  GOOD: { min: 660, color: 'warning.main' },
  FAIR: { min: 0, color: 'error.main' }
};

/**
 * Default form field values
 */
export const DEFAULT_FORM_VALUES = {
  BUYER_INFO: {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    dob: '',
    ssn: '',
    gender: '',
    race: '',
    licenseNumber: '',
    licenseState: '',
    homePhone: '',
    workPhone: '',
    annualIncome: '',
    preferredContact: ''
  }
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  PHONE_LENGTH: 10,
  SSN_LENGTH: 9,
  ZIP_MIN_LENGTH: 5,
  ZIP_MAX_LENGTH: 10
};


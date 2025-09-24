// Lead-related constants and helpers

export const LEAD_SOURCES = [
  { value: 'facebook', label: 'Facebook', color: 'primary' },
  { value: 'phone_up', label: 'Phone Up', color: 'secondary' },
  { value: 'website', label: 'Website', color: 'info' },
  { value: 'google', label: 'Google', color: 'success' },
  { value: 'bandit', label: 'Bandit', color: 'warning' },
  { value: 'referral', label: 'Referral', color: 'secondary' }
];

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'warning' },
  { value: 'active', label: 'Active', color: 'info' },
  { value: 'appointment', label: 'Appointment', color: 'primary' },
  { value: 'lost', label: 'Lost', color: 'error' },
  { value: 'hold', label: 'Hold', color: 'secondary' }
];

export function getSourceMeta(value) {
  return LEAD_SOURCES.find(s => s.value === value) || { value, label: value, color: 'default' };
}

export function getStatusMeta(value) {
  return LEAD_STATUSES.find(s => s.value === value) || { value, label: value, color: 'default' };
}




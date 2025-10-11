import { Timestamp } from 'firebase/firestore';

export const sanitizeFirestoreData = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirestoreData(item));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeFirestoreData(nestedValue)])
    );
  }

  return value;
};




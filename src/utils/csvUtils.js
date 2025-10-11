/**
 * CSV Import/Export Utilities
 */

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    try {
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        errors.push({
          row: i + 1,
          message: `Column count mismatch. Expected ${headers.length}, got ${values.length}`
        });
        continue;
      }

      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      data.push(rowData);
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error.message
      });
    }
  }

  return { data, errors };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());

  return values;
}

/**
 * Convert array of objects to CSV text
 */
export function exportToCSV(data, headers) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      let value = item[header] || '';
      
      // Convert dates to readable format
      if (value?.toDate && typeof value.toDate === 'function') {
        value = new Date(value.toDate()).toLocaleDateString();
      } else if (value instanceof Date) {
        value = value.toLocaleDateString();
      }
      
      // Convert to string
      value = String(value);
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Validate lead data
 */
export function validateLeadData(lead, rowNumber) {
  const errors = [];

  // Required fields
  if (!lead.firstName || !lead.firstName.trim()) {
    errors.push(`Row ${rowNumber}: First name is required`);
  }
  if (!lead.lastName || !lead.lastName.trim()) {
    errors.push(`Row ${rowNumber}: Last name is required`);
  }

  // Email validation (if provided)
  if (lead.email && lead.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email.trim())) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }
  }

  // Phone validation (if provided)
  if (lead.phone && lead.phone.trim()) {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(lead.phone.trim())) {
      errors.push(`Row ${rowNumber}: Invalid phone format`);
    }
  }

  // Status validation
  const validStatuses = ['New', 'Contacted', 'Qualified', 'Nurturing', 'Lost', 'Converted'];
  if (lead.status && !validStatuses.includes(lead.status)) {
    errors.push(`Row ${rowNumber}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  return errors;
}

/**
 * Transform CSV lead data to Firestore format
 */
export function transformLeadForFirestore(csvLead) {
  return {
    firstName: csvLead.firstName?.trim() || '',
    lastName: csvLead.lastName?.trim() || '',
    email: csvLead.email?.trim() || '',
    phone: csvLead.phone?.trim() || '',
    status: csvLead.status?.trim() || 'New',
    source: csvLead.source?.trim() || '',
    address: csvLead.address?.trim() || '',
    city: csvLead.city?.trim() || '',
    state: csvLead.state?.trim() || '',
    zipCode: csvLead.zipCode?.trim() || '',
    notes: csvLead.notes?.trim() || '',
    estimatedValue: csvLead.estimatedValue ? parseFloat(csvLead.estimatedValue) : 0,
    preferredContactMethod: csvLead.preferredContactMethod?.trim() || 'Email',
    followUpDate: csvLead.followUpDate ? new Date(csvLead.followUpDate) : null
  };
}


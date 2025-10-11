/**
 * Document Parser Utility
 * 
 * Handles parsing and populating document templates (Word, Excel, PDF)
 * with buyer and prospect data.
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { jsPDF } from 'jspdf';

/**
 * Prepare data object for template population
 */
export const prepareTemplateData = (buyerInfo, coBuyerInfo, creditData, prospect) => {
  console.log('Preparing template data...');
  console.log('buyerInfo:', buyerInfo);
  console.log('creditData:', creditData);

  // Helper to format SSN with masking
  const formatSSN = (ssn) => {
    if (!ssn) return 'XXX-XX-XXXX';
    const last4 = ssn.slice(-4);
    return `XXX-XX-${last4}`;
  };

  // Buyer data - supporting multiple naming conventions
  const buyer = {
    // Name fields
    firstname: buyerInfo?.firstName || '',
    firstName: buyerInfo?.firstName || '',
    middlename: buyerInfo?.middleName || '',
    middleName: buyerInfo?.middleName || '',
    'middle name': buyerInfo?.middleName || '',
    lastname: buyerInfo?.lastName || '',
    lastName: buyerInfo?.lastName || '',
    
    // SSN variations
    ssn: formatSSN(creditData?.buyer_ssn),
    ssnFull: creditData?.buyer_ssn || '',
    ssnLast4: creditData?.buyer_ssn?.slice(-4) || 'XXXX',
    
    // Personal details
    dob: creditData?.buyer_dob || '',
    gender: creditData?.buyer_gender || '',
    race: creditData?.buyer_race || '',
    
    // License
    licensenumber: creditData?.buyer_licenseNumber || '',
    licenseNumber: creditData?.buyer_licenseNumber || '',
    licensestate: creditData?.buyer_licenseState || '',
    licenseState: creditData?.buyer_licenseState || '',
    
    // Address
    address: creditData?.buyer_address || buyerInfo?.streetAddress || '',
    city: creditData?.buyer_city || buyerInfo?.city || '',
    state: creditData?.buyer_state || buyerInfo?.state || '',
    zip: creditData?.buyer_zip || buyerInfo?.zip || '',
    
    // Phone
    phone: creditData?.buyer_homePhone || buyerInfo?.phone || '',
    homephone: creditData?.buyer_homePhone || '',
    homePhone: creditData?.buyer_homePhone || '',
    workphone: creditData?.buyer_workPhone || '',
    workPhone: creditData?.buyer_workPhone || '',
    
    // Income
    'annual income': creditData?.buyer_annualIncome || '',
    annualincome: creditData?.buyer_annualIncome || '',
    annualIncome: creditData?.buyer_annualIncome || '',
    
    // Email
    email: buyerInfo?.email || ''
  };

  // Co-Buyer data
  const coBuyer = {
    firstname: coBuyerInfo?.firstName || '',
    firstName: coBuyerInfo?.firstName || '',
    middlename: coBuyerInfo?.middleName || '',
    middleName: coBuyerInfo?.middleName || '',
    'middle name': coBuyerInfo?.middleName || '',
    lastname: coBuyerInfo?.lastName || '',
    lastName: coBuyerInfo?.lastName || '',
    ssn: formatSSN(creditData?.coBuyer_ssn),
    ssnFull: creditData?.coBuyer_ssn || '',
    ssnLast4: creditData?.coBuyer_ssn?.slice(-4) || 'XXXX',
    dob: creditData?.coBuyer_dob || '',
    gender: creditData?.coBuyer_gender || '',
    race: creditData?.coBuyer_race || '',
    licensenumber: creditData?.coBuyer_licenseNumber || '',
    licenseNumber: creditData?.coBuyer_licenseNumber || '',
    licensestate: creditData?.coBuyer_licenseState || '',
    licenseState: creditData?.coBuyer_licenseState || '',
    address: creditData?.coBuyer_address || coBuyerInfo?.streetAddress || '',
    city: creditData?.coBuyer_city || coBuyerInfo?.city || '',
    state: creditData?.coBuyer_state || coBuyerInfo?.state || '',
    zip: creditData?.coBuyer_zip || coBuyerInfo?.zip || '',
    phone: creditData?.coBuyer_homePhone || coBuyerInfo?.phone || '',
    homephone: creditData?.coBuyer_homePhone || '',
    homePhone: creditData?.coBuyer_homePhone || '',
    workphone: creditData?.coBuyer_workPhone || '',
    workPhone: creditData?.coBuyer_workPhone || '',
    'annual income': creditData?.coBuyer_annualIncome || '',
    annualincome: creditData?.coBuyer_annualIncome || '',
    annualIncome: creditData?.coBuyer_annualIncome || '',
    email: coBuyerInfo?.email || ''
  };

  const templateData = {
    Buyer: buyer,
    buyer: buyer,
    CoBuyer: coBuyer,
    cobuyer: coBuyer,
    date: new Date().toLocaleDateString(),
    today: new Date().toLocaleDateString()
  };

  console.log('Template data prepared:', templateData);
  return templateData;
};

/**
 * Parse and populate a Word document template
 */
export const populateWordTemplate = async (templateUrl, data, outputFileName = 'populated-document.docx') => {
  try {
    console.log('Downloading Word template from:', templateUrl);
    
    // Download the template
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log('Template downloaded, size:', arrayBuffer.byteLength);

    // Load the template
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      },
      nullGetter: () => '' // Return empty string for missing values
    });

    console.log('Populating template with data:', data);
    
    // Populate the template with data
    doc.render(data);

    console.log('Template rendered successfully');

    // Generate the populated document
    const output = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Download the file
    saveAs(output, outputFileName);
    console.log('File saved:', outputFileName);
    return true;
  } catch (error) {
    console.error('Error populating Word template:', error);
    if (error.properties && error.properties.errors) {
      console.error('Template errors:', error.properties.errors);
    }
    throw error;
  }
};

/**
 * Parse and populate an Excel template
 */
export const populateExcelTemplate = async (templateUrl, data, outputFileName = 'populated-spreadsheet.xlsx', convertToPDF = false) => {
  try {
    console.log('Downloading Excel template from:', templateUrl);
    
    // Download the template
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log('Template downloaded, size:', arrayBuffer.byteLength);

    // Load workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    console.log('Workbook loaded, sheets:', workbook.worksheets.length);

    let replacementCount = 0;
    const populatedData = []; // Store data for PDF conversion

    // Iterate through all worksheets
    workbook.eachSheet((worksheet) => {
      console.log('Processing sheet:', worksheet.name);
      const sheetData = [];
      
      worksheet.eachRow((row, rowNumber) => {
        const rowData = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          let cellValue = cell.value;
          
          if (cellValue && typeof cellValue === 'string') {
            const originalValue = cellValue;

            // Replace all placeholders in the cell
            // Support both {{Buyer.field}} and {{buyer.field}} formats
            const regex = /\{\{([^}]+)\}\}/g;
            cellValue = cellValue.replace(regex, (match, path) => {
              console.log('Found placeholder:', match, 'in cell', `${rowNumber},${colNumber}`);
              
              // Parse the path (e.g., "Buyer.firstname" or "buyer.ssn")
              const parts = path.trim().split('.');
              let value = data;

              for (const part of parts) {
                // Try case-insensitive matching
                const key = Object.keys(value || {}).find(
                  k => k.toLowerCase() === part.toLowerCase()
                );
                value = value?.[key];
              }

              const result = value !== undefined && value !== null && value !== '' ? value : '';
              console.log('Replaced', match, 'with:', result);
              
              if (result !== '') replacementCount++;
              return result;
            });

            if (cellValue !== originalValue) {
              cell.value = cellValue;
            }
          }
          
          rowData.push({
            value: cell.value || '',
            style: cell.style || {},
            colSpan: cell.colSpan || 1
          });
        });
        sheetData.push(rowData);
      });
      populatedData.push({ name: worksheet.name, data: sheetData });
    });

    console.log('Total replacements made:', replacementCount);

    if (convertToPDF) {
      console.log('Converting to PDF...');
      return await convertExcelToPDF(populatedData, outputFileName.replace('.xlsx', '.pdf'));
    } else {
      // Generate buffer and download as Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, outputFileName);
      console.log('Excel file saved:', outputFileName);
      return true;
    }
  } catch (error) {
    console.error('Error populating Excel template:', error);
    throw error;
  }
};

/**
 * Convert populated Excel data to PDF
 */
const convertExcelToPDF = async (sheetsData, outputFileName) => {
  try {
    const pdf = new jsPDF('p', 'pt', 'letter');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    
    let currentY = margin;
    const lineHeight = 14;
    const cellPadding = 8;
    
    // Process first sheet only for now
    const sheet = sheetsData[0];
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica');
    
    sheet.data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (currentY > pageHeight - margin - 20) {
        pdf.addPage();
        currentY = margin;
      }
      
      let maxCellHeight = lineHeight + (cellPadding * 2);
      const cellWidth = contentWidth / Math.max(row.length, 2);
      
      row.forEach((cellData, colIndex) => {
        const x = margin + (colIndex * cellWidth);
        const cellText = String(cellData.value || '');
        
        // Draw cell background for header rows (first 3 rows typically)
        if (rowIndex < 3 && cellText.trim() !== '') {
          pdf.setFillColor(240, 240, 255);
          pdf.rect(x, currentY, cellWidth, maxCellHeight, 'F');
        }
        
        // Draw cell border
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, currentY, cellWidth, maxCellHeight);
        
        // Draw text
        pdf.setTextColor(0, 0, 0);
        if (rowIndex < 3) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        // Center text vertically in cell
        const textY = currentY + cellPadding + (lineHeight * 0.7);
        pdf.text(cellText, x + cellPadding, textY, {
          maxWidth: cellWidth - (cellPadding * 2)
        });
      });
      
      currentY += maxCellHeight;
    });
    
    // Add footer with generation info
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 20);
    
    // Save as PDF
    pdf.save(outputFileName);
    console.log('PDF saved:', outputFileName);
    return true;
  } catch (error) {
    console.error('Error converting to PDF:', error);
    throw error;
  }
};

/**
 * Populate a PDF template
 * Note: For PDFs to work with placeholders, you need to either:
 * 1. Use a PDF with fillable form fields, OR
 * 2. Convert to Word/Excel format for text replacement
 */
export const populatePDFTemplate = async (templateUrl, data, outputFileName = 'populated-document.pdf') => {
  try {
    console.log('Downloading PDF template from:', templateUrl);
    
    // Download the template
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF template downloaded, size:', arrayBuffer.byteLength);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('PDF loaded. Found', fields.length, 'form fields');

    if (fields.length === 0) {
      console.warn('⚠️ PDF has no form fields! Cannot populate.');
      alert('⚠️ PDF Limitation\n\nYour PDF doesn\'t have fillable form fields.\n\nFor automatic data population, please:\n1. Re-upload as Word (.docx) or Excel (.xlsx) format, OR\n2. Use a PDF with fillable form fields\n\nOpening the template for manual filling...');
      window.open(templateUrl, '_blank');
      return false;
    }

    // Create field mapping for common patterns
    const fieldMappings = {
      // Name fields
      'print your name': 'Buyer.firstName',
      'print your name_2': 'CoBuyer.firstName',
      'name': 'Buyer.firstName',
      'buyer name': 'Buyer.firstName',
      'cobuyer name': 'CoBuyer.firstName',
      
      // SSN fields
      'social security': 'Buyer.ssn',
      'social security_2': 'CoBuyer.ssn',
      'ssn': 'Buyer.ssn',
      'buyer ssn': 'Buyer.ssn',
      'cobuyer ssn': 'CoBuyer.ssn',
      
      // DOB fields
      'date of birth': 'Buyer.dob',
      'date of birthmmddyyyy': 'Buyer.dob',
      'date of birthmmddyyyy_2': 'CoBuyer.dob',
      'dob': 'Buyer.dob',
      'buyer dob': 'Buyer.dob',
      'cobuyer dob': 'CoBuyer.dob',
      
      // Gender
      'gender m or f': 'Buyer.gender',
      'gender m or f_2': 'CoBuyer.gender',
      'gender': 'Buyer.gender',
      
      // Race
      'race': 'Buyer.race',
      'race_2': 'CoBuyer.race',
      
      // Driver License
      'driver license': 'Buyer.driverLicense',
      'driver license_2': 'CoBuyer.driverLicense',
      'dl': 'Buyer.driverLicense',
      
      // State fields (need context for which state it is)
      'state': 'Buyer.dlState',
      'state_2': 'CoBuyer.dlState',
      'state_3': 'Buyer.state',
      'state_4': 'CoBuyer.state',
      
      // Address
      'current address': 'Buyer.address',
      'current address_2': 'CoBuyer.address',
      'address': 'Buyer.address',
      
      // City
      'city': 'Buyer.city',
      'city_2': 'CoBuyer.city',
      
      // Zip
      'zip': 'Buyer.zipCode',
      'zip_2': 'CoBuyer.zipCode',
      
      // Phone
      'home phone': 'Buyer.phone',
      'home phone_2': 'CoBuyer.phone',
      'work phone': 'Buyer.workPhone',
      'work phone_2': 'CoBuyer.workPhone',
      'phone': 'Buyer.phone',
      
      // Income
      'annual income': 'Buyer.annualIncome',
      'annual income_2': 'CoBuyer.annualIncome',
      'income': 'Buyer.annualIncome'
    };

    // Try to fill form fields
    let fieldsPopulated = 0;
    fields.forEach((field) => {
      const fieldName = field.getName();
      const fieldNameLower = fieldName.toLowerCase();
      console.log('Processing field:', fieldName);

      let value = null;

      // First, try exact mapping
      if (fieldMappings[fieldNameLower]) {
        const path = fieldMappings[fieldNameLower].split('.');
        if (path.length === 2) {
          value = data[path[0]]?.[path[1]];
        }
      }
      
      // If no exact match, try parsing format like "Buyer.firstname" or "buyer_firstname"
      if (!value) {
        const parts = fieldName.split(/[._]/);
        
        if (parts.length >= 2) {
          const section = parts[0].toLowerCase();
          const fieldKey = parts.slice(1).join('').toLowerCase();

          if (section === 'buyer') {
            const key = Object.keys(data.Buyer).find(k => k.toLowerCase().replace(/[\s_]/g, '') === fieldKey.replace(/[\s_]/g, ''));
            value = data.Buyer[key];
          } else if (section === 'cobuyer') {
            const key = Object.keys(data.CoBuyer).find(k => k.toLowerCase().replace(/[\s_]/g, '') === fieldKey.replace(/[\s_]/g, ''));
            value = data.CoBuyer[key];
          }
        }
      }

      // Try to set the field value
      if (value) {
        try {
          field.setText(String(value));
          fieldsPopulated++;
          console.log('✓ Set field', fieldName, 'to:', value);
        } catch (e) {
          console.error('✗ Error setting field', fieldName, ':', e);
        }
      } else {
        console.log('○ No value found for field:', fieldName);
      }
    });

    console.log(`📊 Populated ${fieldsPopulated} of ${fields.length} fields`);

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, outputFileName);
    console.log('PDF saved:', outputFileName);
    return true;
  } catch (error) {
    console.error('Error populating PDF template:', error);
    throw error;
  }
};

/**
 * Main function to populate any document template
 */
export const populateTemplate = async (templateDoc, buyerInfo, coBuyerInfo, creditData, prospect, convertToPDF = true) => {
  console.log('=== Starting Document Population ===');
  console.log('Template document:', templateDoc);
  console.log('File type:', templateDoc.fileType);
  console.log('File name:', templateDoc.fileName);
  console.log('Convert to PDF:', convertToPDF);
  
  const data = prepareTemplateData(buyerInfo, coBuyerInfo, creditData, prospect);
  
  // For Excel, output as PDF if convertToPDF is true
  const isExcel = templateDoc.fileType?.includes('spreadsheet') || templateDoc.fileName?.endsWith('.xlsx') || templateDoc.fileName?.endsWith('.xls');
  const outputExtension = (isExcel && convertToPDF) ? 'pdf' : templateDoc.fileName?.split('.').pop() || 'docx';
  const fileName = `${templateDoc.subcategory || templateDoc.name} - ${buyerInfo?.firstName || 'Customer'} ${buyerInfo?.lastName || ''}.${outputExtension}`;

  console.log('Output filename will be:', fileName);

  // Determine file type and use appropriate parser
  if (templateDoc.fileType?.includes('word') || templateDoc.fileName?.endsWith('.docx')) {
    console.log('Detected as Word document, using Word parser...');
    return await populateWordTemplate(templateDoc.downloadURL, data, fileName);
  } else if (isExcel) {
    console.log('Detected as Excel spreadsheet, using Excel parser with PDF conversion:', convertToPDF);
    return await populateExcelTemplate(templateDoc.downloadURL, data, fileName, convertToPDF);
  } else if (templateDoc.fileType?.includes('pdf') || templateDoc.fileName?.endsWith('.pdf')) {
    console.log('Detected as PDF, attempting to populate...');
    return await populatePDFTemplate(templateDoc.downloadURL, data, fileName);
  } else {
    // For other formats, just download the template
    console.log('Unsupported file type, opening template directly');
    window.open(templateDoc.downloadURL, '_blank');
    return false;
  }
};


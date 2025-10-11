import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { db, storage } from '../../firebase';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUser } from '../../hooks/useUser';
import { DealBuilderItem } from './dealbuilder/DealBuilderItem';
import { DealBuilderCategory } from './dealbuilder/DealBuilderCategory';
import { DealBuilderSummary } from './dealbuilder/DealBuilderSummary';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Preset items data - loaded lazily to improve initial load performance
const PRESET_ITEMS = {
  'land-purchase': [
    { description: 'Land Purchase', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'home-invoice': [
    { description: 'Home Invoice', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'delivery-setup': [
    { description: 'Delivery & Set', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Trim Out', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Rental Equipment', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Perimeter Blocking', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Cleaning', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Walkthrough', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'exterior-attachments': [
    { description: 'HVAC Install', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'A/C Quick Disconnect', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Skirting', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Steps/Decks', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Shed', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Garage', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Shed/Garage Foundation', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'land-improvements': [
    { description: 'Driveway', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Basepad', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Land Clearing', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Final Grade', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Materials', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'utilities': [
    { description: 'Electric Tap', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Electric Pole', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Electric Connection', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Electric to Well', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Well Install', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Water Meter Install', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Well House', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Water Connection', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Septic Install', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Sewer Tap', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Sewer Drops', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Gas/Propane Install', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Gas Connections', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'fha-va-usda': [
    { description: 'Engineered Report', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Final Compliance', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Retrofit', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Termite Treatment', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Water Test', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Final Survey', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Builder\'s Risk', cost: 0, markup: 0, price: 0, notes: '' }
  ],
  'miscellaneous': [
    { description: 'Referral', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Bank Fees', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Welcome Home Gift', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Marketing', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Promo', cost: 0, markup: 0, price: 0, notes: '' },
    { description: 'Gift Card', cost: 0, markup: 0, price: 0, notes: '' }
  ]
};

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};


function DealBuilder({ companyId, prospectId, isDeal = false, initial = {} }) {
  const { userProfile } = useUser();
  const [categories, setCategories] = useState(initial?.categories || [
    { id: 'land-purchase', name: 'Land Purchase Price', expanded: true, items: [], loaded: false },
    { id: 'home-invoice', name: 'Home Invoice', expanded: true, items: [], loaded: false },
    { id: 'delivery-setup', name: 'Delivery and Set Up', expanded: false, items: [], loaded: false },
    { id: 'exterior-attachments', name: 'Exterior Attachments', expanded: false, items: [], loaded: false },
    { id: 'land-improvements', name: 'Land Improvements', expanded: false, items: [], loaded: false },
    { id: 'utilities', name: 'Utilities', expanded: false, items: [], loaded: false },
    { id: 'fha-va-usda', name: 'FHA, VA, USDA Requirements', expanded: false, items: [], loaded: false },
    { id: 'miscellaneous', name: 'Miscellaneous', expanded: false, items: [], loaded: false }
  ]);
  const [nextId, setNextId] = useState(47);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    if (initial?.categories && initial.categories.length > 0) {
      // Mark categories as loaded when loading from existing data
      const loadedCategories = initial.categories.map(category => ({
        ...category,
        loaded: true
      }));
      setCategories(loadedCategories);

      // Calculate next ID from all items across all categories
      let maxId = 0;
      initial.categories.forEach(category => {
        category.items.forEach(item => {
          maxId = Math.max(maxId, item.id);
        });
      });
      setNextId(maxId + 1);
    }
  }, [initial]);

  // Safe formula evaluation (without eval)
  const safeEval = (expression) => {
    // Only allow basic arithmetic operations
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    try {
      // Use Function constructor instead of eval for better security
      return new Function('return ' + sanitized)();
    } catch {
      return 0;
    }
  };

  // Calculate formulas
  const calculateFormula = (formula, itemData, categoryId, allCategories) => {
    if (!formula || typeof formula !== 'string') return 0;

    try {
      // Simple formula support: SUM(range), references like =A1+B1, etc.
      let processedFormula = formula.toUpperCase().trim();

      if (processedFormula.startsWith('=')) {
        processedFormula = processedFormula.substring(1);
      }

      // Handle SUM function
      if (processedFormula.startsWith('SUM(')) {
        const match = processedFormula.match(/SUM\((.+)\)/);
        if (match) {
          // Sum all prices across all categories
          let total = 0;
          allCategories.forEach(category => {
            category.items.forEach(item => {
              total += parseFloat(item.price) || 0;
            });
          });
          return total;
        }
      }

      // Handle basic arithmetic with cell references (simplified)
      // For now, keep it simple - just allow basic arithmetic
      const cellRefs = processedFormula.match(/[A-Z]\d+/g);
      if (cellRefs) {
        let result = processedFormula;

        // Find the current category and item position
        let globalItemIndex = 0;
        let found = false;
        for (let catIndex = 0; catIndex < allCategories.length; catIndex++) {
          const category = allCategories[catIndex];
          for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
            if (category.id === categoryId && category.items[itemIndex].id === itemData.id) {
              found = true;
              break;
            }
            globalItemIndex++;
          }
          if (found) break;
        }

        cellRefs.forEach(ref => {
          const col = ref.charAt(0);
          const row = parseInt(ref.substring(1)) - 1;

          let value = 0;
          // Simple global reference system
          let currentIndex = 0;
          for (const category of allCategories) {
            for (const item of category.items) {
              if (currentIndex === row) {
                switch (col) {
                  case 'A': value = item.cost || 0; break;
                  case 'B': value = item.markup || 0; break;
                  case 'C': value = item.price || 0; break;
                }
                break;
              }
              currentIndex++;
            }
            if (value !== 0) break;
          }
          result = result.replace(ref, value);
        });

        // Use safe evaluation instead of eval
        return safeEval(result);
      }

      return parseFloat(processedFormula) || 0;
    } catch (error) {
      console.error('Formula calculation error:', error);
      return 0;
    }
  };

  // Debounced update item data (300ms delay to reduce calculation frequency)
  const updateItem = useCallback(debounce((categoryId, itemId, field, value) => {
    setCategories(prevCategories => {
      const newCategories = prevCategories.map(category => {
        if (category.id === categoryId) {
          const newItems = category.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value };

              // Auto-calculate price if cost or markup changes
              if (field === 'cost' || field === 'markup') {
                const cost = field === 'cost' ? parseFloat(value) || 0 : parseFloat(item.cost) || 0;
                const markup = field === 'markup' ? parseFloat(value) || 0 : parseFloat(item.markup) || 0;
                updatedItem.price = cost + markup;
              }

              // Handle formula calculations
              if (field === 'price' && typeof value === 'string' && value.startsWith('=')) {
                updatedItem.price = calculateFormula(value, updatedItem, categoryId, prevCategories);
              }

              return updatedItem;
            }
            return item;
          });

          // Recalculate any formula-based prices in this category
          const recalculatedItems = newItems.map(item => {
            if (typeof item.price === 'string' && item.price.startsWith('=')) {
              return { ...item, price: calculateFormula(item.price, item, categoryId, prevCategories.map(c =>
                c.id === categoryId ? { ...c, items: newItems } : c
              )) };
            }
            return item;
          });

          return { ...category, items: recalculatedItems };
        }
        return category;
      });

      return newCategories;
    });
  }), [300]);

  // Add item to category
  const addItemToCategory = (categoryId) => {
    const newItem = {
      id: nextId,
      description: 'New Item',
      cost: 0,
      markup: 0,
      price: 0,
      notes: ''
    };
    setCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, items: [...category.items, newItem] }
        : category
    ));
    setNextId(prev => prev + 1);
  };

  // Delete item from category
  const deleteItemFromCategory = (categoryId, itemId) => {
    setCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, items: category.items.filter(item => item.id !== itemId) }
        : category
    ));
  };

  // Toggle category expansion with lazy loading of preset items
  const toggleCategoryExpansion = useCallback((categoryId) => {
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        const newExpanded = !category.expanded;

        // Lazy load preset items on first expansion
        if (newExpanded && !category.loaded && PRESET_ITEMS[categoryId]) {
          const presetItems = PRESET_ITEMS[categoryId].map((item, index) => ({
            ...item,
            id: nextId + index
          }));

          setNextId(prev => prev + presetItems.length);

          return {
            ...category,
            expanded: newExpanded,
            loaded: true,
            items: [...category.items, ...presetItems]
          };
        }

        return { ...category, expanded: newExpanded };
      }
      return category;
    }));
  }, [nextId]);

  // Calculate totals with memoization
  const totals = useMemo(() => {
    let subtotal = 0;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        subtotal += parseFloat(item.price) || 0;
      }
    }
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [categories]);

  // Memoized category totals for individual category calculations
  const categoryTotals = useMemo(() => {
    return categories.map(category => ({
      ...category,
      total: category.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    }));
  }, [categories]);

  // Save data to Firestore
  const saveDataToFirestore = async () => {
    const ref = doc(db, 'companies', companyId, 'prospects', prospectId);
    await updateDoc(ref, {
      dealBuilder: {
        categories,
        totals,
        updatedAt: new Date()
      }
    });
  };

  // Generate and upload PDF in background
  const generateAndUploadPDF = async () => {
    setGeneratingPDF(true);
    try {
      // Generate PDF for document storage
      const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Deal Builder - Internal Document', 20, 20);

        // Date and Prospect ID
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);
        if (prospectId) {
          doc.text(`Prospect ID: ${prospectId}`, 20, 35);
        }

        let yPosition = 50;

        categories.forEach((category, categoryIndex) => {
          if (category.items.length > 0) {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }

            // Category header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(category.name, 20, yPosition);
            yPosition += 8;

            // Category items with all details
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            category.items.forEach((item, itemIndex) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }

              const description = item.description || 'No description';
              const cost = `$${parseFloat(item.cost || 0).toFixed(2)}`;
              const markup = `$${parseFloat(item.markup || 0).toFixed(2)}`;
              const price = `$${parseFloat(item.price || 0).toFixed(2)}`;
              const notes = item.notes || '';

              // Main item line
              doc.text(`${description}:`, 25, yPosition);
              doc.text(`${cost} + ${markup} = ${price}`, 120, yPosition);

              yPosition += 6;

              // Notes (if any)
              if (notes.trim()) {
                const maxWidth = 150;
                const lines = doc.splitTextToSize(`Notes: ${notes}`, maxWidth);

                lines.forEach((line, lineIndex) => {
                  if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  doc.setFontSize(8);
                  doc.setTextColor(100, 100, 100);
                  doc.text(line, 30, yPosition);
                  doc.setTextColor(0, 0, 0);
                  yPosition += 5;
                });

                doc.setFontSize(9);
                yPosition += 2;
              } else {
                yPosition += 2;
              }
            });

            // Category subtotal
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }

            const categorySubtotal = category.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${category.name} Subtotal: $${categorySubtotal.toFixed(2)}`, 20, yPosition);
            yPosition += 10;
          }
        });

        // Overall totals
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FINAL TOTALS', 20, yPosition);
        yPosition += 12;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: $${totals.subtotal.toFixed(2)}`, 30, yPosition);
        yPosition += 8;
        doc.text(`Tax (8%): $${totals.tax.toFixed(2)}`, 30, yPosition);
        yPosition += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text(`Grand Total: $${totals.total.toFixed(2)}`, 30, yPosition);

        doc.setTextColor(0, 0, 0);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(`Page ${i} of ${pageCount} - Deal Builder Internal Document`, 20, 285);
        }

      // Generate PDF blob and upload to documents
      const pdfBlob = doc.output('blob');
      const fileName = `deal-builder-internal-${prospectId || 'no-id'}-${new Date().toISOString().split('T')[0]}.pdf`;
      await uploadPDFToDocuments(pdfBlob, fileName);

      setSnackbar({ open: true, message: 'Deal builder saved and document created successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving deal builder:', error);
      setSnackbar({ open: true, message: 'Error saving deal builder', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Main save function that handles both data saving and optional PDF generation
  const handleSave = async (createDocument = false) => {
    if (!companyId || !prospectId) return;

    setSaving(true);
    try {
      await saveDataToFirestore();
      setSnackbar({ open: true, message: 'Deal builder saved successfully', severity: 'success' });

      // Generate PDF in background if requested (doesn't block UI)
      if (createDocument) {
        generateAndUploadPDF();
      }
    } catch (error) {
      console.error('Error saving deal builder:', error);
      setSnackbar({ open: true, message: 'Error saving deal builder', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Upload PDF to Documents
  const uploadPDFToDocuments = async (pdfBlob, fileName) => {
    try {
      console.log('Uploading PDF to documents...');

      // Create storage reference
      const collectionName = isDeal ? 'deals' : 'prospects';
      const storageRef = ref(storage, `companies/${companyId}/${collectionName}/${prospectId}/documents/${fileName}`);

      // Upload the blob
      await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(storageRef);

      // Create document record
      const docData = {
        name: `Deal Builder - ${new Date().toLocaleDateString()}`,
        type: 'document',
        category: 'Construction Documents',
        description: `Automatically generated deal builder document with ${categories.reduce((sum, cat) => sum + cat.items.length, 0)} line items across ${categories.length} categories. Total: $${totals.total.toFixed(2)}`,
        file: {
          path: storageRef.fullPath,
          url: downloadURL,
          size: pdfBlob.size,
          type: 'application/pdf'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'companies', companyId, collectionName, prospectId, 'documents'), docData);
      console.log('PDF uploaded to documents successfully');

    } catch (error) {
      console.error('Error uploading PDF to documents:', error);
      // Don't throw error - PDF export should still work even if document upload fails
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      console.log('Starting PDF export...');
      console.log('jsPDF available:', typeof jsPDF);
      console.log('Categories:', categories.length);

      const doc = new jsPDF();
      console.log('jsPDF instance created');

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Deal Builder - Internal Document', 20, 20);
      console.log('Title added');

      // Date and Prospect ID
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);
      if (prospectId) {
        doc.text(`Prospect ID: ${prospectId}`, 20, 35);
      }

      let yPosition = 50;

      categories.forEach((category, categoryIndex) => {
        if (category.items.length > 0) {
          console.log(`Processing category: ${category.name} with ${category.items.length} items`);

          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          // Category header
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(category.name, 20, yPosition);
          yPosition += 8;

          // Category items with all details
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');

          category.items.forEach((item, itemIndex) => {
            // Check if we need a new page
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }

            const description = item.description || 'No description';
            const cost = `$${parseFloat(item.cost || 0).toFixed(2)}`;
            const markup = `$${parseFloat(item.markup || 0).toFixed(2)}`;
            const price = `$${parseFloat(item.price || 0).toFixed(2)}`;
            const notes = item.notes || '';

            // Main item line
            doc.text(`${description}:`, 25, yPosition);
            doc.text(`${cost} + ${markup} = ${price}`, 120, yPosition);

            yPosition += 6;

            // Notes (if any)
            if (notes.trim()) {
              // Word wrap notes
              const maxWidth = 150;
              const lines = doc.splitTextToSize(`Notes: ${notes}`, maxWidth);

              lines.forEach((line, lineIndex) => {
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = 20;
                }
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100); // Gray color for notes
                doc.text(line, 30, yPosition);
                doc.setTextColor(0, 0, 0); // Back to black
                yPosition += 5;
              });

              doc.setFontSize(9);
              yPosition += 2; // Extra space after notes
            } else {
              yPosition += 2;
            }
          });

          // Category subtotal
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          const categorySubtotal = category.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${category.name} Subtotal: $${categorySubtotal.toFixed(2)}`, 20, yPosition);
          yPosition += 10;
        }
      });

      // Overall totals - ensure on final page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FINAL TOTALS', 20, yPosition);
      yPosition += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal: $${totals.subtotal.toFixed(2)}`, 30, yPosition);
      yPosition += 8;
      doc.text(`Tax (8%): $${totals.tax.toFixed(2)}`, 30, yPosition);
      yPosition += 8;

      // Final total with emphasis
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text(`Grand Total: $${totals.total.toFixed(2)}`, 30, yPosition);

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${pageCount} - Deal Builder Internal Document`, 20, 285);
      }

      // Generate PDF blob
      const pdfBlob = doc.output('blob');

      // Save the PDF to downloads
      const fileName = `deal-builder-internal-${prospectId || 'no-id'}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);

      // Also upload to Construction Documents
      await uploadPDFToDocuments(pdfBlob, fileName);

      // Close dialog and show success message
      setExportDialogOpen(false);
      setSnackbar({ open: true, message: 'Internal PDF exported and saved to Construction Documents', severity: 'success' });
      console.log('PDF export and document upload completed successfully');

    } catch (error) {
      console.error('Error exporting PDF:', error);
      console.error('Error stack:', error.stack);
      setSnackbar({ open: true, message: `Error exporting PDF: ${error.message}`, severity: 'error' });
      setExportDialogOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>
          Deal Builder
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={() => setExportDialogOpen(true)}
            sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder' }}
          >
            Export Internal PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(true)}
            disabled={saving || generatingPDF}
            sx={{ color: 'text.primary', borderColor: 'customColors.calendarBorder', mr: 1 }}
          >
            {saving ? 'Saving...' : generatingPDF ? 'Generating PDF...' : 'Save & Create Doc'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving || generatingPDF}
            color="success"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>

        {/* PDF Generation Status */}
        {generatingPDF && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
            📄 Generating PDF document in background...
          </Typography>
        )}
      </Stack>

      {/* Accordion Categories */}
      <Stack spacing={1}>
        {categories.map((category) => (
          <DealBuilderCategory
            key={category.id}
            category={category}
            categoryTotals={categoryTotals}
            onToggleExpansion={toggleCategoryExpansion}
            onAddItem={addItemToCategory}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItemFromCategory}
          />
        ))}
      </Stack>

      <DealBuilderSummary totals={totals} />

      {/* Formula Help */}
      <Paper sx={{ mt: 2, p: 2, backgroundColor: 'customColors.tableRowBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
          <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Formula Support
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Use formulas in the Price column: <code>=SUM</code> for totals, or cell references like <code>A1+B1</code> (A=Cost, B=Markup, C=Price)
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="=SUM" size="small" variant="outlined" />
          <Chip label="A1+B1" size="small" variant="outlined" />
          <Chip label="Auto-calculation" size="small" color="primary" />
        </Stack>
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Internal Deal Builder Document</DialogTitle>
        <DialogContent>
          <Typography>
            This will export a detailed internal document with all cost breakdowns, markups, prices, and notes for each item across all categories.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={exportToPDF} variant="contained" startIcon={<PdfIcon />}>
            Export PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DealBuilder;

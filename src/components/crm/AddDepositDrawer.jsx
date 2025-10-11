import React, { useState, useEffect } from 'react';
import { FormTextField, FormSelect } from '../FormField';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useUser } from '../../hooks/useUser';
import jsPDF from 'jspdf';

function AddDepositDrawer({ open, onClose, prospectId, buyerInfo, onConvertToDeal, isDeal = false }) {
  const { userProfile } = useUser();
  const [form, setForm] = useState({
    amount: '',
    type: '',
    receiptNumber: ''
  });
  const [saving, setSaving] = useState(false);

  const [nextReceiptNumber, setNextReceiptNumber] = useState(100000);

  // Generate next receipt number when drawer opens
  useEffect(() => {
    if (open && userProfile?.companyId) {
      const generateNextReceiptNumber = async () => {
        try {
          // Use correct collection based on isDeal flag
          const collectionName = isDeal ? 'deals' : 'prospects';

          // Get the highest receipt number from existing deposits
          const depositsQuery = query(
            collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'deposits'),
            orderBy('receiptNumber', 'desc'),
            limit(1)
          );
          const snapshot = await getDocs(depositsQuery);

          if (!snapshot.empty) {
            const highestReceipt = snapshot.docs[0].data().receiptNumber;
            const nextNumber = Math.max(parseInt(highestReceipt) + 1, 100000);
            setNextReceiptNumber(nextNumber);
          } else {
            setNextReceiptNumber(100000);
          }
        } catch (error) {
          console.error('Error generating receipt number:', error);
          setNextReceiptNumber(100000);
        }
      };

      generateNextReceiptNumber();
    }
  }, [open, userProfile?.companyId, prospectId, isDeal]);

  const isValid = form.amount && form.type;

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const generateReceiptPDF = (depositData, buyerInfo) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('DEPOSIT RECEIPT', 105, 30, { align: 'center' });

    // Company info
    doc.setFontSize(12);
    doc.text('MobileCRM', 20, 50);
    doc.text('Deposit Receipt', 20, 60);

    // Receipt details
    doc.text(`Receipt #: ${depositData.receiptNumber}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 120, 90);

    // Customer info
    doc.text('Customer Information:', 20, 110);
    doc.text(`Name: ${buyerInfo?.firstName || ''} ${buyerInfo?.middleName || ''} ${buyerInfo?.lastName || ''}`.trim(), 30, 120);
    doc.text(`Phone: ${buyerInfo?.phone || 'N/A'}`, 30, 130);
    doc.text(`Email: ${buyerInfo?.email || 'N/A'}`, 30, 140);

    // Deposit details
    doc.text('Deposit Details:', 20, 160);
    doc.text(`Amount: $${depositData.amount.toLocaleString()}`, 30, 170);
    doc.text(`Payment Type: ${depositData.type}`, 30, 180);
    doc.text(`Status: Received`, 30, 190);

    // Footer
    doc.text('Thank you for your deposit!', 105, 220, { align: 'center' });
    doc.setFontSize(10);
    doc.text('This receipt was generated electronically and is valid without signature.', 105, 240, { align: 'center' });

    return doc;
  };

  const handleSave = async () => {
    if (!isValid || !prospectId || !userProfile?.companyId) return;

    setSaving(true);
    try {
      const receiptNumber = nextReceiptNumber.toString();
      const depositAmount = parseFloat(form.amount);

      // Use the buyerInfo passed from parent component

      const depositData = {
        amount: depositAmount,
        type: form.type,
        receiptNumber: receiptNumber,
        status: 'received',
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system'
      };

      // Generate PDF receipt
      const pdfDoc = generateReceiptPDF(depositData, buyerInfo);
      const pdfBlob = pdfDoc.output('blob');

      // Determine collection name based on isDeal
      const collectionName = isDeal ? 'deals' : 'prospects';

      // Upload PDF to Firebase Storage
      const pdfRef = ref(storage, `companies/${userProfile.companyId}/${collectionName}/${prospectId}/documents/receipt_${receiptNumber}.pdf`);
      await uploadBytes(pdfRef, pdfBlob);
      const pdfUrl = await getDownloadURL(pdfRef);

      // Add PDF URL to deposit data
      depositData.pdfUrl = pdfUrl;

      // Save deposit to Firestore
      await addDoc(collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'deposits'), depositData);

      // Save PDF to Customer Documents
      const documentData = {
        name: `Deposit Receipt - ${receiptNumber}`,
        category: 'customer-documents',
        url: pdfUrl,
        type: 'pdf',
        size: pdfBlob.size,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || userProfile?.firebaseUser?.email || 'system',
        description: `Deposit receipt for $${depositAmount.toLocaleString()} - ${form.type}`
      };

      await addDoc(collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'documents'), documentData);

      // Automatically convert prospect to deal after deposit is recorded
      try {
        if (onConvertToDeal) {
          await onConvertToDeal();
        }
      } catch (error) {
        console.error('Error triggering automatic conversion:', error);
      }

      // Reset form and close
      setForm({ amount: '', type: '' });
      onClose();
    } catch (error) {
      console.error('Error adding deposit:', error);
      alert('Error adding deposit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setForm({ amount: '', type: '', receiptNumber: '' });
      onClose();
    }
  };

  return (
    <BaseDrawer
      open={open}
      onClose={handleClose}
      title="Add Deposit"
      width={400}
      actions={
        <DrawerActions
          onCancel={handleClose}
          onSubmit={handleSave}
          submitDisabled={!isValid || saving}
          submitLabel={saving ? 'Adding...' : 'Add Deposit'}
        />
      }
    >
      <FormTextField
        label="Amount"
        type="number"
        value={form.amount}
        onChange={handleChange('amount')}
        required
        InputProps={{ startAdornment: '$' }}
        placeholder="0.00"
      />

      <FormSelect
        label="Deposit Type"
        value={form.type}
        onChange={handleChange('type')}
        required
        zIndexOffset={200}
        options={[
          { value: '', label: 'Select Payment Type' },
          { value: 'Cash', label: 'Cash' },
          { value: 'Credit Card', label: 'Credit Card' },
          { value: 'Debit Card', label: 'Debit Card' },
          { value: 'Wire', label: 'Wire' },
          { value: 'Personal Check', label: 'Personal Check' },
          { value: 'Cashier Check', label: 'Cashier Check' }
        ]}
      />

      <FormTextField
        label="Receipt Number"
        value={nextReceiptNumber.toString()}
        InputProps={{ readOnly: true }}
        helperText="Auto-generated"
      />
    </BaseDrawer>
  );
}

export default AddDepositDrawer;

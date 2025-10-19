import React, { useState, useEffect } from 'react';
import { FormTextField, FormSelect } from '../FormField';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where, doc, updateDoc } from 'firebase/firestore';
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

  // Generate next receipt number when drawer opens - LOCATION WIDE
  useEffect(() => {
    if (open && userProfile?.companyId && userProfile?.locationId) {
      const generateNextReceiptNumber = async () => {
        try {
          let highestReceiptNumber = 100000;

          // Query ALL prospects for this location
          const prospectsSnapshot = await getDocs(
            query(
              collection(db, 'companies', userProfile.companyId, 'prospects'),
              where('locationId', '==', userProfile.locationId)
            )
          );

          // Check deposits in all prospects
          for (const prospectDoc of prospectsSnapshot.docs) {
            const depositsSnapshot = await getDocs(
              collection(db, 'companies', userProfile.companyId, 'prospects', prospectDoc.id, 'deposits')
            );
            
            depositsSnapshot.forEach(depositDoc => {
              const receiptNum = parseInt(depositDoc.data().receiptNumber);
              if (receiptNum && receiptNum >= highestReceiptNumber) {
                highestReceiptNumber = receiptNum + 1;
              }
            });
          }

          // Query ALL deals for this location
          const dealsSnapshot = await getDocs(
            query(
              collection(db, 'companies', userProfile.companyId, 'deals'),
              where('locationId', '==', userProfile.locationId)
            )
          );

          // Check deposits in all deals
          for (const dealDoc of dealsSnapshot.docs) {
            const depositsSnapshot = await getDocs(
              collection(db, 'companies', userProfile.companyId, 'deals', dealDoc.id, 'deposits')
            );
            
            depositsSnapshot.forEach(depositDoc => {
              const receiptNum = parseInt(depositDoc.data().receiptNumber);
              if (receiptNum && receiptNum >= highestReceiptNumber) {
                highestReceiptNumber = receiptNum + 1;
              }
            });
          }

          setNextReceiptNumber(highestReceiptNumber);
        } catch (error) {
          console.error('Error generating receipt number:', error);
          setNextReceiptNumber(100000);
        }
      };

      generateNextReceiptNumber();
    }
  }, [open, userProfile?.companyId, userProfile?.locationId]);

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

      // Always use prospects collection (deals are just prospects with stage !== 'discovery')
      // Upload PDF to Firebase Storage
      const pdfRef = ref(storage, `companies/${userProfile.companyId}/prospects/${prospectId}/documents/receipt_${receiptNumber}.pdf`);
      await uploadBytes(pdfRef, pdfBlob);
      const pdfUrl = await getDownloadURL(pdfRef);

      // Add PDF URL to deposit data
      depositData.pdfUrl = pdfUrl;

      // Save deposit to Firestore
      await addDoc(collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'deposits'), depositData);

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

      await addDoc(collection(db, 'companies', userProfile.companyId, 'prospects', prospectId, 'documents'), documentData);

      // Update stage to pre-approval when taking a deposit
      try {
        const prospectRef = doc(db, 'companies', userProfile.companyId, 'prospects', prospectId);
        await updateDoc(prospectRef, {
          stage: 'pre-approval'
        });
      } catch (error) {
        console.error('Error updating stage:', error);
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

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

export const useCreditSnapshotData = (userProfile, prospectId, isDeal = false) => {
  const [creditData, setCreditData] = useState({
    applicantTransUnion: '',
    applicantEquifax: '',
    applicantExperian: '',
    coApplicantTransUnion: '',
    coApplicantEquifax: '',
    coApplicantExperian: '',
    // Buyer info fields
    buyer_ssn: '',
    buyer_dob: '',
    buyer_gender: '',
    buyer_race: '',
    buyer_licenseNumber: '',
    buyer_licenseState: '',
    buyer_address: '',
    buyer_city: '',
    buyer_state: '',
    buyer_zip: '',
    buyer_homePhone: '',
    buyer_workPhone: '',
    buyer_annualIncome: '',
    // Co-Buyer info fields
    coBuyer_ssn: '',
    coBuyer_dob: '',
    coBuyer_gender: '',
    coBuyer_race: '',
    coBuyer_licenseNumber: '',
    coBuyer_licenseState: '',
    coBuyer_address: '',
    coBuyer_city: '',
    coBuyer_state: '',
    coBuyer_zip: '',
    coBuyer_homePhone: '',
    coBuyer_workPhone: '',
    coBuyer_annualIncome: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCreditData = async () => {
      if (!userProfile?.companyId || !prospectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

              try {
                const collectionName = isDeal ? 'deals' : 'prospects';
                const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
                const snap = await getDoc(ref);

        if (snap.exists() && snap.data().creditSnapshot) {
          const creditSnapshot = snap.data().creditSnapshot;
          setCreditData({
            applicantTransUnion: creditSnapshot.applicantTransUnion || '',
            applicantEquifax: creditSnapshot.applicantEquifax || '',
            applicantExperian: creditSnapshot.applicantExperian || '',
            coApplicantTransUnion: creditSnapshot.coApplicantTransUnion || '',
            coApplicantEquifax: creditSnapshot.coApplicantEquifax || '',
            coApplicantExperian: creditSnapshot.coApplicantExperian || '',
            // Buyer info
            buyer_ssn: creditSnapshot.buyer_ssn || '',
            buyer_dob: creditSnapshot.buyer_dob || '',
            buyer_gender: creditSnapshot.buyer_gender || '',
            buyer_race: creditSnapshot.buyer_race || '',
            buyer_licenseNumber: creditSnapshot.buyer_licenseNumber || '',
            buyer_licenseState: creditSnapshot.buyer_licenseState || '',
            buyer_address: creditSnapshot.buyer_address || '',
            buyer_city: creditSnapshot.buyer_city || '',
            buyer_state: creditSnapshot.buyer_state || '',
            buyer_zip: creditSnapshot.buyer_zip || '',
            buyer_homePhone: creditSnapshot.buyer_homePhone || '',
            buyer_workPhone: creditSnapshot.buyer_workPhone || '',
            buyer_annualIncome: creditSnapshot.buyer_annualIncome || '',
            // Co-Buyer info
            coBuyer_ssn: creditSnapshot.coBuyer_ssn || '',
            coBuyer_dob: creditSnapshot.coBuyer_dob || '',
            coBuyer_gender: creditSnapshot.coBuyer_gender || '',
            coBuyer_race: creditSnapshot.coBuyer_race || '',
            coBuyer_licenseNumber: creditSnapshot.coBuyer_licenseNumber || '',
            coBuyer_licenseState: creditSnapshot.coBuyer_licenseState || '',
            coBuyer_address: creditSnapshot.coBuyer_address || '',
            coBuyer_city: creditSnapshot.coBuyer_city || '',
            coBuyer_state: creditSnapshot.coBuyer_state || '',
            coBuyer_zip: creditSnapshot.coBuyer_zip || '',
            coBuyer_homePhone: creditSnapshot.coBuyer_homePhone || '',
            coBuyer_workPhone: creditSnapshot.coBuyer_workPhone || '',
            coBuyer_annualIncome: creditSnapshot.coBuyer_annualIncome || ''
          });
        }
      } catch (err) {
        console.error('Error loading credit snapshot data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadCreditData();
  }, [userProfile, prospectId, isDeal]);

  const saveCreditData = async () => {
    if (!userProfile?.companyId || !prospectId) return;

    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
      await updateDoc(ref, {
        creditSnapshot: creditData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error saving credit snapshot data:', err);
      throw err;
    }
  };

  return {
    creditData,
    setCreditData,
    saveCreditData,
    loading,
    error
  };
};

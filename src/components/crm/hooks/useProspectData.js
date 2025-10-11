import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const useProspectData = (userProfile, prospectId, isDeal = false) => {
  const [prospect, setProspect] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });
  const [coBuyerInfo, setCoBuyerInfo] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProspectData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userProfile?.companyId || !prospectId) {
          setLoading(false);
          return;
        }

        const collectionName = isDeal ? 'deals' : 'prospects';
        const ref = doc(db, 'companies', userProfile.companyId, collectionName, prospectId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const prospectData = { id: snap.id, ...snap.data() };
          setProspect(prospectData);

          // Load buyer info - try prospect data first, then fallback to lead data
          if (prospectData.buyerInfo) {
            setBuyerInfo(prospectData.buyerInfo);
          } else if (prospectData.firstName || prospectData.lastName || prospectData.email || prospectData.phone) {
            // Pull from lead data if converting
            setBuyerInfo({
              firstName: prospectData.firstName || '',
              middleName: prospectData.middleName || '',
              lastName: prospectData.lastName || '',
              phone: prospectData.phone || '',
              email: prospectData.email || '',
              streetAddress: prospectData.address || '',
              city: prospectData.city || '',
              state: prospectData.state || '',
              zip: prospectData.zip || ''
            });
          }

          // Load co-buyer info
          if (prospectData.coBuyerInfo) {
            setCoBuyerInfo(prospectData.coBuyerInfo);
          }
        } else {
          setError('Prospect not found');
        }
      } catch (err) {
        console.error('Error loading prospect data:', err);
        setError('Failed to load prospect data');
      } finally {
        setLoading(false);
      }
    };

    loadProspectData();
  }, [userProfile, prospectId, isDeal]);

  return {
    prospect,
    buyerInfo,
    coBuyerInfo,
    loading,
    error,
    setBuyerInfo,
    setCoBuyerInfo
  };
};

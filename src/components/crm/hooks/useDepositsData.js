import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';

export const useDepositsData = (userProfile, prospectId, isDeal = false) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.companyId || !prospectId) {
      setLoading(false);
      return;
    }

    const collectionName = isDeal ? 'deals' : 'prospects';
    const col = collection(db, 'companies', userProfile.companyId, collectionName, prospectId, 'deposits');
    const q = query(col, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDeposits(data);
      setLoading(false);
    }, (error) => {
      console.error('Error loading deposits:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId, prospectId, isDeal]);

  return {
    deposits,
    loading,
    setDeposits
  };
};

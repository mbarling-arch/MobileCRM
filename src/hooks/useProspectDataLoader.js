import { useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Centralized data loading manager for prospect-related data
 * Manages all Firestore subscriptions in one place
 */
export const useProspectDataLoader = ({ 
  prospectId, 
  companyId, 
  isDeal = false,
  onProspectUpdate,
  onNotesUpdate,
  onDocumentsUpdate,
  onCallsUpdate,
  onEmailsUpdate,
  onAppointmentsUpdate,
  onVisitsUpdate,
  onTasksUpdate,
  onDepositsUpdate
}) => {
  // Load main prospect document
  useEffect(() => {
    if (!prospectId || !companyId) return;

    const prospectRef = doc(db, 'companies', companyId, 'prospects', prospectId);
    const unsubscribe = onSnapshot(prospectRef, (docSnap) => {
      if (docSnap.exists() && onProspectUpdate) {
        onProspectUpdate({ id: docSnap.id, ...docSnap.data() });
      }
    });

    return () => unsubscribe();
  }, [prospectId, companyId, onProspectUpdate]);

  // Load notes
  useEffect(() => {
    if (!prospectId || !companyId || !onNotesUpdate) return;

    const notesRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'notes');
    const notesQuery = query(notesRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onNotesUpdate(notes);
    });

    return () => unsubscribe();
  }, [prospectId, companyId, onNotesUpdate]);

  // Load documents
  useEffect(() => {
    if (!prospectId || !companyId || !onDocumentsUpdate) return;

    const collectionName = isDeal ? 'deals' : 'prospects';
    const docsRef = collection(db, 'companies', companyId, collectionName, prospectId, 'documents');
    const docsQuery = query(docsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onDocumentsUpdate(docs);
    });

    return () => unsubscribe();
  }, [prospectId, companyId, isDeal, onDocumentsUpdate]);

  // Load activities (calls, emails, appointments, visits)
  useEffect(() => {
    if (!prospectId || !companyId) return;

    const base = ['companies', companyId, 'prospects', prospectId];
    const unsubs = [];

    const safeAttach = (pathArr, setter) => {
      if (!setter) return;
      try {
        const col = collection(db, ...pathArr);
        const q = query(col, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => 
          setter(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        unsubs.push(unsub);
      } catch {
        // Ignore if collection doesn't exist
      }
    };

    safeAttach([...base, 'callLogs'], onCallsUpdate);
    safeAttach([...base, 'appointments'], onAppointmentsUpdate);
    safeAttach([...base, 'visits'], onVisitsUpdate);
    safeAttach([...base, 'emails'], onEmailsUpdate);

    return () => unsubs.forEach(u => u());
  }, [prospectId, companyId, onCallsUpdate, onEmailsUpdate, onAppointmentsUpdate, onVisitsUpdate]);

  // Load tasks
  useEffect(() => {
    if (!prospectId || !companyId || !onTasksUpdate) return;

    const tasksRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'tasks');
    const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onTasksUpdate(tasks);
    });

    return () => unsubscribe();
  }, [prospectId, companyId, onTasksUpdate]);

  // Load deposits
  useEffect(() => {
    if (!prospectId || !companyId || !onDepositsUpdate) return;

    const depositsRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'deposits');
    const depositsQuery = query(depositsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(depositsQuery, (snapshot) => {
      const deposits = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onDepositsUpdate(deposits);
    });

    return () => unsubscribe();
  }, [prospectId, companyId, onDepositsUpdate]);

  // Return cleanup function
  return {
    loaded: true
  };
};


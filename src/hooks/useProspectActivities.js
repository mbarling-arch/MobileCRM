import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook for managing prospect activities (calls, emails, appointments, visits)
 * @param {object} params - Hook parameters
 * @param {string} params.prospectId - Prospect ID
 * @param {string} params.companyId - Company ID
 * @returns {object} Activities state and timeline
 */
export const useProspectActivities = ({ prospectId, companyId }) => {
  // State for individual activity types
  const [calls, setCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [emails, setEmails] = useState([]);

  // Load activities
  useEffect(() => {
    if (!companyId || !prospectId) return;
    
    const base = ['companies', companyId, 'prospects', prospectId];
    const unsubs = [];
    
    /**
     * Safely attach a listener to a subcollection
     * Handles missing collections gracefully
     */
    const safeAttach = (pathArr, setter) => {
      try {
        const col = collection(db, ...pathArr);
        const q = query(col, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => 
          setter(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        unsubs.push(unsub);
      } catch {
        // Ignore if collection doesn't exist yet
      }
    };
    
    // Attach listeners for each activity type
    safeAttach([...base, 'callLogs'], setCalls);
    safeAttach([...base, 'appointments'], setAppointments);
    safeAttach([...base, 'visits'], setVisits);
    safeAttach([...base, 'emails'], setEmails);
    
    // Cleanup all listeners
    return () => unsubs.forEach(u => u());
  }, [companyId, prospectId]);

  /**
   * Combined timeline of all activities, sorted by date
   */
  const activities = useMemo(() => {
    return [
      ...calls.map(d => ({ 
        id: `call-${d.id}`, 
        type: 'call', 
        title: 'Call Logged', 
        subtitle: d.notes || 'No notes', 
        createdAt: d.createdAt, 
        createdBy: d.createdBy 
      })),
      ...emails.map(d => ({ 
        id: `email-${d.id}`, 
        type: 'email', 
        title: 'Email Sent', 
        subtitle: d.subject || 'No subject', 
        createdAt: d.createdAt, 
        createdBy: d.createdBy 
      })),
      ...appointments.map(d => ({ 
        id: `appt-${d.id}`, 
        type: 'appointment', 
        title: d.title || 'Appointment', 
        subtitle: d.notes || '', 
        createdAt: d.createdAt, 
        createdBy: d.createdBy 
      })),
      ...visits.map(d => ({ 
        id: `visit-${d.id}`, 
        type: 'visit', 
        title: 'Visit Logged', 
        subtitle: d.notes || 'No notes', 
        createdAt: d.createdAt, 
        createdBy: d.createdBy 
      })),
    ].sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [calls, emails, appointments, visits]);

  /**
   * Get activity counts by type
   */
  const activityCounts = useMemo(() => ({
    calls: calls.length,
    emails: emails.length,
    appointments: appointments.length,
    visits: visits.length,
    total: calls.length + emails.length + appointments.length + visits.length
  }), [calls, emails, appointments, visits]);

  return {
    // Individual activity types
    calls,
    emails,
    appointments,
    visits,
    
    // Combined timeline
    activities,
    
    // Counts
    activityCounts
  };
};


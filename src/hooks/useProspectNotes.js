import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook for managing prospect notes with @mention functionality
 * @param {object} params - Hook parameters
 * @param {string} params.prospectId - Prospect ID
 * @param {string} params.companyId - Company ID
 * @param {object} params.userProfile - Current user profile
 * @param {object} params.buyerInfo - Buyer information for notifications
 * @returns {object} Notes state and handlers
 */
export const useProspectNotes = ({ prospectId, companyId, userProfile, buyerInfo }) => {
  // State
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const noteInputRef = useRef(null);

  // Load users for @mentions
  useEffect(() => {
    if (!companyId) return;

    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName || doc.data().name || doc.data().email,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || ''
      }));
      setUsers(usersData);
    });

    return () => unsub();
  }, [companyId]);

  // Load prospect-specific notes
  useEffect(() => {
    if (!companyId || !prospectId) return;

    const notesRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'notes');
    const notesQuery = query(notesRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(notesQuery, (snap) => {
      const notesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotes(notesData);
    });

    return () => unsub();
  }, [companyId, prospectId]);

  // Detect @mentions in note text
  useEffect(() => {
    const lastAtIndex = noteText.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1 && lastAtIndex < cursorPosition) {
      const searchText = noteText.substring(lastAtIndex + 1, cursorPosition);
      if (!searchText.includes(' ')) {
        setMentionSearch(searchText.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  }, [noteText, cursorPosition]);

  /**
   * Extract @mentions from text
   * @param {string} text - Text to extract mentions from
   * @returns {Array} Array of mentioned users with email and name
   */
  const extractMentions = (text) => {
    const mentionRegex = /@([A-Za-z]+)\s+([A-Za-z]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const firstName = match[1];
      const lastName = match[2];
      const user = users.find(u => 
        u.firstName.toLowerCase() === firstName.toLowerCase() && 
        u.lastName.toLowerCase() === lastName.toLowerCase()
      );
      if (user) {
        mentions.push({ email: user.email, name: `${user.firstName} ${user.lastName}` });
      }
    }
    return mentions;
  };

  /**
   * Insert a mention at the current cursor position
   * @param {object} user - User to mention
   */
  const insertMention = (user) => {
    const lastAtIndex = noteText.lastIndexOf('@', cursorPosition);
    const before = noteText.substring(0, lastAtIndex);
    const after = noteText.substring(cursorPosition);
    const mentionText = `@${user.firstName} ${user.lastName}`;
    setNoteText(before + mentionText + ' ' + after);
    setShowMentions(false);
    noteInputRef.current?.focus();
  };

  /**
   * Get user display name from email
   * @param {string} email - User email
   * @returns {string} Display name
   */
  const getUserDisplayName = (email) => {
    if (!email) return '-';
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.displayName || email;
    }
    return email;
  };

  /**
   * Filter users based on mention search
   * @returns {Array} Filtered users matching search
   */
  const getFilteredUsers = () => {
    return users.filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      return name.includes(mentionSearch) || email.includes(mentionSearch);
    });
  };

  /**
   * Send a note with mentions and create notifications
   */
  const handleSendNote = async () => {
    if (!noteText.trim() || !companyId || !prospectId) return;

    const mentions = extractMentions(noteText);
    
    try {
      // Save note
      const notesRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'notes');
      await addDoc(notesRef, {
        text: noteText,
        author: userProfile.email || userProfile.firebaseUser?.email,
        authorName: userProfile.displayName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email,
        mentions: mentions.map(m => m.email),
        createdAt: serverTimestamp(),
        prospectId
      });

      // Create notifications for mentioned users
      if (mentions.length > 0) {
        const notificationsRef = collection(db, 'notifications');
        const prospectName = `${buyerInfo?.firstName || ''} ${buyerInfo?.lastName || ''}`.trim() || 'prospect';
        for (const mention of mentions) {
          await addDoc(notificationsRef, {
            recipientEmail: mention.email,
            message: `${userProfile.displayName || userProfile.email} mentioned you in a note on ${prospectName}`,
            type: 'mention',
            read: false,
            prospectId,
            createdAt: serverTimestamp(),
            noteText: noteText
          });
        }
      }

      // Clear note text
      setNoteText('');
    } catch (error) {
      console.error('Error sending note:', error);
      throw error;
    }
  };

  /**
   * Handle Enter key press in note input
   * @param {Event} e - Keyboard event
   */
  const handleNoteKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  };

  return {
    // State
    notes,
    users,
    noteText,
    cursorPosition,
    showMentions,
    mentionSearch,
    noteInputRef,
    
    // Setters
    setNoteText,
    setCursorPosition,
    setShowMentions,
    
    // Computed
    filteredUsers: getFilteredUsers(),
    
    // Handlers
    handleSendNote,
    handleNoteKeyPress,
    insertMention,
    getUserDisplayName,
    extractMentions
  };
};


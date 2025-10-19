import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook for managing prospect tasks
 * @param {object} params - Hook parameters
 * @param {string} params.prospectId - Prospect ID
 * @param {string} params.companyId - Company ID
 * @returns {object} Tasks state and computed values
 */
export const useProspectTasks = ({ prospectId, companyId }) => {
  // State
  const [tasks, setTasks] = useState([]);

  // Load tasks
  useEffect(() => {
    if (!companyId || !prospectId) return;

    const tasksRef = collection(db, 'companies', companyId, 'prospects', prospectId, 'tasks');
    const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const tasksData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(tasksData);
    });

    return () => unsubTasks();
  }, [companyId, prospectId]);

  /**
   * Filter tasks by completion status
   */
  const completedTasks = useMemo(() => 
    tasks.filter(task => task.completed === true), 
    [tasks]
  );

  const pendingTasks = useMemo(() => 
    tasks.filter(task => !task.completed), 
    [tasks]
  );

  /**
   * Get task counts
   */
  const taskCounts = useMemo(() => ({
    total: tasks.length,
    completed: completedTasks.length,
    pending: pendingTasks.length
  }), [tasks, completedTasks, pendingTasks]);

  /**
   * Get overdue tasks (if tasks have due dates)
   */
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < now
    );
  }, [tasks]);

  return {
    // State
    tasks,
    
    // Filtered lists
    completedTasks,
    pendingTasks,
    overdueTasks,
    
    // Counts
    taskCounts
  };
};


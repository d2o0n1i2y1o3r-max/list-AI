import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from './AuthContext';

const ListsContext = createContext(null);

function getTaskStatus(startTime, endTime, done) {
  if (done) return 'done';
  const now = new Date();
  const today = now.toDateString();
  const start = new Date(`${today} ${startTime}`);
  const end = endTime ? new Date(`${today} ${endTime}`) : null;
  if (now < start) return 'pending';
  if (!end || now <= end) return 'active';
  return 'missed';
}

export function ListsProvider({ children }) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});   // { listId: [...tasks] }
  const [loading, setLoading] = useState(false);

  // Load from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const listsRef = collection(db, 'users', user.uid, 'lists');
    const q = query(listsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snap) => {
      const fetchedLists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLists(fetchedLists);

      // For each list, subscribe to its tasks
      const taskMap = {};
      for (const list of fetchedLists) {
        const tasksRef = collection(db, 'users', user.uid, 'lists', list.id, 'tasks');
        const tSnap = await getDocs(query(tasksRef, orderBy('startTime', 'asc')));
        taskMap[list.id] = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setTasks(taskMap);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // ---- LIST CRUD ----
  const createList = useCallback(async (name, emoji = '📋') => {
    const listData = { name, emoji, createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, 'users', user.uid, 'lists'), {
      ...listData, createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...listData };
  }, [user]);

  const updateList = useCallback(async (listId, updates) => {
    await updateDoc(doc(db, 'users', user.uid, 'lists', listId), updates);
  }, [user]);

  const deleteList = useCallback(async (listId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'lists', listId));
  }, [user]);

  // ---- TASK CRUD ----
  const createTask = useCallback(async (listId, taskData) => {
    const task = {
      ...taskData,
      done: false,
      alarmSet: false,
      createdAt: new Date().toISOString(),
    };

    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore write timeout')), 10000)
    );

    const ref = await Promise.race([
      addDoc(
        collection(db, 'users', user.uid, 'lists', listId, 'tasks'),
        { ...task, createdAt: serverTimestamp() }
      ),
      timeoutPromise
    ]);

    return { id: ref.id, ...task };
  }, [user]);

  const updateTask = useCallback(async (listId, taskId, updates) => {
    await updateDoc(
      doc(db, 'users', user.uid, 'lists', listId, 'tasks', taskId),
      updates
    );
  }, [user]);

  const deleteTask = useCallback(async (listId, taskId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'lists', listId, 'tasks', taskId));
  }, [user]);

  const toggleTaskDone = useCallback(async (listId, taskId) => {
    const listTasks = tasks[listId] || [];
    const task = listTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(listId, taskId, { done: !task.done });
    }
  }, [tasks, updateTask]);

  // Initialize lists from onboarding
  const initializeLists = useCallback(async (listNames) => {
    const emojis = ['📋', '💼', '🏃', '🎯', '📚', '🌱', '✈️', '💡'];
    const created = [];
    for (let i = 0; i < listNames.length; i++) {
      const list = await createList(listNames[i] || `List ${i + 1}`, emojis[i % emojis.length]);
      created.push(list);
    }
    return created;
  }, [createList]);

  // Compute task statuses
  const getTasksForList = useCallback((listId) => {
    return (tasks[listId] || []).map(task => ({
      ...task,
      status: getTaskStatus(task.startTime, task.endTime, task.done),
    }));
  }, [tasks]);

  return (
    <ListsContext.Provider value={{
      lists,
      tasks,
      loading,
      createList,
      updateList,
      deleteList,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskDone,
      initializeLists,
      getTasksForList,
    }}>
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const context = useContext(ListsContext);
  if (!context) throw new Error('useLists must be used within ListsProvider');
  return context;
}

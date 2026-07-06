import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from './AuthContext';

const ListsContext = createContext(null);

// Generate a local ID for demo mode
let localIdCounter = 1;
const genId = () => `local-${Date.now()}-${localIdCounter++}`;

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

  // ---- Demo mode in-memory data ----
  const [demoLists, setDemoLists] = useState([]);
  const [demoTasks, setDemoTasks] = useState({});

  const isDemo = !isFirebaseConfigured || user?.isDemo;

  // Load from Firestore
  useEffect(() => {
    if (!user || isDemo) {
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
  }, [user, isDemo]);

  // ---- LIST CRUD ----
  const createList = useCallback(async (name, emoji = '📋') => {
    const listData = { name, emoji, createdAt: new Date().toISOString() };
    if (isDemo) {
      const id = genId();
      const newList = { id, ...listData };
      setDemoLists(prev => [...prev, newList]);
      setDemoTasks(prev => ({ ...prev, [id]: [] }));
      return newList;
    }
    const ref = await addDoc(collection(db, 'users', user.uid, 'lists'), {
      ...listData, createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...listData };
  }, [isDemo, user]);

  const updateList = useCallback(async (listId, updates) => {
    if (isDemo) {
      setDemoLists(prev => prev.map(l => l.id === listId ? { ...l, ...updates } : l));
      return;
    }
    await updateDoc(doc(db, 'users', user.uid, 'lists', listId), updates);
  }, [isDemo, user]);

  const deleteList = useCallback(async (listId) => {
    if (isDemo) {
      setDemoLists(prev => prev.filter(l => l.id !== listId));
      setDemoTasks(prev => { const n = { ...prev }; delete n[listId]; return n; });
      return;
    }
    await deleteDoc(doc(db, 'users', user.uid, 'lists', listId));
  }, [isDemo, user]);

  // ---- TASK CRUD ----
  const createTask = useCallback(async (listId, taskData) => {
    const task = {
      ...taskData,
      done: false,
      alarmSet: false,
      createdAt: new Date().toISOString(),
    };
    if (isDemo) {
      const id = genId();
      const newTask = { id, ...task };
      setDemoTasks(prev => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newTask].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }));
      return newTask;
    }
    const ref = await addDoc(
      collection(db, 'users', user.uid, 'lists', listId, 'tasks'),
      { ...task, createdAt: serverTimestamp() }
    );
    return { id: ref.id, ...task };
  }, [isDemo, user]);

  const updateTask = useCallback(async (listId, taskId, updates) => {
    if (isDemo) {
      setDemoTasks(prev => ({
        ...prev,
        [listId]: (prev[listId] || []).map(t => t.id === taskId ? { ...t, ...updates } : t),
      }));
      return;
    }
    await updateDoc(
      doc(db, 'users', user.uid, 'lists', listId, 'tasks', taskId),
      updates
    );
  }, [isDemo, user]);

  const deleteTask = useCallback(async (listId, taskId) => {
    if (isDemo) {
      setDemoTasks(prev => ({
        ...prev,
        [listId]: (prev[listId] || []).filter(t => t.id !== taskId),
      }));
      return;
    }
    await deleteDoc(doc(db, 'users', user.uid, 'lists', listId, 'tasks', taskId));
  }, [isDemo, user]);

  const toggleTaskDone = useCallback(async (listId, taskId) => {
    const listTasks = (isDemo ? demoTasks : tasks)[listId] || [];
    const task = listTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(listId, taskId, { done: !task.done });
    }
  }, [isDemo, demoTasks, tasks, updateTask]);

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

  const activeLists = isDemo ? demoLists : lists;
  const activeTasks = isDemo ? demoTasks : tasks;

  // Compute task statuses
  const getTasksForList = useCallback((listId) => {
    return (activeTasks[listId] || []).map(task => ({
      ...task,
      status: getTaskStatus(task.startTime, task.endTime, task.done),
    }));
  }, [activeTasks]);

  return (
    <ListsContext.Provider value={{
      lists: activeLists,
      tasks: activeTasks,
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

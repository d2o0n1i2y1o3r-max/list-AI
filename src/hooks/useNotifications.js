import { useState, useCallback, useRef } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const scheduledAlarms = useRef(new Map()); // taskId -> timeoutId

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const scheduleAlarm = useCallback(async (taskId, startTime, title, body) => {
    const perm = await requestPermission();
    if (perm !== 'granted') return false;

    // Cancel existing alarm for this task if any
    if (scheduledAlarms.current.has(taskId)) {
      clearTimeout(scheduledAlarms.current.get(taskId));
    }

    const now = new Date();
    const today = now.toDateString();
    const alarmTime = new Date(`${today} ${startTime}`);
    const msUntilAlarm = alarmTime.getTime() - now.getTime();

    if (msUntilAlarm <= 0) {
      // Already past — fire immediately
      new Notification(`⏰ ${title}`, {
        body: body || "It's time to start this task.",
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      return true;
    }

    const timeoutId = setTimeout(() => {
      new Notification(`⏰ ${title}`, {
        body: body || "It's time to start this task.",
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      scheduledAlarms.current.delete(taskId);
    }, msUntilAlarm);

    scheduledAlarms.current.set(taskId, timeoutId);
    return true;
  }, [requestPermission]);

  const cancelAlarm = useCallback((taskId) => {
    if (scheduledAlarms.current.has(taskId)) {
      clearTimeout(scheduledAlarms.current.get(taskId));
      scheduledAlarms.current.delete(taskId);
    }
  }, []);

  const hasAlarm = useCallback((taskId) => {
    return scheduledAlarms.current.has(taskId);
  }, []);

  return { permission, requestPermission, scheduleAlarm, cancelAlarm, hasAlarm };
}

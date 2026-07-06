import { useState, useEffect, useCallback, useRef } from 'react';

const PING_URL = 'https://www.gstatic.com/generate_204';
const PING_INTERVAL = 15000; // 15 seconds

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);
  const pingTimer = useRef(null);

  const pingCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(PING_URL, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      pingCheck(); // Verify it's actually online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    pingCheck();

    // Periodic ping when apparently online
    pingTimer.current = setInterval(() => {
      if (navigator.onLine) pingCheck();
    }, PING_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingTimer.current);
    };
  }, [pingCheck]);

  return { isOnline, isChecking, retry: pingCheck };
}

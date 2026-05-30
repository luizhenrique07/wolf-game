import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  durationMs: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  remainingMs: number;
  progress: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer({ durationMs, onExpire, autoStart = false }: UseTimerOptions): UseTimerReturn {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const remainingAtPauseRef = useRef(durationMs);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = Date.now();
    expiredRef.current = false;

    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const remaining = Math.max(0, remainingAtPauseRef.current - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setIsRunning(false);
        onExpireRef.current?.();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    remainingAtPauseRef.current = remainingMs;
    setIsRunning(false);
  }, [remainingMs]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemainingMs(durationMs);
    remainingAtPauseRef.current = durationMs;
    expiredRef.current = false;
  }, [durationMs]);

  return {
    remainingMs,
    progress: remainingMs / durationMs,
    isRunning,
    start,
    pause,
    reset,
  };
}

import { useEffect, useState } from 'react';

/** 每秒更新的时钟（菜单栏只显示分，不显示秒，避免跳动干扰） */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

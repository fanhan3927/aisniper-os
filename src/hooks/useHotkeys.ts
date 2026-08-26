/**
 * useHotkeys — 全局快捷键
 * ⌘/Ctrl+W 关闭前台窗口；Esc 关闭弹窗（弹窗自身处理）/ 暂停游戏（游戏处理）。
 */
import { useEffect } from 'react';
import { useOsStore } from '../store/osStore';

export function useHotkeys(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘/Ctrl+W：关闭前台窗口
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
        const os = useOsStore.getState();
        if (os.focusedId) {
          e.preventDefault();
          os.closeApp(os.focusedId);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

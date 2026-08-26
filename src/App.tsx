/**
 * App — AISniper OS 根组件
 * 主题应用 / 系统明暗监听 / 开机动画 / 桌面舞台 / Toast
 */
import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useThemeStore, watchSystemTheme } from './store/themeStore';
import { Desktop } from './components/os/Desktop';
import { ToastHost } from './components/os/Toast';
import { BootSplash, BOOT_KEY } from './components/os/BootSplash';
import { useHotkeys } from './hooks/useHotkeys';

export default function App() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const resolve = useThemeStore((s) => s.resolve);
  useHotkeys();
  const [splash, setSplash] = useState(() => {
    try {
      return localStorage.getItem(BOOT_KEY) !== '1';
    } catch {
      return true;
    }
  });

  // 挂载时应用主题 + 监听系统明暗（auto 模式）
  useEffect(() => {
    resolve();
    return watchSystemTheme();
  }, [resolve]);

  // 主题状态变化时重写 DOM 变量
  useEffect(() => {
    resolve();
  }, [resolvedTheme, resolve]);

  const finishBoot = useCallback(() => {
    try {
      localStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* 隐私模式忽略 */
    }
    setSplash(false);
  }, []);

  return (
    <div className="h-full w-full">
      <AnimatePresence>{splash && <BootSplash onDone={finishBoot} />}</AnimatePresence>
      <Desktop />
      <ToastHost />
    </div>
  );
}

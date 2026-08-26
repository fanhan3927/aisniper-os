/**
 * WindowManager — 渲染所有非最小化窗口，按 z 排序
 */
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOsStore } from '../../store/osStore';
import { Window } from './Window';
import { AppRenderer } from './AppRenderer';

export const WindowManager: React.FC = () => {
  const windows = useOsStore((s) => s.windows);
  const focusedId = useOsStore((s) => s.focusedId);
  const toggleMaximize = useOsStore((s) => s.toggleMaximize);
  const toggleGameFullscreen = useOsStore((s) => s.toggleGameFullscreen);

  const visible = windows.filter((w) => !w.minimized).sort((a, b) => a.z - b.z);

  return (
    <div className="pointer-events-none absolute inset-0 z-[100]">
      <AnimatePresence>
        {visible.map((win) => (
          <Window
            key={win.id}
            win={win}
            focused={focusedId === win.id}
            // 游戏窗口：绿键 = 全屏切换；其余 = 普通最大化
            onMaximize={win.appId === 'game' ? () => toggleGameFullscreen() : (w) => toggleMaximize(w.id)}
          >
            <AppRenderer appId={win.appId} />
          </Window>
        ))}
      </AnimatePresence>
    </div>
  );
};

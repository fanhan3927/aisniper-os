/**
 * DesktopIcons — 桌面图标（Finder / 太空射击），双击打开
 */
import React, { useState } from 'react';
import type { AppId } from '../../types/os';
import { useOsStore } from '../../store/osStore';
import { SquircleIcon } from '../ui/SquircleIcon';
import { MENU_BAR_H } from '../../lib/layout';

const ICONS: { appId: AppId; label: string }[] = [
  { appId: 'finder', label: 'Finder' },
  { appId: 'game', label: '太空射击' },
];

export const DesktopIcons: React.FC = () => {
  const openApp = useOsStore((s) => s.openApp);
  const [selected, setSelected] = useState<AppId | null>(null);

  return (
    <div className="absolute left-3 z-[60]" style={{ top: MENU_BAR_H + 18 }}>
      <div className="flex flex-col gap-4">
        {ICONS.map((it) => (
          <button
            key={it.appId}
            className="flex w-[76px] flex-col items-center gap-1 rounded-xl px-1 py-1.5"
            style={{ background: selected === it.appId ? 'var(--accent-soft)' : 'transparent' }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelected(it.appId);
            }}
            onDoubleClick={() => openApp(it.appId)}
            aria-label={`打开 ${it.label}`}
          >
            <SquircleIcon appId={it.appId} size={48} />
            <span
              className="max-w-full truncate rounded px-1 text-[11px] font-medium"
              style={{ color: 'var(--text-primary)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
            >
              {it.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

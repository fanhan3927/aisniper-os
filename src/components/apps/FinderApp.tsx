/**
 * FinderApp — 文件浏览器
 * 侧边栏分区 / 图标与列表视图 / 前进后退 / 搜索过滤
 * 新建文件夹、重命名、移入废纸篓（内存）；Quick Look 预览；双击 App 打开。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import type { FsNode } from '../../types/fs';
import { useFsStore } from '../../store/fsStore';
import { useOsStore } from '../../store/osStore';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { GlassPanel } from '../ui/GlassPanel';
import {
  BackIcon,
  ForwardIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  TrashIcon,
  FolderIcon,
  FileTextIcon,
  ImageIcon,
  LogIcon,
  AppFileIcon,
  BinIcon,
  DriveIcon,
  CloseIcon,
} from '../ui/icons';

type ViewMode = 'grid' | 'list';

function formatSize(n: FsNode): string {
  if (n.type === 'folder') return '—';
  const s = n.size ?? 0;
  if (s >= 1e9) return `${(s / 1e9).toFixed(1)} GB`;
  if (s >= 1e6) return `${(s / 1e6).toFixed(1)} MB`;
  if (s >= 1e3) return `${(s / 1e3).toFixed(0)} KB`;
  return `${s} B`;
}

function nodeIcon(n: FsNode): React.ReactNode {
  if (n.type === 'folder') {
    if (n.id === 'trash') return <BinIcon size={40} className="opacity-90" />;
    return <FolderIcon size={40} className="opacity-90" />;
  }
  switch (n.kind) {
    case 'image':
      return <ImageIcon size={40} className="opacity-90" />;
    case 'log':
      return <LogIcon size={40} className="opacity-90" />;
    case 'app':
      return <AppFileIcon size={40} className="opacity-90" />;
    default:
      return <FileTextIcon size={40} className="opacity-90" />;
  }
}

/** 侧边栏入口 */
const SIDEBAR_SECTIONS: { title: string; items: { id: string; label: string; icon: React.ReactNode }[] }[] = [
  {
    title: '个人',
    items: [{ id: 'personal', label: '个人', icon: <DriveIcon size={15} /> }],
  },
  {
    title: '位置',
    items: [
      { id: 'desktop', label: '桌面', icon: <FolderIcon size={15} /> },
      { id: 'documents', label: '文稿', icon: <FolderIcon size={15} /> },
      { id: 'downloads', label: '下载', icon: <FolderIcon size={15} /> },
      { id: 'applications', label: '应用', icon: <AppFileIcon size={15} /> },
    ],
  },
  {
    title: '档案',
    items: [{ id: 'space-archive', label: '太空档案', icon: <FolderIcon size={15} /> }],
  },
];

export const FinderApp: React.FC = () => {
  const children = useFsStore((s) => s.children);
  const node = useFsStore((s) => s.node);
  const createFolder = useFsStore((s) => s.createFolder);
  const rename = useFsStore((s) => s.rename);
  const trash = useFsStore((s) => s.trash);
  const restore = useFsStore((s) => s.restore);
  const emptyTrash = useFsStore((s) => s.emptyTrash);
  const trashId = useFsStore((s) => s.trashId);
  const openApp = useOsStore((s) => s.openApp);
  const setWindowTitle = useOsStore((s) => s.setWindowTitle);
  const pushToast = useOsStore((s) => s.pushToast);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  const [currentId, setCurrentId] = useState('personal');
  const [history, setHistory] = useState<string[]>(['personal']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [quickLookId, setQuickLookId] = useState<string | null>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const current = node(currentId);
  const items = useMemo(() => {
    if (searchQuery.trim()) {
      return children(currentId).filter((n) => n.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    }
    return children(currentId);
  }, [children, currentId, searchQuery]);

  // 窗口标题 = 当前文件夹名
  useEffect(() => {
    if (current) setWindowTitle('finder', current.name);
  }, [current, setWindowTitle]);

  // 进入重命名时聚焦
  useEffect(() => {
    if (renamingId) renameRef.current?.select();
  }, [renamingId]);

  const navigate = (id: string) => {
    setHistory((h) => [...h.slice(0, historyIndex + 1), id]);
    setHistoryIndex(historyIndex + 1);
    setCurrentId(id);
    setSelectedId(null);
    setSearchQuery('');
  };

  const goBack = () => {
    if (historyIndex <= 0) return;
    setHistoryIndex(historyIndex - 1);
    setCurrentId(history[historyIndex - 1]);
    setSelectedId(null);
  };
  const goForward = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    setCurrentId(history[historyIndex + 1]);
    setSelectedId(null);
  };

  const handleOpen = (n: FsNode) => {
    if (n.type === 'folder') {
      navigate(n.id);
      return;
    }
    if (n.type === 'app') {
      if (n.name.includes('太空射击')) {
        openApp('game');
        pushToast({ title: '正在启动 AISniper 太空射击…', kind: 'info' });
      } else if (n.name.includes('计算器')) {
        openApp('calculator');
      }
      return;
    }
    // 文件 → Quick Look
    setQuickLookId(n.id);
  };

  const startRename = (n: FsNode) => {
    if (n.system) return;
    setSelectedId(n.id);
    setRenamingId(n.id);
    setDraft(n.name);
  };

  const commitRename = () => {
    if (renamingId) {
      const t = draft.trim();
      if (t) rename(renamingId, t);
    }
    setRenamingId(null);
  };

  const handleTrash = () => {
    if (!selectedId) return;
    const n = node(selectedId);
    if (!n || n.system) return;
    trash(selectedId);
    setSelectedId(null);
    pushToast({ title: `已将「${n.name}」移入废纸篓`, kind: 'info' });
  };

  const quickLookNode = quickLookId ? node(quickLookId) : null;
  const isTrashView = currentId === trashId;

  return (
    <div className="flex h-full w-full flex-col" style={{ background: 'var(--window-content-bg)' }}>
      {/* 工具栏 */}
      <div className="flex shrink-0 items-center gap-1.5 px-3 py-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <button className="pressable rounded-md p-1.5" onClick={goBack} disabled={historyIndex <= 0} aria-label="后退" style={{ opacity: historyIndex <= 0 ? 0.35 : 1 }}>
          <BackIcon size={16} />
        </button>
        <button className="pressable rounded-md p-1.5" onClick={goForward} disabled={historyIndex >= history.length - 1} aria-label="前进" style={{ opacity: historyIndex >= history.length - 1 ? 0.35 : 1 }}>
          <ForwardIcon size={16} />
        </button>

        <div className="mx-2 flex min-w-0 items-center gap-1.5 text-[12px]">
          <span className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
            {current?.name ?? '—'}
          </span>
          <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {items.length} 项
          </span>
        </div>

        <div className="flex-1" />

        {/* 搜索 */}
        <div className="relative flex items-center">
          <SearchIcon size={14} className="pointer-events-none absolute left-2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="w-[150px] rounded-lg py-1 pl-7 pr-2 text-[12px] transition-all focus:w-[190px]"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* 视图切换 */}
        <div className="flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--glass-border)' }}>
          <button
            className="pressable px-1.5 py-1"
            onClick={() => setViewMode('grid')}
            aria-label="图标视图"
            style={{ background: viewMode === 'grid' ? 'var(--accent-soft)' : 'transparent' }}
          >
            <GridIcon size={15} />
          </button>
          <button
            className="pressable px-1.5 py-1"
            onClick={() => setViewMode('list')}
            aria-label="列表视图"
            style={{ background: viewMode === 'list' ? 'var(--accent-soft)' : 'transparent' }}
          >
            <ListIcon size={15} />
          </button>
        </div>

        {/* 新建文件夹 */}
        <button
          className="pressable rounded-md px-2 py-1 text-[11.5px] font-medium"
          style={{ background: 'var(--glass-bg-strong)', color: 'var(--text-primary)' }}
          onClick={() => {
            const id = createFolder(currentId);
            setSelectedId(id);
            setRenamingId(id);
            setDraft('未命名文件夹');
          }}
        >
          ＋ 新建文件夹
        </button>

        {/* 删除 / 清空废纸篓 */}
        {isTrashView ? (
          <button
            className="pressable rounded-md p-1.5"
            onClick={() => {
              emptyTrash();
              pushToast({ title: '废纸篓已清空', kind: 'info' });
            }}
            aria-label="清空废纸篓"
            title="清空废纸篓"
          >
            <TrashIcon size={15} />
          </button>
        ) : (
          <button
            className="pressable rounded-md p-1.5"
            onClick={handleTrash}
            disabled={!selectedId || node(selectedId)?.system}
            aria-label="移入废纸篓"
            title="移入废纸篓"
            style={{ opacity: !selectedId ? 0.35 : 1 }}
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 侧边栏 */}
        <aside
          className="w-[168px] shrink-0 overflow-y-auto px-2 py-2"
          style={{ borderRight: '1px solid var(--glass-border)' }}
        >
          {SIDEBAR_SECTIONS.map((sec) => (
            <div key={sec.title} className="mb-2">
              <div className="px-2 pb-0.5 pt-1 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                {sec.title}
              </div>
              {sec.items.map((it) => (
                <SidebarItem
                  key={it.id}
                  id={it.id}
                  label={it.label}
                  icon={it.icon}
                  active={currentId === it.id}
                  onClick={() => navigate(it.id)}
                />
              ))}
            </div>
          ))}
          <div className="mb-2">
            <div className="px-2 pb-0.5 pt-1 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              废纸篓
            </div>
            <SidebarItem
              id={trashId}
              label="废纸篓"
              icon={<BinIcon size={15} />}
              active={currentId === trashId}
              onClick={() => navigate(trashId)}
            />
          </div>
        </aside>

        {/* 主区 */}
        <main className="relative min-h-0 flex-1 overflow-y-auto p-3" onPointerDown={() => setSelectedId(null)}>
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {searchQuery ? '没有匹配的结果' : '此文件夹为空'}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1">
              {items.map((n) => (
                <div
                  key={n.id}
                  className="flex cursor-default flex-col items-center gap-1.5 rounded-xl px-1 py-2.5"
                  style={{ background: selectedId === n.id ? 'var(--accent-soft)' : 'transparent' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(n.id);
                  }}
                  onDoubleClick={() => handleOpen(n)}
                >
                  {renamingId === n.id ? (
                    <input
                      ref={renameRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full rounded-md px-1 text-center text-[11px]"
                      style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <span
                      className="max-w-full truncate text-[11px]"
                      style={{ color: 'var(--text-primary)', textShadow: 'var(--glass-text-shadow)' }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(n);
                      }}
                      title={n.name}
                    >
                      {n.name}
                    </span>
                  )}
                  <span className="relative -mb-1">{nodeIcon(n)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-[1fr_90px_60px_110px] gap-2 border-b px-3 pb-1 text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>
                <span>名称</span>
                <span>种类</span>
                <span>大小</span>
                <span>修改日期</span>
              </div>
              {items.map((n) => (
                <div
                  key={n.id}
                  className="grid cursor-default grid-cols-[1fr_90px_60px_110px] items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{ background: selectedId === n.id ? 'var(--accent-soft)' : 'transparent' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(n.id);
                  }}
                  onDoubleClick={() => handleOpen(n)}
                >
                  {renamingId === n.id ? (
                    <input
                      ref={renameRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full rounded-md px-1 text-[12px]"
                      style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <div
                      className="flex min-w-0 items-center gap-2"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(n);
                      }}
                    >
                      <span className="shrink-0">{nodeIcon(n)}</span>
                      <span className="truncate text-[12px]" style={{ color: 'var(--text-primary)' }}>
                        {n.name}
                      </span>
                    </div>
                  )}
                  <span className="truncate text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
                    {n.type === 'folder' ? '文件夹' : n.kind}
                  </span>
                  <span className="tnum text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
                    {formatSize(n)}
                  </span>
                  <span className="tnum text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
                    {format(n.modified, 'MM-dd HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Look 预览 */}
          <AnimatePresence>
            {quickLookNode && (
              <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setQuickLookId(null)}
              >
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={reduce ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 32 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GlassPanel radius="window" shadow="window" className="w-[380px] p-5" highlight>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {nodeIcon(quickLookNode)}
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                            {quickLookNode.name}
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {quickLookNode.type === 'folder' ? '文件夹' : quickLookNode.kind} · {formatSize(quickLookNode)}
                          </div>
                        </div>
                      </div>
                      <button className="pressable rounded-md p-1" onClick={() => setQuickLookId(null)} aria-label="关闭预览">
                        <CloseIcon size={15} />
                      </button>
                    </div>
                    {quickLookNode.kind === 'image' ? (
                      <div
                        className="flex h-[150px] items-center justify-center rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg,#1b2a5e,#3b1f5e 60%,#0f1830)',
                          border: '1px solid var(--glass-border)',
                        }}
                      >
                        <ImageIcon size={56} className="opacity-80" />
                        <span className="sr-only">图片占位预览</span>
                      </div>
                    ) : (
                      <pre
                        className="max-h-[200px] overflow-y-auto whitespace-pre-wrap rounded-xl p-3 text-[11.5px] leading-relaxed"
                        style={{
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {quickLookNode.content || '（二进制内容，无法预览）'}
                      </pre>
                    )}
                  </GlassPanel>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ id: string; label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = ({
  label,
  icon,
  active,
  onClick,
}) => (
  <button
    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors"
    style={{
      background: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    }}
    onClick={onClick}
  >
    <span className="shrink-0 opacity-80">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

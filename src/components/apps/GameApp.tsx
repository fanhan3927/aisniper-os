/**
 * GameApp — 3D 太空射击（R3F Canvas 包装）
 * - 仅窗口打开时挂载 Canvas（WindowManager 保证关闭即卸载）
 * - frameloop：playing 且页面可见时 always，否则 demand（暂停帧循环）
 * - 全屏：绿键 / HUD 按钮（osStore.toggleGameFullscreen → 隐藏菜单栏与 Dock）
 * - 低性能：降低像素比（quality 写入 gameStore）
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { useOsStore } from '../../store/osStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SpaceScene } from '../game/SpaceScene';
import { GameEngine } from '../game/GameEngine';
import { GameHUD } from '../game/GameHUD';
import { controls } from '../game/controls';
import { sfx } from '../../lib/sfx';

export const GameApp: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const quality = useGameStore((s) => s.quality);
  const setQuality = useGameStore((s) => s.setQuality);
  const gameFullscreen = useOsStore((s) => s.gameFullscreen);
  const toggleGameFullscreen = useOsStore((s) => s.toggleGameFullscreen);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  // 低性能检测：低核数 / 移动端 / 小内存 → low
  useEffect(() => {
    const nav = navigator as unknown as { deviceMemory?: number };
    const low = (navigator.hardwareConcurrency ?? 8) <= 4 || isMobile || nav.deviceMemory === 4;
    setQuality(low ? 'low' : 'high');
  }, [isMobile, setQuality]);

  // 页面不可见时暂停帧循环
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const playing = phase === 'playing';
  const frameloop: 'always' | 'demand' = playing && !hidden ? 'always' : 'demand';

  // 鼠标控制（容器坐标 → 战场坐标）；点击射击
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current || e.pointerType !== 'mouse') return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    controls.pointer.active = true;
    controls.pointer.x = nx * 7.2;
    controls.pointer.y = -ny * 4.4;
  }, []);

  const onPointerDown = useCallback(() => {
    sfx.unlock();
    if (useGameStore.getState().phase === 'playing') controls.fire = true;
  }, []);

  const onPointerUp = useCallback(() => {
    controls.fire = false;
  }, []);

  // 暂停快捷键：P / Esc（有弹窗时 Esc 交给弹窗关闭）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'p' || k === 'escape') {
        const gs = useGameStore.getState();
        if (k === 'escape' && useOsStore.getState().openPopover) return;
        if (gs.phase === 'playing') gs.setPhase('paused');
        else if (gs.phase === 'paused') gs.setPhase('playing');
      }
      if (e.key === 'Enter' && useGameStore.getState().phase === 'menu') {
        useGameStore.getState().reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dpr: [number, number] = quality === 'low' ? [1, 1.25] : [1, 2];

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: '#05060c' }}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <Canvas dpr={dpr} frameloop={frameloop} camera={{ position: [0, 0.6, 13], fov: 58 }}>
        <SpaceScene />
        <GameEngine />
      </Canvas>
      <GameHUD fullscreen={gameFullscreen} onToggleFullscreen={toggleGameFullscreen} />
    </div>
  );
};

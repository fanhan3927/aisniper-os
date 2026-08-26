/**
 * Starfield — 桌面动态深空背景（Canvas 2D，低密度粒子）
 * 注意：与游戏 WebGL 完全分离，不与 R3F 共享上下文。
 * 页面不可见时暂停 rAF。
 */
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
  twinkle: number;
}

export const Starfield: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 低密度：桌面粒子不要喧宾夺主
      const count = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        speed: 0.02 + Math.random() * 0.09,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 1.6,
      }));
    };

    const draw = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // 极淡的星云渐变（CSS 也可以做，这里顺手画两团）
      const neb = ctx.createRadialGradient(w * 0.78, h * 0.22, 0, w * 0.78, h * 0.22, w * 0.6);
      neb.addColorStop(0, 'rgba(64,96,255,0.05)');
      neb.addColorStop(1, 'rgba(64,96,255,0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);
      const neb2 = ctx.createRadialGradient(w * 0.18, h * 0.82, 0, w * 0.18, h * 0.82, w * 0.5);
      neb2.addColorStop(0, 'rgba(191,90,242,0.04)');
      neb2.addColorStop(1, 'rgba(191,90,242,0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y -= s.speed;
        s.x -= s.speed * 0.25;
        if (s.y < -2) s.y = h + 2;
        if (s.x < -2) s.x = w + 2;
        const alpha = 0.35 + 0.55 * Math.abs(Math.sin(t / 1000 / s.twinkle + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,238,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
};

/**
 * gameBridge — Canvas 仿真 → HUD（雷达）的轻量桥接（避免每帧 React 渲染）
 */
export interface RadarPoint {
  x: number;
  z: number;
  kind: 'enemy' | 'asteroid';
}

export const gameBridge = {
  radar: [] as RadarPoint[],
  setRadar(pts: RadarPoint[]) {
    gameBridge.radar = pts;
  },
};

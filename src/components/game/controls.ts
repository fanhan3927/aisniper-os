/**
 * controls — 游戏输入共享单例（键盘监听 + 鼠标 + 移动端摇杆写入）
 */
export const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  /** 鼠标目标（屏幕坐标映射后的战场坐标） */
  pointer: { active: false, x: 0, y: 0 },
  /** 移动端虚拟摇杆向量（-1..1） */
  joy: { active: false, x: 0, y: 0 },
};

export function resetControls(): void {
  controls.up = controls.down = controls.left = controls.right = controls.fire = false;
  controls.pointer.active = false;
  controls.joy.active = false;
}

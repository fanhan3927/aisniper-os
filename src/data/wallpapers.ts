/** 壁纸定义（全部本地 CSS/canvas 生成，不依赖外部图源） */

export type WallpaperId = 'deepspace' | 'aurora' | 'lake' | 'solid';

export interface Wallpaper {
  id: WallpaperId;
  name: string;
  nameEn: string;
  /** CSS background 简写 */
  css: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'deepspace',
    name: '深空',
    nameEn: 'Deep Space',
    css: 'radial-gradient(120% 90% at 50% -10%, rgba(90,120,255,0.12), transparent 55%), radial-gradient(90% 70% at 85% 110%, rgba(191,90,242,0.10), transparent 60%), #07080c',
  },
  {
    id: 'aurora',
    name: '极光',
    nameEn: 'Aurora',
    css: 'linear-gradient(160deg, #0b1e3f 0%, #123b63 34%, #1d5f6e 62%, #2a7f6f 100%)',
  },
  {
    id: 'lake',
    name: '日出湖面',
    nameEn: 'Lake Sunrise',
    css: 'linear-gradient(165deg, #f7c873 0%, #e98a6d 30%, #7a5c8f 66%, #24344f 100%)',
  },
  {
    id: 'solid',
    name: '纯色',
    nameEn: 'Solid',
    css: 'linear-gradient(135deg, #14161c 0%, #20242e 100%)',
  },
];

export function wallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}

/** Wi-Fi 模拟数据（静态 mock，UI 不假装读取真实网络） */

export interface WifiNetwork {
  id: string;
  ssid: string;
  /** 0-3 格信号 */
  signal: number;
  secured: boolean;
  /** 是否为当前连接 */
  current?: boolean;
}

export const CURRENT_SSID = 'AISniper-Net';

export const NEARBY_NETWORKS: WifiNetwork[] = [
  { id: 'n1', ssid: 'AISniper-Net', signal: 3, secured: true, current: true },
  { id: 'n2', ssid: 'Galaxy-5G', signal: 3, secured: true },
  { id: 'n3', ssid: '星环网络', signal: 2, secured: true },
  { id: 'n4', ssid: 'OrbitGuest', signal: 2, secured: false },
  { id: 'n5', ssid: 'DeepField', signal: 1, secured: true },
  { id: 'n6', ssid: 'Void-AP', signal: 1, secured: false },
];

export const WIFI_SPEED = '866 Mbps';

/** wifiStore — Wi-Fi 模拟状态（菜单栏图标与弹窗共享） */
import { create } from 'zustand';
import { CURRENT_SSID, NEARBY_NETWORKS, type WifiNetwork } from '../data/mockWifi';

interface WifiState {
  enabled: boolean;
  ssid: string | null;
  signal: number;
  networks: WifiNetwork[];
  setEnabled: (b: boolean) => void;
  connect: (ssid: string) => void;
  toggle: () => void;
}

export const useWifiStore = create<WifiState>()((set) => ({
  enabled: true,
  ssid: CURRENT_SSID,
  signal: 3,
  networks: NEARBY_NETWORKS,

  setEnabled: (enabled) =>
    set((s) => ({
      enabled,
      ssid: enabled ? s.ssid ?? CURRENT_SSID : null,
      signal: enabled ? s.signal : 0,
      networks: s.networks.map((n) => (n.current ? { ...n, current: enabled } : n)),
    })),

  connect: (ssid) =>
    set((s) => ({
      ssid,
      enabled: true,
      signal: 3,
      networks: s.networks.map((n) => ({ ...n, current: n.ssid === ssid })),
    })),

  toggle: () => {
    const s = useWifiStore.getState();
    s.setEnabled(!s.enabled);
  },
}));

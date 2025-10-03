import { create } from 'zustand';

type DeviceState = {
  deviceToken: string | null;
  setDeviceToken: (token: string) => void;
  clearDeviceToken: () => void;
};

export const useDeviceStore = create<DeviceState>((set) => ({
  deviceToken: null,
  setDeviceToken: (token) => set({ deviceToken: token }),
  clearDeviceToken: () => set({ deviceToken: null }),
}));

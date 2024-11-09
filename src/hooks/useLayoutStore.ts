import { create } from 'zustand';

interface LayoutStore {
  isQrModalOpen: boolean;
  isConfirmationModalOpen: boolean;

  setConfirmationModalOpen: (isQrModalOpen: boolean) => void;

  openQrModal: () => void;
  closeQrModal: () => void;

  openConfirmationModal: () => void;
  closeConfirmationModal: () => void;

  reset: () => void;
}

const useLayoutStore = create<LayoutStore>()((set) => ({
  mode: 'swap',
  showQuote: false,
  isWalletModalOpen: false,
  isAccountModalOpen: false,
  isQrModalOpen: false,
  isConfirmationModalOpen: false,

  setConfirmationModalOpen: (isConfirmationModalOpen) => set({ isConfirmationModalOpen }),

  openQrModal: () => set({ isQrModalOpen: true }),
  closeQrModal: () => set({ isQrModalOpen: false }),

  openConfirmationModal: () => set({ isConfirmationModalOpen: true }),
  closeConfirmationModal: () => set({ isConfirmationModalOpen: false }),

  reset: () => set({}),
}));

export default useLayoutStore;

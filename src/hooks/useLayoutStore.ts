import { create } from "zustand";

interface LayoutStore {
  mode: "swap" | "gas" | "settings";
  showQuote: boolean;
  isWalletModalOpen: boolean;
  isAccountModalOpen: boolean;
  isQrModalOpen: boolean;
  isConfirmationModalOpen: boolean;

  setShowQuote: (showQuote: boolean) => void;
  setMode: (mode: "swap" | "gas" | "settings") => void;

  setWalletModalOpen: (isWalletModalOpen: boolean) => void;
  setAccountModalOpen: (isAccountModalOpen: boolean) => void;

  setConfirmationModalOpen: (isQrModalOpen: boolean) => void;

  openAccountModal: () => void;
  closeAccountModal: () => void;

  openWalletModal: () => void;
  closeWalletModal: () => void;

  openQrModal: () => void;
  closeQrModal: () => void;

  openConfirmationModal: () => void;
  closeConfirmationModal: () => void;

  reset: () => void;
}

const useLayoutStore = create<LayoutStore>()((set) => ({
  mode: "swap",
  showQuote: false,
  isWalletModalOpen: false,
  isAccountModalOpen: false,
  isQrModalOpen: false,
  isConfirmationModalOpen: false,

  setShowQuote: (showQuote) => set({ showQuote }),
  setMode: (mode) => set({ mode }),

  setWalletModalOpen: (isWalletModalOpen) => set({ isWalletModalOpen }),
  setAccountModalOpen: (isAccountModalOpen) => set({ isAccountModalOpen }),

  setConfirmationModalOpen: (isConfirmationModalOpen) => set({ isConfirmationModalOpen }),

  openAccountModal: () => set({ isAccountModalOpen: true }),
  closeAccountModal: () => set({ isAccountModalOpen: false }),

  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),

  openQrModal: () => set({ isQrModalOpen: true }),
  closeQrModal: () => set({ isQrModalOpen: false }),

  openConfirmationModal: () => set({ isConfirmationModalOpen: true }),
  closeConfirmationModal: () => set({ isConfirmationModalOpen: false }),

  reset: () => set({ mode: "swap" }),
}));

export default useLayoutStore;

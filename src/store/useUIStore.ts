import { create } from "zustand";
import { ModalState } from "@/types";

interface UIState {
  activeModal: ModalState;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  headerTitle: string;
  headerSubtitle: string;
  headerBackHref: string | null;
  setHeader: (title: string, subtitle?: string, backHref?: string | null) => void;
  clearHeader: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: "none",
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: "none" }),
  headerTitle: "",
  headerSubtitle: "",
  headerBackHref: null,
  setHeader: (title, subtitle = "", backHref = null) =>
    set({ headerTitle: title, headerSubtitle: subtitle, headerBackHref: backHref }),
  clearHeader: () => set({ headerTitle: "", headerSubtitle: "", headerBackHref: null }),
}));
export type { UIState };

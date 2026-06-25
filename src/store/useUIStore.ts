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
  showViewSwitcher: boolean;
  viewSwitcherKey: string;
  viewMode: "list" | "card";
  setViewSwitcher: (show: boolean, storageKey?: string) => void;
  setViewMode: (mode: "list" | "card") => void;
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
  showViewSwitcher: false,
  viewSwitcherKey: "",
  viewMode: "list",
  setViewSwitcher: (show, storageKey = "") => {
    set((state) => {
      let initialViewMode = state.viewMode;
      if (show && storageKey && typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey) as "list" | "card";
        if (saved && (saved === "list" || saved === "card")) {
          initialViewMode = saved;
        } else {
          initialViewMode = "list";
        }
      }
      return {
        showViewSwitcher: show,
        viewSwitcherKey: storageKey,
        viewMode: initialViewMode,
      };
    });
  },
  setViewMode: (mode) => {
    set((state) => {
      if (typeof window !== "undefined" && state.viewSwitcherKey) {
        localStorage.setItem(state.viewSwitcherKey, mode);
      }
      return { viewMode: mode };
    });
  },
}));
export type { UIState };

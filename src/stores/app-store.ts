import { create } from "zustand";

interface AppState {
  savedScenarios: SavedScenario[];
  addScenario: (scenario: SavedScenario) => void;
  removeScenario: (id: string) => void;
  clearScenarios: () => void;
}

export interface SavedScenario {
  id: string;
  name: string;
  calculator: string;
  inputs: Record<string, number>;
  results: Record<string, number>;
  createdAt: string;
}

export const useAppStore = create<AppState>((set) => ({
  savedScenarios: [],
  addScenario: (scenario) =>
    set((state) => ({
      savedScenarios: [...state.savedScenarios, scenario],
    })),
  removeScenario: (id) =>
    set((state) => ({
      savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
    })),
  clearScenarios: () => set({ savedScenarios: [] }),
}));

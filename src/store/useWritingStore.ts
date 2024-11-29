import { create } from 'zustand';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  relationships: {
    characterId: string;
    type: string;
    description: string;
  }[];
}

interface Scene {
  id: string;
  title: string;
  description: string;
  characters: string[];
  location: string;
  timeOfDay: string;
  mood: string;
  plotPointId?: string;
}

interface PlotPoint {
  id: string;
  title: string;
  description: string;
  act: number;
  order: number;
  scenes: Scene[];
}

interface WritingState {
  currentProject: string | null;
  collaborators: string[];
  wordCount: number;
  characters: Character[];
  plotPoints: PlotPoint[];
  scenes: Scene[];
  setCurrentProject: (project: string) => void;
  addCollaborator: (collaborator: string) => void;
  updateWordCount: (count: number) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  addRelationship: (characterId: string, relationship: Character['relationships'][0]) => void;
  addPlotPoint: (plotPoint: PlotPoint) => void;
  reorderPlotPoints: (plotPoints: PlotPoint[]) => void;
  addScene: (scene: Scene) => void;
  updateScene: (id: string, scene: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
}

export const useWritingStore = create<WritingState>((set) => ({
  currentProject: null,
  collaborators: [],
  wordCount: 0,
  characters: [],
  plotPoints: [],
  scenes: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  addCollaborator: (collaborator) => 
    set((state) => ({ collaborators: [...state.collaborators, collaborator] })),
  updateWordCount: (count) => set({ wordCount: count }),
  addCharacter: (character) =>
    set((state) => ({ characters: [...state.characters, character] })),
  updateCharacter: (id, character) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...character } : c
      ),
    })),
  addRelationship: (characterId, relationship) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId
          ? { ...c, relationships: [...c.relationships, relationship] }
          : c
      ),
    })),
  addPlotPoint: (plotPoint) =>
    set((state) => ({ plotPoints: [...state.plotPoints, plotPoint] })),
  reorderPlotPoints: (plotPoints) => set({ plotPoints }),
  addScene: (scene) =>
    set((state) => ({ scenes: [...state.scenes, scene] })),
  updateScene: (id, scene) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, ...scene } : s
      ),
    })),
  deleteScene: (id) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id),
    })),
}));
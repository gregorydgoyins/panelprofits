import { create } from 'zustand';

interface StoryboardFrame {
  id: string;
  sceneId: string;
  imageUrl: string;
  prompt: string;
  description: string;
  audioTrackUrl?: string;
  stockFootageUrl?: string;
  notes: string;
  status: 'pending' | 'generated' | 'approved' | 'rejected';
}

interface StoryboardState {
  frames: StoryboardFrame[];
  addFrame: (frame: StoryboardFrame) => void;
  updateFrame: (id: string, frame: Partial<StoryboardFrame>) => void;
  deleteFrame: (id: string) => void;
  reorderFrames: (frames: StoryboardFrame[]) => void;
}

export const useStoryboardStore = create<StoryboardState>((set) => ({
  frames: [],
  addFrame: (frame) =>
    set((state) => ({ frames: [...state.frames, frame] })),
  updateFrame: (id, frame) =>
    set((state) => ({
      frames: state.frames.map((f) =>
        f.id === id ? { ...f, ...frame } : f
      ),
    })),
  deleteFrame: (id) =>
    set((state) => ({
      frames: state.frames.filter((f) => f.id !== id),
    })),
  reorderFrames: (frames) => set({ frames }),
}));
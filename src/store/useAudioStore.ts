import { create } from 'zustand';
import * as Tone from 'tone';

interface AudioTrack {
  id: string;
  type: 'music' | 'foley' | 'ambient' | 'voiceover';
  url: string;
  name: string;
  duration: number;
  volume: number;
  startTime: number;
  loop: boolean;
  player?: Tone.Player;
}

interface AudioState {
  tracks: AudioTrack[];
  masterVolume: number;
  isPlaying: boolean;
  currentTime: number;
  selectedTrackId: string | null;
  initializeAudio: () => Promise<void>;
  addTrack: (track: Omit<AudioTrack, 'player'>) => Promise<void>;
  removeTrack: (id: string) => void;
  playTrack: (id: string) => Promise<void>;
  stopTrack: (id: string) => void;
  setTrackVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  setTrackStartTime: (id: string, time: number) => void;
  toggleLoop: (id: string) => void;
  playAll: () => Promise<void>;
  stopAll: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  tracks: [],
  masterVolume: 0.8,
  isPlaying: false,
  currentTime: 0,
  selectedTrackId: null,

  initializeAudio: async () => {
    await Tone.start();
    Tone.Transport.start();
  },

  addTrack: async (track) => {
    const player = new Tone.Player({
      url: track.url,
      loop: track.loop,
      volume: track.volume,
    }).toDestination();

    await player.load(track.url);

    set((state) => ({
      tracks: [...state.tracks, { ...track, player }],
    }));
  },

  removeTrack: (id) => {
    const { tracks } = get();
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.dispose();
    }
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    }));
  },

  playTrack: async (id) => {
    const { tracks } = get();
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.start(undefined, track.startTime);
    }
  },

  stopTrack: (id) => {
    const { tracks } = get();
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.stop();
    }
  },

  setTrackVolume: (id, volume) => {
    const { tracks } = get();
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.volume.value = volume * 20 - 20; // Convert 0-1 to dB
    }
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === id ? { ...t, volume } : t
      ),
    }));
  },

  setMasterVolume: (volume) => {
    Tone.Destination.volume.value = volume * 20 - 20;
    set({ masterVolume: volume });
  },

  setTrackStartTime: (id, time) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === id ? { ...t, startTime: time } : t
      ),
    }));
  },

  toggleLoop: (id) => {
    const { tracks } = get();
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.loop = !track.loop;
      set((state) => ({
        tracks: state.tracks.map((t) =>
          t.id === id ? { ...t, loop: !t.loop } : t
        ),
      }));
    }
  },

  playAll: async () => {
    const { tracks } = get();
    await Promise.all(
      tracks.map((track) => {
        if (track.player) {
          track.player.start(undefined, track.startTime);
        }
      })
    );
    set({ isPlaying: true });
  },

  stopAll: () => {
    const { tracks } = get();
    tracks.forEach((track) => {
      if (track.player) {
        track.player.stop();
      }
    });
    set({ isPlaying: false });
  },
}));
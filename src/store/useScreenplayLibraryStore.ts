import { create } from 'zustand';

interface ScreenplayResource {
  id: string;
  title: string;
  year: number;
  source: 'loc' | 'ampas' | 'public_domain';
  type: 'full' | 'excerpt' | 'analysis';
  genre: string[];
  techniques: string[];
  educationalNotes: string;
  publicDomain: boolean;
  url?: string;
  citation: string;
}

interface LibraryState {
  resources: ScreenplayResource[];
  filters: {
    genre: string[];
    technique: string[];
    source: string[];
  };
  setFilters: (filters: Partial<LibraryState['filters']>) => void;
  addResource: (resource: ScreenplayResource) => void;
  searchResources: (query: string) => ScreenplayResource[];
  getPublicDomainOnly: () => ScreenplayResource[];
}

export const useScreenplayLibraryStore = create<LibraryState>((set, get) => ({
  resources: [],
  filters: {
    genre: [],
    technique: [],
    source: [],
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  addResource: (resource) =>
    set((state) => ({
      resources: [...state.resources, resource],
    })),

  searchResources: (query) => {
    const state = get();
    const searchTerms = query.toLowerCase().split(' ');
    
    return state.resources.filter((resource) =>
      searchTerms.every((term) =>
        resource.title.toLowerCase().includes(term) ||
        resource.techniques.some((t) => t.toLowerCase().includes(term)) ||
        resource.genre.some((g) => g.toLowerCase().includes(term))
      )
    );
  },

  getPublicDomainOnly: () => {
    const state = get();
    return state.resources.filter((resource) => resource.publicDomain);
  },
}));
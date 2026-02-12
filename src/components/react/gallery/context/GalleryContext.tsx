import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Photo } from "../../../../lib/types";

// State
interface GalleryState {
  currentIndex: number;
  loadedPhotos: Set<string>;
  animatedPhotos: Set<string>;
}

// Actions
type GalleryAction =
  | { type: "SET_INDEX"; index: number }
  | { type: "GO_NEXT"; maxIndex: number }
  | { type: "GO_PREVIOUS" }
  | { type: "MARK_LOADED"; photoId: string }
  | { type: "MARK_ANIMATED"; photoId: string };

// Context value - simplified without refs
interface GalleryContextValue {
  // Data
  photos: Photo[];
  currentIndex: number;
  currentPhoto: Photo | undefined;

  // State checks
  isPhotoLoaded: (photoId: string) => boolean;
  isPhotoAnimated: (photoId: string) => boolean;

  // Actions
  setCurrentIndex: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markPhotoLoaded: (photoId: string) => void;
  markPhotoAnimated: (photoId: string) => void;
}

// Reducer
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case "SET_INDEX":
      if (action.index === state.currentIndex) return state;
      return { ...state, currentIndex: action.index };

    case "GO_NEXT":
      if (state.currentIndex >= action.maxIndex) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };

    case "GO_PREVIOUS":
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };

    case "MARK_LOADED": {
      if (state.loadedPhotos.has(action.photoId)) return state;
      const newLoaded = new Set(state.loadedPhotos);
      newLoaded.add(action.photoId);
      return { ...state, loadedPhotos: newLoaded };
    }

    case "MARK_ANIMATED": {
      if (state.animatedPhotos.has(action.photoId)) return state;
      const newAnimated = new Set(state.animatedPhotos);
      newAnimated.add(action.photoId);
      return { ...state, animatedPhotos: newAnimated };
    }

    default:
      return state;
  }
}

// Context
const GalleryContext = createContext<GalleryContextValue | null>(null);

// Provider props
interface GalleryProviderProps {
  children: ReactNode;
  photos: Photo[];
  initialIndex?: number;
}

export function GalleryProvider({
  children,
  photos,
  initialIndex = 0,
}: GalleryProviderProps): ReactNode {
  const [state, dispatch] = useReducer(galleryReducer, {
    currentIndex: initialIndex,
    loadedPhotos: new Set<string>(),
    animatedPhotos: new Set<string>(),
  });

  // Actions
  const setCurrentIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < photos.length) {
        dispatch({ type: "SET_INDEX", index });
      }
    },
    [photos.length]
  );

  const goToNext = useCallback(() => {
    dispatch({ type: "GO_NEXT", maxIndex: photos.length - 1 });
  }, [photos.length]);

  const goToPrevious = useCallback(() => {
    dispatch({ type: "GO_PREVIOUS" });
  }, []);

  const markPhotoLoaded = useCallback((photoId: string) => {
    dispatch({ type: "MARK_LOADED", photoId });
  }, []);

  const markPhotoAnimated = useCallback((photoId: string) => {
    dispatch({ type: "MARK_ANIMATED", photoId });
  }, []);

  // State checks - using refs pattern to avoid stale closures
  const isPhotoLoaded = useCallback(
    (photoId: string) => state.loadedPhotos.has(photoId),
    [state.loadedPhotos]
  );

  const isPhotoAnimated = useCallback(
    (photoId: string) => state.animatedPhotos.has(photoId),
    [state.animatedPhotos]
  );

  // Memoized context value
  const value = useMemo<GalleryContextValue>(
    () => ({
      photos,
      currentIndex: state.currentIndex,
      currentPhoto: photos[state.currentIndex],
      isPhotoLoaded,
      isPhotoAnimated,
      setCurrentIndex,
      goToNext,
      goToPrevious,
      markPhotoLoaded,
      markPhotoAnimated,
    }),
    [
      photos,
      state.currentIndex,
      isPhotoLoaded,
      isPhotoAnimated,
      setCurrentIndex,
      goToNext,
      goToPrevious,
      markPhotoLoaded,
      markPhotoAnimated,
    ]
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

// Hook
export function useGallery(): GalleryContextValue {
  const context = useContext(GalleryContext);

  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }

  return context;
}

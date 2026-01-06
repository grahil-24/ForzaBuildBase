import { createContext} from 'react';

interface LoadingBarContextType {
  startLoading: () => void;
  completeLoading: () => void;
  continueLoading: (progress: number) => void;
}

export const LoadingBarContext = createContext<LoadingBarContextType | undefined>(undefined);
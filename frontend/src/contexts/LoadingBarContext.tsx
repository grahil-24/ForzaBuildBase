import { createContext, useContext, useRef, type ReactNode } from 'react';
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar';

interface LoadingBarContextType {
  startLoading: () => void;
  completeLoading: () => void;
  continueLoading: (progress: number) => void;
}

const LoadingBarContext = createContext<LoadingBarContextType | undefined>(undefined);

export function LoadingBarProvider({ children }: { children: ReactNode }) {
  const loadingBarRef = useRef<LoadingBarRef>(null);

  const startLoading = () => {
    loadingBarRef.current?.continuousStart();
  };

  const completeLoading = () => {
    loadingBarRef.current?.complete();
  };

  const continueLoading = (progress: number) => {
    loadingBarRef.current?.continuousStart(progress);
  };

  return (
    <LoadingBarContext.Provider value={{ startLoading, completeLoading, continueLoading }}>
      <LoadingBar
        color="red"
        height={3}
        ref={loadingBarRef}
        shadow={true}
        waitingTime={400}
      />
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error('useLoadingBar must be used within LoadingBarProvider');
  }
  return context;
}
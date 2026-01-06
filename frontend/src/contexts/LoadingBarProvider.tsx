import {useRef, type ReactNode } from 'react';
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar';
import { LoadingBarContext } from './LoadingBarContext';

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
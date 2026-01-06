import { useRef, type ReactNode } from "react"
import type {LoadingBarRef} from 'react-top-loading-bar';
import { LoadingBarContext } from "./LoadingBarContext";
import LoadingBar from "react-top-loading-bar";

export const LoadingBarProvider = ({children}: {children: ReactNode}) => {
  const loadingBarRef = useRef<LoadingBarRef>(null);

  const startLoading = () => {
    loadingBarRef.current?.start();
  }

  const completeLoading = () => {
    loadingBarRef.current?.complete();
  }

  const continueLoading = (progress: number) => {
    loadingBarRef.current?.continuousStart(progress);
  }

  return (
    <LoadingBarContext.Provider value={{startLoading, completeLoading, continueLoading}}>
      <LoadingBar shadow={false} ref={loadingBarRef} waitingTime={400} color="red" height={3}/>
      {children}
    </LoadingBarContext.Provider>
  )
}
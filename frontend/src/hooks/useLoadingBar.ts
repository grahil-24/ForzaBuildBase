import { useContext } from "react"
import { LoadingBarContext } from "../contexts/LoadingBarContext"

export const useLoadingBar = () => {
  const loadingBarContext = useContext(LoadingBarContext);
  if(!loadingBarContext){
    throw new Error('useLoadingBar must be used within LoadingBarProvider');
  }
  return loadingBarContext;
}
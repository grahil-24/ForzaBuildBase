import { useContext } from "react";
import { LoadingBarContext } from "../contexts/LoadingBarContext";

export function useLoadingBar() {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error('useLoadingBar must be used within LoadingBarProvider');
  }
  return context;
}
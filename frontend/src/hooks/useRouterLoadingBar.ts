import { useRouter } from "@tanstack/react-router";
import { useLoadingBar } from "./useLoadingBar";
import { useEffect } from "react";

export const useRouterLoadingBar = () => {
  const router = useRouter();
  const {startLoading, completeLoading} = useLoadingBar();

  useEffect(() => {

    // Start loading when navigation begins
    const unsubscribeBeforeLoad = router.subscribe('onBeforeLoad', () => {
      startLoading();
    })

    // Complete loading when navigation ends
    const unsubscribeOnLoad = router.subscribe('onLoad', () => {
      completeLoading();
    })
    return () => {
      unsubscribeBeforeLoad();
      unsubscribeOnLoad();
    }
  }, [router, startLoading, completeLoading]);
}
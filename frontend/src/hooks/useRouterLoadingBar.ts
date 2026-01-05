import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useLoadingBar } from '../contexts/LoadingBarContext';

export function useRouterLoadingBar() {
  const router = useRouter();
  const { startLoading, completeLoading } = useLoadingBar();

  useEffect(() => {
    // Start loading when navigation begins
    const unsubscribeOnBeforeLoad = router.subscribe('onBeforeLoad', () => {
      startLoading();
    });

    // Complete loading when navigation ends
    const unsubscribeOnLoad = router.subscribe('onLoad', () => {
      completeLoading();
    });

    return () => {
      unsubscribeOnBeforeLoad();
      unsubscribeOnLoad();
    };
  }, [router, startLoading, completeLoading]);
}
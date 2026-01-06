import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { AuthProvider } from './contexts/Auth/AuthProvider.tsx';
import {queryClient} from './queryClient.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer, Slide } from 'react-toastify';
import { LoadingBarProvider } from './contexts/LoadingBarProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingBarProvider>
        <ToastContainer pauseOnHover={false} transition={Slide} pauseOnFocusLoss={false} position='top-center' autoClose={5000} />
        <App />
        </LoadingBarProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
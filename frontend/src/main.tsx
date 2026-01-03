import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { AuthProvider } from './auth.tsx';
import {queryClient} from './queryClient.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastContainer position='top-center' autoClose={5000} />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>

)
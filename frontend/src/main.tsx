import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import {config} from 'dotenv';
import './index.css'
// import App from './App.tsx'
import { RouterProvider , createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen.ts';

// config();
//create a new router instance
const router = createRouter({routeTree});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

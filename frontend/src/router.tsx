import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { Car } from './types/car';

// config();
//create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    //auth will be passed down from App component
    auth: undefined!
  }
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  
  interface HistoryState {
    carData?: Car
    tuneDetails?: {
      created_on: Date,
      tune_id: number, 
      tune_name: string, 
      creator: string,
      car: Car,
      tune_details: Record<string, number>,
      class: string
    } 
  }
}
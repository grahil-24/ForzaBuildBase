import { RouterProvider } from '@tanstack/react-router';
import { useAuth } from './hooks/useAuth';
import { router } from './router';

export const App = () => {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
};
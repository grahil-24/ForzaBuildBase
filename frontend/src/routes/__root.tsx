import { HeadContent, Outlet, createRootRouteWithContext, redirect, useMatchRoute } from '@tanstack/react-router'
import type { AuthState } from '../types/auth'
import ErrorComponent from '../components/ErrorComponent'
import NotFoundComponent from '../components/NotFoundComponent'
import { useRouterLoadingBar } from '../hooks/useRouterLoadingBar'
import Nav from '../components/Navbar'

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({context, location}) => {
    if(context.auth.isAuthenticated && location.pathname === '/'){
      return redirect({
        to: '/dashboard'
      })
    }
  },
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Create, share FH5 Tunes!'
      },
      {
        title: 'ForzaBuildBase'
      },  
      {
        charSet: 'UTF-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      }
    ],
    links: [
      {
        rel: 'icon',
        href: '/logo/header.png'
      }
    ]
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,   
})

function RootComponent() {
  const hideNavinRoutes = ['/login', '/sign-up', '/', '/forgot-password', '/reset-password', '/verify-email'];

  const matchRoute = useMatchRoute();

  const matchedHideNavRoute = hideNavinRoutes.some((route) => matchRoute({to: route}));

  useRouterLoadingBar();
  return (
    <>
      <HeadContent />
      {!matchedHideNavRoute ? <Nav /> : null}
      <Outlet />
    </>
  )
}

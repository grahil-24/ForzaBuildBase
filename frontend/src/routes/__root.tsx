import * as React from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { AuthState } from '../types/auth'
import ErrorComponent from '../components/ErrorComponent'
import NotFoundComponent from '../components/NotFoundComponent'
import { useRouterLoadingBar } from '../hooks/useRouterLoadingBar'

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,   
})

function RootComponent() {
  useRouterLoadingBar();
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}

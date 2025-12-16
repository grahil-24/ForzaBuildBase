import * as React from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

interface AuthState {
  isAuthenticated: boolean
  user: { user_id: number} | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string) => Promise<void>
}

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}

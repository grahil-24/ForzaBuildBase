import type { User } from "./user"

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  refreshUserData: () => Promise<void>
  updateUserProfile: (profile: User | null) => void
}

export type {AuthState};
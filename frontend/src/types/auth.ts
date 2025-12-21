interface AuthState {
  isAuthenticated: boolean
  user: { username: string, user_id: number} | null
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
}

export type {AuthState};
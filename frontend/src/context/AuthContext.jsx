import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'nexusai_token'
const USERNAME_KEY = 'nexusai_username'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY))

  const setSession = useCallback((newToken, newUsername) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USERNAME_KEY, newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }, [])

  const demoLogin = useCallback(() => {
    const demoToken = 'nexus_demo_jwt_token_' + Date.now()
    const demoUser = 'Parthiv (Demo)'
    setSession(demoToken, demoUser)
    return { token: demoToken, username: demoUser }
  }, [setSession])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setToken(null)
    setUsername(null)
  }, [])

  const value = {
    token,
    username,
    isAuthenticated: Boolean(token),
    setSession,
    demoLogin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

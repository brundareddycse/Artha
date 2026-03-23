import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scoreData, setScoreData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('artha_score')) } catch { return null }
  })
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('artha_streak') || '0'))
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('artha_xp') || '0'))

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          joinDate: session.user.created_at,
          id: session.user.id,
        })
        updateStreak()
      }
      setLoading(false)
    })

    // Listen for auth changes (login, logout, email confirm)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          joinDate: session.user.created_at,
          id: session.user.id,
        })
        updateStreak()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  function updateStreak() {
    const last = localStorage.getItem('artha_last_login')
    const today = new Date().toDateString()
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = last === yesterday ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('artha_streak', newStreak)
      localStorage.setItem('artha_last_login', today)
    }
  }

  const signup = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) return { ok: false, message: error.message }
    return { ok: true, needsConfirmation: true }
  }

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('artha_score')
  }

  const saveScore = (data) => {
    localStorage.setItem('artha_score', JSON.stringify(data))
    setScoreData(data)
  }

  const addXp = (amount) => {
    const newXp = xp + amount
    setXp(newXp)
    localStorage.setItem('artha_xp', newXp)
  }

  // apiKey kept for Gemini — hardcoded in api.js, this is just a fallback
  const apiKey = ''
  const setApiKey = () => {}

  return (
    <AuthContext.Provider value={{ user, loading, apiKey, setApiKey, scoreData, saveScore, streak, xp, addXp, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

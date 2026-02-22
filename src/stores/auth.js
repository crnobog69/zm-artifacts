import { create } from 'zustand'
import { api, setToken, setServerUrl, clearAuth, loadPersistedAuth } from '../api/client'

export const useAuthStore = create((set, get) => ({
  token: null,
  me: null,
  serverUrl: '',
  loading: true,

  hydrate: async () => {
    try {
      const { serverUrl, token } = await loadPersistedAuth()
      if (!serverUrl || !token) {
        set({ loading: false })
        return
      }
      set({ serverUrl, token })
      const me = await api('/me')
      set({ me, loading: false })
    } catch {
      await clearAuth()
      set({ token: null, me: null, loading: false })
    }
  },

  login: async (serverUrl, email, password) => {
    await setServerUrl(serverUrl)
    set({ serverUrl })
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    await setToken(data.token)
    set({ token: data.token })
    const me = await api('/me')
    set({ me })
  },

  register: async (serverUrl, email, username, password) => {
    await setServerUrl(serverUrl)
    set({ serverUrl })
    const data = await api('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    })
    await setToken(data.token)
    set({ token: data.token })
    const me = await api('/me')
    set({ me })
  },

  logout: async () => {
    await clearAuth()
    set({ token: null, me: null })
  },
}))

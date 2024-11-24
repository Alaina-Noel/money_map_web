import { defineStore } from 'pinia'
import api from '@/config/api'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('auth_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await api.post('/login', { email, password })
        const token = response.data.access_token

        localStorage.setItem('auth_token', token)
        this.token = token
        this.isAuthenticated = true

        return response
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(credentials: {
        name: string
        email: string
        password: string
        password_confirmation: string
      }) {
        try {
          const response = await api.post('/register', credentials)
          const token = response.data.access_token

          localStorage.setItem('auth_token', token)
          this.token = token
          this.user = response.data.user
          this.isAuthenticated = true

          return response
        } catch (error) {
          console.error('Registration error:', error)
          throw error
        }
      },

    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.warn('Logout endpoint error, clearing local state anyway:', error)
      } finally {
        localStorage.removeItem('auth_token')
        this.token = null
        this.user = null
        this.isAuthenticated = false
      }
    },
  },
})

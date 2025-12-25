import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/api'
import { apiUtils } from '../api/api' // Import apiUtils for error handling

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('access_token')
    if (token) {
      // Token exists, validate it by making a simple request
      // or decode and check expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          // Token is valid, set user from stored data
          const userData = localStorage.getItem('user_data')
          if (userData) {
            setUser(JSON.parse(userData))
          }
        } else {
          // Token expired, clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_data')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access_token, user_info } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user_info))
      setUser(user_info)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      // Handle successful registration
      if (response.data.message === "User created successfully") {
        return { 
          success: true, 
          message: response.data.message,
          user_id: response.data.user_id 
        }
      }
      
      return { 
        success: false, 
        error: response.data.detail || 'Registration failed' 
      }
    } catch (error) {
      // Handle different error types
      const errorMessage = apiUtils.getErrorMessage(error)
      
      // Check for specific error cases
      if (error.response?.status === 422) {
        return { 
          success: false, 
          error: 'Invalid data format. Please check your information.' 
        }
      }
      
      if (error.response?.status === 400) {
        return { 
          success: false, 
          error: error.response.data.detail || 'Registration failed' 
        }
      }
      
      return { 
        success: false, 
        error: errorMessage || 'Registration failed. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
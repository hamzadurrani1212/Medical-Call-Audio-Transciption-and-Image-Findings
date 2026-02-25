import { useDispatch, useSelector } from 'react-redux'
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  loginUser,
  registerUser,
  logoutUser,
  updateUser,
} from '../store/authSlice'

/**
 * useAuth — Redux-backed hook.
 * Keeps the same public API as the old Context-based useAuth,
 * so every existing consumer continues to work without any import changes.
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectAuthLoading)

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials))
    if (loginUser.fulfilled.match(result)) {
      return { success: true }
    }
    return { success: false, error: result.payload }
  }

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData))
    if (registerUser.fulfilled.match(result)) {
      return { success: true, ...result.payload }
    }
    return { success: false, error: result.payload }
  }

  const logout = async () => {
    await dispatch(logoutUser())
  }

  const updateUserData = (userData) => {
    dispatch(updateUser(userData))
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserData,
  }
}
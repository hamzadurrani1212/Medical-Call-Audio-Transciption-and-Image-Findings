import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../api/api'
import { apiUtils } from '../api/api'

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) return null

            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.exp * 1000 > Date.now()) {
                const userData = localStorage.getItem('user_data')
                return userData ? JSON.parse(userData) : null
            } else {
                localStorage.removeItem('access_token')
                localStorage.removeItem('user_data')
                return null
            }
        } catch (error) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_data')
            return rejectWithValue('Token validation failed')
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials)
            const { access_token, user_info } = response.data
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('user_data', JSON.stringify(user_info))
            return user_info
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Login failed')
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(userData)
            if (response.data.message === 'User created successfully') {
                return { success: true, message: response.data.message, user_id: response.data.user_id }
            }
            return rejectWithValue(response.data.detail || 'Registration failed')
        } catch (error) {
            if (error.response?.status === 422) {
                return rejectWithValue('Invalid data format. Please check your information.')
            }
            if (error.response?.status === 400) {
                return rejectWithValue(error.response.data.detail || 'Registration failed')
            }
            return rejectWithValue(apiUtils.getErrorMessage(error) || 'Registration failed. Please try again.')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_data')
        }
    }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,  // true on start until initializeAuth finishes
        error: null,
    },
    reducers: {
        updateUser(state, action) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload }
                localStorage.setItem('user_data', JSON.stringify(state.user))
            }
        },
    },
    extraReducers: (builder) => {
        // initializeAuth
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.user = action.payload
                state.loading = false
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.user = null
                state.loading = false
            })

        // loginUser
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // registerUser
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // logoutUser
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.loading = false
                state.error = null
            })
    },
})

export const { updateUser } = authSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => !!state.auth.user
export const selectAuthLoading = (state) => state.auth.loading

export default authSlice.reducer

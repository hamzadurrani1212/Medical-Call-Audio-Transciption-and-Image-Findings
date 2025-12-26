import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Mail, Lock, ArrowRight, Activity, ShieldCheck, Zap, BarChart3 } from 'lucide-react'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      })
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Invalid credentials. Please check your email and password.')
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { value: '50K+', label: 'Transcriptions', icon: <Zap className="w-5 h-5 text-teal-400" /> },
    { value: '100K+', label: 'Images Analyzed', icon: <BarChart3 className="w-5 h-5 text-teal-400" /> },
    { value: '99.2%', label: 'Accuracy Rate', icon: <ShieldCheck className="w-5 h-5 text-teal-400" /> }
  ]

  return (
    <div className="auth-layout min-h-screen bg-white">
      {/* Left Panel - Branding */}
      <div className="auth-left mesh-gradient relative overflow-hidden">
        <div className="relative z-10 max-w-md w-full animate-in">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16 group transition-all duration-300">
            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">MedAI</span>
          </Link>

          {/* Headline */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Intelligence that <span className="text-teal-400">Heals.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-sm">
              The next generation AI platform for modern healthcare providers.
              Streamline your workflow with surgical precision.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 group">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right relative flex items-center justify-center">
        <div className="w-full max-w-md px-4 animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MedAI</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 font-medium">Please enter your credentials to access your workspace</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 animate-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-teal-500 transition-colors">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  className="input-field pl-12 h-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-12 h-14"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit ml-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Stay signed in for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 text-lg shadow-xl shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authorizing...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-12 text-center text-gray-600 font-medium">
            New to MedAI?{' '}
            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

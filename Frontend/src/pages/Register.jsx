import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { User, Mail, Lock, ArrowRight, Activity, Check, ShieldCheck, Zap, HeartPulse } from 'lucide-react'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'doctor'
  })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const { confirmPassword, ...registerData } = formData

    try {
      const result = await register(registerData)
      if (result.success) {
        navigate('/login')
      } else {
        setError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { title: 'Smart Transcription', desc: 'Real-time medical voice-to-text', icon: <Zap className="w-5 h-5" /> },
    { title: 'Advanced Analysis', desc: 'AI-driven MRI & X-Ray insights', icon: <HeartPulse className="w-5 h-5" /> },
    { title: 'HIPAA Compliant', desc: 'Enterprise-grade security standards', icon: <ShieldCheck className="w-5 h-5" /> }
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
              Start Your <span className="text-teal-400">Journey.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Join the elite circle of healthcare professionals leveraging AI to
              define the future of clinical excellence.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 group">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-tight">{feature.title}</div>
                  <div className="text-sm text-gray-400 mt-1">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Right Panel - Registration Form */}
      <div className="auth-right relative flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MedAI</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Create account</h2>
            <p className="text-gray-500 font-medium">Get started with your free clinical workspace today</p>
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
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-teal-500 transition-colors">
                  <User className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Dr. John Smith"
                  className="input-field pl-12 h-14"
                  required
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
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
                    className="input-field pl-12 h-14 text-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Confirm
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pl-12 h-14 text-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-12 text-center text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

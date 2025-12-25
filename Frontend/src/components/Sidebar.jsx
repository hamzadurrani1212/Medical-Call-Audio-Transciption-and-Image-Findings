import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import {
  LayoutDashboard,
  Mic,
  ScanLine,
  FileText,
  Settings,
  LogOut,
  Activity
} from 'lucide-react'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/transcription',
      icon: Mic,
      label: 'Transcription'
    },
    {
      path: '/image-analysis',
      icon: ScanLine,
      label: 'Image Analysis'
    },
    {
      path: '/reports',
      icon: FileText,
      label: 'Reports'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings'
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="w-72 flex flex-col h-full bg-white border-r border-gray-100 shadow-sm z-50">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-8 border-b border-gray-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">MedAI</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active
                  ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20 active-nav-link'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`font-bold tracking-wide ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}>{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm shadow-black/20" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-6 border-t border-gray-50 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full h-14 flex items-center gap-4 px-6 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-bold tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
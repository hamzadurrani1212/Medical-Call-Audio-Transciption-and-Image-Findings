import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  ScanLine,
  FileText,
  TrendingUp,
  Zap,
  Activity,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { analyticsAPI, reportsAPI } from '../api/api'
import { useAuth } from '../components/AuthProvider'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_reports: 0,
    total_images: 0,
    username: user?.full_name || user?.username || 'Doctor',
    recent_activity: []
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsAPI.get()
        setStats(prev => ({
          ...prev,
          total_reports: response.data.total_reports || 0,
          total_images: response.data.total_images || 0,
          recent_activity: response.data.recent_activity || []
        }))
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const statCards = [
    {
      label: 'Transcriptions',
      value: stats.total_reports,
      trend: '+12.5%',
      icon: Mic,
      color: 'blue'
    },
    {
      label: 'Imaging Analysis',
      value: stats.total_images,
      trend: '+8.2%',
      icon: ScanLine,
      color: 'teal'
    },
    {
      label: 'Total Reports',
      value: stats.total_reports + stats.total_images,
      trend: '+15.3%',
      icon: FileText,
      color: 'green'
    }
  ]

  const quickActions = [
    {
      title: 'New Transcription',
      desc: 'Start a live patient consultation',
      icon: Mic,
      path: '/transcription',
      color: 'blue'
    },
    {
      title: 'Analyze Imaging',
      desc: 'Process MRI, CT or X-Ray scans',
      icon: ScanLine,
      path: '/image-analysis',
      color: 'teal'
    },
    {
      title: 'Generate Combined',
      desc: 'Create multi-modal medical report',
      icon: Sparkles,
      path: '/reports',
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-12 animate-in pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-teal-600">Dr. {stats.username}</span>
          </h1>
          <p className="text-gray-500 text-lg mt-2 font-medium">Here's what's happening with your medical AI dashboard today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Calendar className="w-5 h-5 text-teal-500" />
          <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <div key={i} className="card-luxury p-8 group">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-4xl font-black text-gray-900">{stat.value}</h3>
                <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.trend}</span>
                  <span className="text-gray-400 font-medium ml-1">vs last week</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg ${stat.color === 'blue' ? 'bg-blue-50 text-blue-500 shadow-blue-500/10' :
                stat.color === 'teal' ? 'bg-teal-50 text-teal-500 shadow-teal-500/10' :
                  'bg-green-50 text-green-500 shadow-green-500/10'
                }`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="card-luxury p-6 flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${action.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  action.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                  <action.icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg">{action.title}</h4>
                  <p className="text-gray-500 font-medium text-sm">{action.desc}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
          <button className="text-teal-600 font-bold hover:underline underline-offset-4 decoration-2">View History</button>
        </div>
        <div className="space-y-6">
          {stats.recent_activity && stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((item) => (
              <div key={item.id} className="card-luxury p-6 flex items-center justify-between group cursor-pointer hover:border-teal-200 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${item.type === 'report' ? 'bg-blue-50 group-hover:bg-blue-500' : 'bg-teal-50 group-hover:bg-teal-500'}`}>
                    {item.type === 'report' ? (
                      <Mic className={`w-7 h-7 transition-colors duration-300 ${item.type === 'report' ? 'text-blue-600 group-hover:text-white' : 'text-teal-600 group-hover:text-white'}`} />
                    ) : (
                      <ScanLine className={`w-7 h-7 transition-colors duration-300 ${item.type === 'report' ? 'text-blue-600 group-hover:text-white' : 'text-teal-600 group-hover:text-white'}`} />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h5>
                    <p className="text-sm text-gray-500 font-medium">{item.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-black uppercase rounded-full mb-1">
                      {item.status}
                    </div>
                    {item.date && (
                      <span className="text-sm font-bold text-gray-400">
                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:text-white transition-all duration-300 ${item.type === 'report' ? 'group-hover:bg-blue-500' : 'group-hover:bg-teal-500'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No recent activity found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
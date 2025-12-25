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
    username: user?.full_name || user?.username || 'Doctor'
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-luxury p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
            <button className="text-teal-600 font-bold hover:underline underline-offset-4 decoration-2">View History</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <Activity className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Patient Consultation - Case #{4092 + item}</h5>
                    <p className="text-sm text-gray-500 font-medium leading-none mt-1">Transcription & Report successful</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400">2h ago</span>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full">Completed</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-teal-gradient p-8 rounded-[2rem] text-white shadow-2xl shadow-teal-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <Zap className="w-12 h-12 mb-6 text-teal-100" />
              <h3 className="text-2xl font-black mb-2">Pro Tip</h3>
              <p className="text-teal-50 font-medium leading-relaxed mb-6">You can now analyze imaging and transcription in a single report for better clinical insight.</p>
              <button className="bg-white text-teal-600 px-6 py-3 rounded-xl font-black shadow-xl shadow-black/10 hover:scale-105 transition-transform">Try Combined Analysis</button>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-teal-900/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
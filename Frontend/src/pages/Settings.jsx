import React, { useState } from 'react'
import {
    User,
    Mail,
    Phone,
    Building,
    Camera,
    Bell,
    Shield,
    Globe,
    Moon,
    ChevronRight,
    Check
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

const Settings = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        reports: true
    })

    const [formData, setFormData] = useState({
        fullName: user?.full_name || 'Dr. Sarah Wilson',
        email: user?.username || 'sarah.wilson@hospital.com',
        phone: '+1 (555) 123-4567',
        organization: 'Metropolitan Medical Center'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-8 animate-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'profile'
                                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-3 font-semibold">
                            <User className="w-5 h-5" />
                            <span>Profile Information</span>
                        </div>
                        {activeTab === 'profile' && <ChevronRight className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications'
                                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-3 font-semibold">
                            <Bell className="w-5 h-5" />
                            <span>Notifications</span>
                        </div>
                        {activeTab === 'notifications' && <ChevronRight className="w-4 h-4" />}
                    </button>

                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-3 font-semibold">
                            <Shield className="w-5 h-5" />
                            <span>Security</span>
                        </div>
                    </button>

                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-3 font-semibold">
                            <Globe className="w-5 h-5" />
                            <span>System Preferences</span>
                        </div>
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'profile' && (
                        <div className="card p-8 space-y-8 animate-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                    <p className="text-sm text-gray-500">Update your personal and professional details</p>
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                                        {formData.fullName.charAt(0)}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:shadow-md transition-all">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <button className="btn-secondary px-4 py-2 text-sm h-auto mb-2">Change Photo</button>
                                    <p className="text-xs text-gray-400 font-medium">JPG, PNG. Max 2MB</p>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Organization</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button className="btn-primary px-8 shadow-teal-500/10">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card p-8 space-y-8 animate-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                                    <p className="text-sm text-gray-500">Configure how you receive updates and alerts</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { id: 'email', title: 'Email Notifications', desc: 'Receive daily report summaries via email' },
                                    { id: 'push', title: 'Push Notifications', desc: 'Real-time alerts for system events' },
                                    { id: 'reports', title: 'Report Updates', desc: 'Get notified when a report finishes processing' }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(item.id)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id] ? 'bg-teal-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.id] ? 'translate-x-6' : ''
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings

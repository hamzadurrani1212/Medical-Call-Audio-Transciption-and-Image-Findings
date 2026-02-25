import React, { useState, useEffect } from 'react'
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
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import { usersAPI, getFullImageUrl } from '../api/api'

const Settings = () => {
    const { user, updateUserData } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        reports: true
    })

    const [formData, setFormData] = useState({
        fullName: user?.full_name || '',
        email: user?.username || '', // Note: username is used as email in this flow
        phone: user?.phone || '',
        organization: user?.organization || ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Sync formData with user once it's available
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.full_name || '',
                email: user.username || '',
                phone: user.phone || '',
                organization: user.organization || ''
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const response = await usersAPI.updateMe({
                full_name: formData.fullName,
                phone: formData.phone,
                organization: formData.organization
            })

            updateUserData(response.data)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error) {
            console.error('Update error:', error)
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            await usersAPI.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            })
            setMessage({ type: 'success', text: 'Password changed successfully!' })
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            console.error('Password change error:', error)
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to change password' })
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formDataFile = new FormData()
        formDataFile.append('file', file)

        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const response = await usersAPI.uploadAvatar(formDataFile)
            updateUserData({ profile_picture_url: response.data.profile_picture_url })
            setMessage({ type: 'success', text: 'Profile picture updated!' })
        } catch (error) {
            console.error('Avatar upload error:', error)
            setMessage({ type: 'error', text: 'Failed to upload profile picture' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in pb-12">
            {/* Header */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Messages */}
            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-bold text-sm tracking-wide">{message.text}</p>
                </div>
            )}

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

                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'security'
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-3 font-semibold">
                            <Shield className="w-5 h-5" />
                            <span>Security</span>
                        </div>
                        {activeTab === 'security' && <ChevronRight className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'preferences'
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-3 font-semibold">
                            <Globe className="w-5 h-5" />
                            <span>System Preferences</span>
                        </div>
                        {activeTab === 'preferences' && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'profile' && (
                        <div className="card p-8 space-y-8 animate-in text-gray-900">
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
                                    {user?.profile_picture_url ? (
                                        <img
                                            src={getFullImageUrl(user.profile_picture_url)}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-teal-500/20"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                                            {formData.fullName.charAt(0) || user?.username?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:shadow-md transition-all cursor-pointer">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                                    </label>
                                </div>
                                <div>
                                    <label className="btn-secondary px-4 py-2 text-sm h-auto mb-2 cursor-pointer inline-block">
                                        Change Photo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                                    </label>
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
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Address (Username)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-50 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="input-field pl-12 bg-gray-50 cursor-not-allowed opacity-70"
                                            title="Email (Username) cannot be changed here"
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
                                            placeholder="+1 (555) 000-0000"
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
                                            placeholder="Hospital or Clinic name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="btn-primary px-8 shadow-teal-500/10 flex items-center gap-2 font-bold tracking-wide"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card p-8 space-y-8 animate-in text-gray-900">
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

                    {activeTab === 'security' && (
                        <div className="card p-8 space-y-8 animate-in text-gray-900">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Security</h2>
                                    <p className="text-sm text-gray-500">Update your password and secure your account</p>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="btn-primary w-full shadow-teal-500/10 flex items-center justify-center gap-2 font-bold tracking-wide"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="card p-8 space-y-8 animate-in text-gray-900">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">System Preferences</h2>
                                    <p className="text-sm text-gray-500">Customize your interface and experience</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent">
                                    <div className="flex items-center gap-3">
                                        <Moon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Dark Mode</h3>
                                            <p className="text-sm text-gray-500">Adjust the interface for better night viewing</p>
                                        </div>
                                    </div>
                                    <button className="w-12 h-6 rounded-full bg-gray-300 relative transition-all">
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Language</h3>
                                            <p className="text-sm text-gray-500">Select your preferred system language</p>
                                        </div>
                                    </div>
                                    <select className="bg-transparent font-bold text-teal-600 outline-none cursor-pointer">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>Urdu</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings

import React from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import { useAuth } from './AuthProvider'

const Header = () => {
    const { user } = useAuth()

    return (
        <header className="h-20 flex items-center justify-end px-8 bg-white border-b border-gray-100">
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                        D
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900">Dr. Sarah Wilson</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

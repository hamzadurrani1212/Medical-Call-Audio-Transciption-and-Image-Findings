import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    MessageSquare,
    Send,
    Search,
    User as UserIcon,
    Phone,
    Video,
    MoreVertical,
    Activity,
    Check,
    CheckCheck,
    Plus,
    X,
    Users,
    Stethoscope,
    Heart
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../components/AuthProvider'
import { chatsAPI, createChatWebSocket, usersAPI, getFullImageUrl } from '../api/api'

const Messages = () => {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    // New Chat Modal state
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [creatingChat, setCreatingChat] = useState(false)

    const wsRef = useRef(null)
    const messagesEndRef = useRef(null)
    const searchInputRef = useRef(null)
    const searchDebounceRef = useRef(null)

    // Fetch initial chats list
    useEffect(() => {
        fetchChats()
    }, [])

    // Setup WebSocket connection
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token) return

        wsRef.current = createChatWebSocket(
            token,
            (data) => {
                if (data.type === 'new_message') {
                    const msg = data.data
                    // Add to current open messages if it belongs to selected chat
                    setMessages(prev => {
                        // Check if we already have it (to prevent double-rendering if we sent it)
                        if (prev.find(m => m._id === msg._id)) return prev

                        // If it belongs to the active chat, append it
                        if (selectedChat && msg.chat_id === selectedChat._id) {
                            return [...prev, msg]
                        }
                        return prev
                    })

                    // Flash update the chat list to show new last_message/timestamp
                    fetchChats() // Easy way to refresh the sidebar
                }
            },
            (err) => console.error("WS Error:", err),
            () => console.log("WS Connected"),
            () => console.log("WS Disconnected")
        )

        return () => {
            if (wsRef.current) wsRef.current.close()
        }
    }, [selectedChat])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Auto-focus search input when modal opens
    useEffect(() => {
        if (showNewChatModal) {
            setTimeout(() => searchInputRef.current?.focus(), 100)
        } else {
            setSearchQuery('')
            setSearchResults([])
        }
    }, [showNewChatModal])

    // Debounced search
    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

        if (!value.trim()) {
            setSearchResults([])
            setSearchLoading(false)
            return
        }

        setSearchLoading(true)
        searchDebounceRef.current = setTimeout(async () => {
            try {
                const response = await usersAPI.searchUsers(value.trim())
                setSearchResults(response.data)
            } catch (error) {
                console.error('Search failed:', error)
                toast.error('Failed to search users')
            } finally {
                setSearchLoading(false)
            }
        }, 350)
    }, [])

    const fetchChats = async () => {
        try {
            const response = await chatsAPI.getUserChats()
            setChats(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch chats:', error)
            toast.error('Could not load conversations')
            setLoading(false)
        }
    }

    const loadChat = async (chat) => {
        setSelectedChat(chat)
        try {
            const response = await chatsAPI.getChatMessages(chat._id)
            setMessages(response.data)
        } catch (error) {
            console.error('Failed to load messages:', error)
            toast.error('Failed to load chat history')
        }
    }

    const handleStartChat = async (targetUser) => {
        setCreatingChat(true)
        try {
            const response = await chatsAPI.createChat({ participant_id: targetUser.id })
            const newChat = response.data

            // Close modal
            setShowNewChatModal(false)

            // Refresh chats list
            await fetchChats()

            // Build an enriched chat object so the UI can display the other participant
            const enrichedChat = {
                ...newChat,
                other_participant: {
                    id: targetUser.id,
                    full_name: targetUser.full_name,
                    role: targetUser.role
                }
            }

            // Select and open the new chat
            loadChat(enrichedChat)
            toast.success(`Chat started with ${targetUser.full_name}`)
        } catch (error) {
            console.error('Failed to create chat:', error)
            toast.error('Failed to start conversation')
        } finally {
            setCreatingChat(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedChat) return

        setSending(true)
        try {
            if (wsRef.current) {
                // Send via WebSocket
                wsRef.current.send({
                    action: "send_message",
                    payload: {
                        chat_id: selectedChat._id,
                        content: newMessage.trim()
                    }
                })
                setNewMessage('')
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getRoleIcon = (role) => {
        if (role === 'patient') return <Heart className="w-3 h-3" />
        return <Stethoscope className="w-3 h-3" />
    }

    const getRoleBadgeColor = (role) => {
        if (role === 'patient') return 'bg-rose-100 text-rose-600'
        return 'bg-blue-100 text-blue-600'
    }

    return (
        <div className="flex flex-row gap-6 h-[calc(100vh-8rem)] min-h-[500px] animate-in overflow-hidden">

            {/* Sidebar - Chat List */}
            <div className="card w-[350px] flex flex-col h-full bg-white shadow-sm overflow-hidden flex-shrink-0">
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                                {chats.length}
                            </div>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 hover:scale-105 active:scale-95 transition-all"
                                title="New Chat"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="input-field pl-12 h-12 bg-gray-50 border-transparent hover:border-gray-200"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <Activity className="w-8 h-8 animate-pulse text-teal-500" />
                            <p className="font-medium animate-pulse">Loading connections...</p>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 text-center px-6">
                            <MessageSquare className="w-12 h-12 opacity-50" />
                            <p className="font-medium">No conversations yet.</p>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="mt-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl font-semibold text-sm hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Start a Conversation
                            </button>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            const otherUser = chat.other_participant || {}
                            const isSelected = selectedChat?._id === chat._id

                            return (
                                <button
                                    key={chat._id}
                                    onClick={() => loadChat(chat)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left ${isSelected
                                        ? 'bg-teal-50 shadow-inner'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${isSelected ? 'bg-teal-500 text-white shadow-teal-500/30' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {otherUser.full_name?.charAt(0) || 'U'}
                                        </div>
                                        {/* Online indicator placeholder */}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold truncate ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                                                {otherUser.full_name || 'Unknown User'}
                                            </h3>
                                            <span className="text-xs font-semibold text-gray-400">
                                                {formatTime(chat.updated_at)}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${isSelected ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                                            {otherUser.role === 'patient' ? 'Patient' : 'Doctor'} Active
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {selectedChat ? (
                <div className="card flex-1 flex flex-col h-full bg-white shadow-sm overflow-hidden relative">

                    {/* Top Header */}
                    <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 flex-shrink-0 bg-white/50 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">
                                {selectedChat.other_participant?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">
                                    {selectedChat.other_participant?.full_name || 'Unknown User'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <p className="text-sm font-medium text-gray-500 capitalize">Online</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                                <Phone className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-2"></div>
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Background & Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 relative bg-gray-50/30">

                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                                <div className="w-16 h-16 rounded-3xl bg-teal-100 flex items-center justify-center text-teal-600">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <p className="text-gray-500 font-medium">This is the start of your encrypted conversation.</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMine = msg.sender_id === user._id

                                return (
                                    <div
                                        key={msg._id || index}
                                        className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {!isMine && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 mb-1">
                                                {selectedChat.other_participant?.full_name?.charAt(0) || 'U'}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            <div className={`px-6 py-4 rounded-3xl shadow-sm ${isMine
                                                ? 'bg-teal-500 text-white rounded-br-sm'
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 px-2">
                                                <span className="text-[11px] font-bold text-gray-400">
                                                    {formatTime(msg.created_at)}
                                                </span>
                                                {isMine && (
                                                    msg.is_read ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-gray-300" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0 relative z-10">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a secure message..."
                                    className="w-full h-14 pl-6 pr-12 rounded-full border-2 border-gray-100 bg-gray-50 outline-none focus:border-teal-500 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="w-14 h-14 rounded-full bg-teal-500 flex flex-shrink-0 items-center justify-center text-white shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send className="w-5 h-5 ml-1" />
                            </button>
                        </form>
                    </div>

                </div>
            ) : (
                <div className="card flex-1 flex flex-col items-center justify-center bg-white shadow-sm border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 rounded-3xl bg-teal-50 flex items-center justify-center text-teal-500 mb-6 shadow-xl shadow-teal-500/10">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">MedAI Secure Messaging</h2>
                    <p className="text-gray-500 font-medium max-w-sm text-center mb-6">
                        Select a conversation from the sidebar or start a new one to begin real-time, encrypted communication.
                    </p>
                    <button
                        onClick={() => setShowNewChatModal(true)}
                        className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Start New Conversation
                    </button>
                </div>
            )}

            {/* ─── New Chat Modal ─── */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
                        onClick={() => setShowNewChatModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">New Conversation</h3>
                                    <p className="text-xs text-gray-400 font-medium">Search for a doctor or patient</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 border-b border-gray-50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search by name or username..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto p-2">
                            {searchLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-3">
                                    <Activity className="w-6 h-6 animate-pulse text-teal-500" />
                                    <p className="text-sm font-medium">Searching users...</p>
                                </div>
                            ) : searchQuery && searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-3">
                                    <UserIcon className="w-10 h-10 opacity-40" />
                                    <p className="text-sm font-medium">No users found for "{searchQuery}"</p>
                                </div>
                            ) : !searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-3">
                                    <Search className="w-10 h-10 opacity-30" />
                                    <p className="text-sm font-medium">Type a name to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleStartChat(result)}
                                            disabled={creatingChat}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-teal-50 transition-all duration-200 text-left group disabled:opacity-50"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-teal-500 flex items-center justify-center font-bold text-lg text-gray-600 group-hover:text-white transition-all shadow-sm">
                                                {result.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{result.full_name}</h4>
                                                <p className="text-sm text-gray-400 truncate">@{result.username}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(result.role)}`}>
                                                {getRoleIcon(result.role)}
                                                {result.role === 'patient' ? 'Patient' : 'Doctor'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-400 text-center font-medium">
                                Click on a user to start a secure conversation
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Messages

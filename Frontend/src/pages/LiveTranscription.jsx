import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Mic,
  MicOff,
  Save,
  Trash2,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  FileAudio,
  User,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react'
import useLiveTranscription from '../hooks/useLiveTranscription'
import { transcriptionAPI } from '../api/api'

const LiveTranscription = () => {
  const [sessionId] = useState(uuidv4())
  const [patientInfo, setPatientInfo] = useState({
    patientId: '',
    conversationType: 'consultation',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const {
    isRecording,
    isConnected,
    transcript,
    error,
    connectWebSocket,
    startRecording,
    stopRecording,
    disconnect,
    clearTranscript,
  } = useLiveTranscription()

  useEffect(() => {
    connectWebSocket(sessionId)
    return () => disconnect()
  }, [sessionId, connectWebSocket, disconnect])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPatientInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleStartRecording = () => {
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Not connected to transcription service' })
      return
    }
    startRecording()
    setMessage({ type: '', text: '' })
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleSaveReport = async () => {
    if (!transcript.trim()) {
      setMessage({ type: 'warning', text: 'No transcript to save' })
      return
    }

    setSaving(true)
    try {
      const result = await transcriptionAPI.summarize({
        transcript,
        patient_id: patientInfo.patientId,
        conversation_type: patientInfo.conversationType
      })

      if (result.data.success) {
        setMessage({ type: 'success', text: 'Medical report generated successfully!' })
        clearTranscript()
        setPatientInfo({ patientId: '', conversationType: 'consultation', notes: '' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate medical report' })
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const conversationTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'surgery', label: 'Surgery Consultation' }
  ]

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Live Transcription</h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">Real-time medical audio transcription & AI summarization</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${isConnected ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
          }`}>
          {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <span className="font-bold text-sm">{isConnected ? 'Service Connected' : 'Service Offline'}</span>
        </div>
      </div>

      {/* Messages */}
      {(error || message.text) && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
            message.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
              'bg-red-50 border-red-100 text-red-700'
          }`}>
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold text-sm tracking-wide">{error || message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-8">
          {/* Patient Information Card */}
          <div className="card-luxury p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Consultation Profile</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1 tracking-wide">Patient Identifier</label>
                <input
                  type="text"
                  name="patientId"
                  value={patientInfo.patientId}
                  onChange={handleInputChange}
                  placeholder="e.g., P-102938"
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1 tracking-wide">Consultation Type</label>
                <select
                  name="conversationType"
                  value={patientInfo.conversationType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {conversationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1 tracking-wide">Clinical Context</label>
                <textarea
                  name="notes"
                  value={patientInfo.notes}
                  onChange={handleInputChange}
                  placeholder="Briefly state clinical intent..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Recording Status Card */}
          <div className="card-luxury p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Mic className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Session Control</h2>
            </div>

            <div className="space-y-4 pt-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!isConnected}
                  className="btn-primary w-full h-14 text-lg shadow-xl shadow-teal-500/20 disabled:opacity-50 group hover:scale-[1.02] transition-transform"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  Start Transcription
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="w-full h-14 flex items-center justify-center text-lg bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <MicOff className="w-5 h-5 text-white" />
                  </div>
                  Stop Transcription
                </button>
              )}

              <button
                onClick={clearTranscript}
                disabled={!transcript}
                className="btn-secondary w-full h-14 font-black border-2 border-gray-100 hover:border-gray-200"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Reset Session
              </button>

              {transcript && (
                <button
                  onClick={handleSaveReport}
                  disabled={saving}
                  className="w-full h-14 mt-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden group"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Generate AI Summary
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Transcript */}
        <div className="lg:col-span-2">
          <div className="card-luxury p-8 h-full flex flex-col min-h-[700px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-50">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Transcription Stream</h2>
                  {isRecording && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black text-red-500 uppercase tracking-widest">Live Recording</span>
                    </div>
                  )}
                </div>
              </div>

              {transcript && (
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Session Volume</span>
                  <div className="flex gap-1 h-4 items-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`w-1 rounded-full transition-all duration-300 ${isRecording ? 'bg-teal-400' : 'bg-gray-100'}`} style={{ height: isRecording ? `${Math.random() * 100}%` : '20%' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 relative bg-gray-50/50 rounded-[2rem] border border-gray-100 p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/20 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/10 blur-3xl rounded-full" />

              <div className="relative h-full overflow-y-auto custom-scrollbar pr-4">
                {transcript ? (
                  <p className="text-gray-900 font-bold leading-[1.8] text-lg tracking-tight whitespace-pre-wrap">
                    {transcript}
                    {isRecording && <span className="inline-block w-1.5 h-6 bg-teal-500 ml-1 align-middle animate-pulse" />}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                      <Mic className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="text-xl font-black text-gray-900">Awaiting Audio Input</h4>
                      <p className="text-sm font-medium text-gray-500 mt-2">Initialize the transcription session to begin capturing patient conversation data.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {transcript && (
              <div className="mt-6 flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Word Count</span>
                    <span className="text-lg font-black text-gray-900">{transcript.split(' ').filter(w => w).length}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Character Count</span>
                    <span className="text-lg font-black text-gray-900">{transcript.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none">AI Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTranscription
import { useState, useRef, useCallback, useEffect } from 'react'
import { createWebSocket } from '../api/api'

export const useLiveTranscription = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  const websocket = useRef(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const connectWebSocket = useCallback((sessionId) => {
    try {
      const wsHelper = createWebSocket(
        sessionId,
        (data) => {
          if (data.type === 'transcript') {
            if (data.is_historical) {
              setTranscript(data.text)
            } else {
              setTranscript(prev => prev + ' ' + data.text)
            }
          } else if (data.type === 'error') {
            setError(data.message)
          }
        },
        (err) => {
          setError('WebSocket connection error')
          setIsConnected(false)
        },
        () => {
          setIsConnected(true)
          setError(null)
        },
        () => {
          setIsConnected(false)
        }
      )

      websocket.current = wsHelper
    } catch (err) {
      setError('Failed to connect to transcription service')
      console.error('Connection error:', err)
    }
  }, [])

  const isRecordingRef = useRef(isRecording)
  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecordingRef.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/ogg'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/mp4'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
          const reader = new FileReader()
          reader.onload = () => {
            if (websocket.current) {
              websocket.current.send({
                type: 'audio_chunk',
                data: reader.result.split(',')[1]
              })
            }
          }
          reader.readAsDataURL(event.data)
        }
      }

      recorder.onstop = () => {
        if (websocket.current) {
          websocket.current.send({ type: 'audio_end' })
        }
        stream.getTracks().forEach(track => track.stop())
        audioChunks.current = []
      }

      mediaRecorder.current = recorder
      recorder.start(1000)
      setIsRecording(true)

    } catch (err) {
      setError('Microphone access denied or not available')
      console.error('Recording error:', err)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (websocket.current) {
      websocket.current.close()
    }
    if (isRecordingRef.current) {
      stopRecording()
    }
    setIsConnected(false)
    setTranscript('')
    setError(null)
  }, [stopRecording])

  const clearTranscript = useCallback(() => {
    if (websocket.current) {
      websocket.current.send({ type: 'clear_transcript' })
    }
    setTranscript('')
  }, [])

  return {
    isRecording,
    isConnected,
    transcript,
    error,
    connectWebSocket,
    startRecording,
    stopRecording,
    disconnect,
    clearTranscript,
  }
}

export default useLiveTranscription
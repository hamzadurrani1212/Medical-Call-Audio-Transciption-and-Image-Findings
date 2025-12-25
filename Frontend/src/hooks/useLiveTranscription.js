import { useState, useRef, useCallback } from 'react'
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
            setTranscript(prev => prev + ' ' + data.text)
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)

          // Convert blob to base64 and send via WebSocket
          const reader = new FileReader()
          reader.onload = () => {
            if (websocket.current) {
              websocket.current.send({
                type: 'audio_chunk',
                data: reader.result.split(',')[1] // Remove data URL prefix
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

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        audioChunks.current = []
      }

      mediaRecorder.current = recorder
      recorder.start(1000) // Send data every second
      setIsRecording(true)

    } catch (err) {
      setError('Microphone access denied or not available')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const disconnect = () => {
    if (websocket.current) {
      websocket.current.close()
    }
    if (isRecording) {
      stopRecording()
    }
    setIsConnected(false)
    setTranscript('')
    setError(null)
  }

  const clearTranscript = () => {
    setTranscript('')
  }

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
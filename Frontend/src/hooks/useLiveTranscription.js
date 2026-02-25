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
  const mimeTypeRef = useRef('')

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
          } else if (data.type === 'warning') {
            console.warn('Transcription warning:', data.message)
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

      // Determine best supported mime type
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/ogg;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/ogg'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/mp4'
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = ''

      mimeTypeRef.current = mimeType
      console.log('Using audio mime type:', mimeType)

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})

      // Collect chunks - do NOT send individually
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      // On stop, combine all chunks into a single blob and send
      recorder.onstop = async () => {
        try {
          if (audioChunks.current.length > 0 && websocket.current) {
            // Create a proper audio blob from all chunks
            const audioBlob = new Blob(audioChunks.current, {
              type: mimeTypeRef.current || 'audio/webm'
            })

            console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type)

            // Convert blob to base64 and send
            const reader = new FileReader()
            reader.onload = () => {
              if (websocket.current) {
                const base64Data = reader.result.split(',')[1]
                // Send as complete audio data
                websocket.current.send({
                  type: 'audio_complete',
                  data: base64Data,
                  mimeType: audioBlob.type
                })
              }
            }
            reader.onerror = (err) => {
              console.error('FileReader error:', err)
              setError('Failed to process audio data')
            }
            reader.readAsDataURL(audioBlob)
          } else {
            console.warn('No audio chunks to send')
          }
        } catch (err) {
          console.error('Error processing audio:', err)
          setError('Failed to process recorded audio')
        } finally {
          stream.getTracks().forEach(track => track.stop())
          audioChunks.current = []
        }
      }

      mediaRecorder.current = recorder
      // Start recording - collect data every 500ms for smooth collection
      recorder.start(500)
      setIsRecording(true)
      // Clear any previous errors
      setError(null)

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

  const setLanguage = useCallback((language) => {
    if (websocket.current) {
      websocket.current.send({
        type: 'set_language',
        language: language
      })
    }
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
    setLanguage,
  }
}

export default useLiveTranscription
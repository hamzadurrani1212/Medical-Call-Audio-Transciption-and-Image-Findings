"""
MedAI - WebSocket Transcription Routes
"""
import base64
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import settings
from app.services import manager, transcribe_audio

router = APIRouter(tags=["Transcription"])


@router.websocket("/ws/transcribe/{session_id}")
async def websocket_transcribe(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time transcription"""
    await manager.connect(websocket, session_id)
    
    # Send existing transcript if any
    session = manager.get_session(session_id)
    if session and session.transcript:
        await manager.send_message({
            "type": "transcript",
            "text": session.transcript,
            "session_id": session_id,
            "is_historical": True
        }, session_id)
        
    audio_buffer = bytearray()
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "audio_chunk":
                # Receive audio chunk
                audio_b64 = data.get("data")
                if not audio_b64:
                    continue
                    
                try:
                    chunk = base64.b64decode(audio_b64)
                    
                    # Safety check: Prevent buffer from growing indefinitely
                    if len(audio_buffer) + len(chunk) > settings.max_audio_size:
                        await manager.send_message({
                            "type": "error",
                            "message": "Audio buffer limit exceeded"
                        }, session_id)
                        audio_buffer.clear()
                        continue
                        
                    audio_buffer.extend(chunk)
                except Exception as e:
                    await manager.send_message({
                        "type": "error",
                        "message": "Audio decoding failed"
                    }, session_id)
            
            elif message_type == "audio_end":
                # Process audio and transcribe
                if audio_buffer:
                    try:
                        transcript = await transcribe_audio(bytes(audio_buffer))
                        await manager.add_transcript(session_id, transcript)
                        
                        await manager.send_message({
                            "type": "transcript",
                            "text": transcript,
                            "timestamp": datetime.utcnow().isoformat(),
                            "session_id": session_id
                        }, session_id)
                        
                        audio_buffer.clear()
                        
                    except Exception as e:
                        await manager.send_message({
                            "type": "error",
                            "message": "Transcription failed",
                            "details": str(e)
                        }, session_id)
                else:
                    await manager.send_message({
                        "type": "warning",
                        "message": "No audio data received"
                    }, session_id)
            
            elif message_type == "patient_info":
                # Update patient info
                await manager.update_patient_info(session_id, data)
                await manager.send_message({
                    "type": "patient_info_updated",
                    "message": "Patient information updated"
                }, session_id)
            
            elif message_type == "ping":
                # Heartbeat
                await manager.send_message({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }, session_id)
            
            elif message_type == "clear_transcript":
                # Clear transcript
                session = manager.get_session(session_id)
                if session is not None:
                    session.transcript = ""
                    await manager.send_message({
                        "type": "transcript_cleared"
                    }, session_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        manager.disconnect(session_id)

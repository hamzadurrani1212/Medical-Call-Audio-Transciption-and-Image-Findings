"""
MedAI - WebSocket Connection Manager
Real-time Transcription Session Management
"""
import logging
from datetime import datetime
from typing import Dict, Optional
from fastapi import WebSocket

from app.schemas import ConversationSession

logger = logging.getLogger("MedAI.WebSocket")


class ConnectionManager:
    """Manages WebSocket connections for transcription sessions"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_data: Dict[str, ConversationSession] = {}
        self.connection_times: Dict[str, datetime] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str, doctor_id: str = "default"):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.connection_times[session_id] = datetime.utcnow()
        
        if session_id not in self.session_data:
            self.session_data[session_id] = ConversationSession(
                session_id=session_id,
                doctor_id=doctor_id,
                transcript=""
            )
        
        logger.info(f"WebSocket connected: {session_id}")
    
    def disconnect(self, session_id: str):
        """Handle WebSocket disconnection"""
        connection_time = self.connection_times.get(session_id)
        duration = datetime.utcnow() - connection_time if connection_time else None
        
        self.active_connections.pop(session_id, None)
        self.connection_times.pop(session_id, None)
        self.session_data.pop(session_id, None)
        
        logger.info(f"WebSocket disconnected: {session_id} (duration: {duration})")
    
    async def send_message(self, message: dict, session_id: str):
        """Send a message to a specific session"""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connections"""
        for session_id in list(self.active_connections.keys()):
            await self.send_message(message, session_id)
    
    async def add_transcript(self, session_id: str, text: str):
        """Add text to session transcript"""
        if session_id in self.session_data:
            self.session_data[session_id].transcript += " " + text
    
    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Get session data"""
        return self.session_data.get(session_id)
    
    async def update_patient_info(self, session_id: str, patient_info: dict):
        """Update patient information for a session"""
        session = self.get_session(session_id)
        if session:
            session.patient_name = patient_info.get("patient_name")
            session.patient_age = patient_info.get("patient_age")
            session.patient_gender = patient_info.get("patient_gender")
            logger.info(f"Updated patient info for session {session_id}")
    
    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        return {
            "active_connections": len(self.active_connections),
            "sessions": list(self.session_data.keys()),
            "total_uptime": sum(
                [(datetime.utcnow() - t).total_seconds() 
                 for t in self.connection_times.values()],
                0
            )
        }
    
    def is_connected(self, session_id: str) -> bool:
        """Check if session is connected"""
        return session_id in self.active_connections


# Global connection manager instance
manager = ConnectionManager()

# Medical Transcription System

A comprehensive medical transcription system with real-time audio processing, AI-powered summarization, and medical image analysis.

## Features

- 🎙️ Real-time audio transcription using Whisper
- 🤖 AI-powered medical report generation with Gemini
- 🖼️ Medical image analysis (CT, MRI, X-Ray)
- 📊 Interactive doctor dashboard
- 📄 PDF report export
- 🔐 User authentication

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- WebSocket API

### Backend
- FastAPI
- MongoDB
- Whisper (OpenAI)
- Google Gemini AI
- WebSockets

## Setup Instructions

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
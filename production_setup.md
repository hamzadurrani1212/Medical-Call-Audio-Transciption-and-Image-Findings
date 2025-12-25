# MedAI - Production Deployment Guide

This document provides instructions for deploying the MedAI Medical System in a production environment.

## 1. System Requirements

- **Python**: 3.9+
- **Node.js**: 18.0+
- **MongoDB**: 6.0+
- **FFmpeg**: Required for audio processing (Whisper)

## 2. Environment Configuration

### Backend (`.env`)
Create a `.env` file in the root directory:

```env
APP_NAME=MedAI Medical System
ENVIRONMENT=production
DEBUG=False

# Security
JWT_SECRET=generate-a-strong-random-key
MONGODB_URL=mongodb://localhost:27017

# AI Services
GEMINI_API_KEY=your-gemini-api-key
WHISPER_MODEL_SIZE=base
```

### Frontend (`Frontend/.env`)
Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=https://your-domain.com/api/v1
VITE_WS_URL=wss://your-domain.com/ws/transcribe
```

## 3. Installation & Build

### Backend Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`

### Frontend Build
1. Navigate to directory: `cd Frontend`
2. Install: `npm install`
3. Build: `npm run build`
4. The assets will be generated in `Frontend/dist`.

## 4. Running the Application

### Option A: Unified Application (Recommended)
The backend is configured to serve the frontend from `/app`.
1. Ensure `Frontend/dist` exists.
2. Run the server: `python run.py`
3. Access at `http://localhost:8000/app`

### Option B: Production Server (Gunicorn/Uvicorn)
For better performance on Linux:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

## 5. Security Checklist

- [ ] Change `JWT_SECRET` to a unique, strong value.
- [ ] Ensure `DEBUG=False` in backend.
- [ ] Use `HTTPS` for all communication.
- [ ] Configure MongoDB with authentication and strong passwords.
- [ ] Set `COOKIE_SECURE=True` in `app/config.py` if using HTTPS.

## 6. Troubleshooting

- **Audio Errors**: Ensure FFmpeg is installed and accessible in the system PATH.
- **WebSocket Issues**: If using a reverse proxy (Nginx), ensure it is configured to handle WebSocket connections and headers.
- **Database Connection**: Verify MongoDB is running and the `MONGODB_URL` is correct.

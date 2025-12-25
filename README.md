# MedAI - Medical Transcription & Analysis System

A production-ready, enterprise-level AI-powered medical transcription and analysis platform.

## 🏥 Features

- **Real-time Audio Transcription**: Whisper-powered speech-to-text for medical consultations
- **AI Medical Summarization**: Gemini AI extracts structured medical information
- **Medical Image Analysis**: CT, MRI, X-Ray, and Ultrasound analysis with Gemini Vision
- **PDF Report Generation**: Professional medical reports with ReportLab
- **Patient Management**: Complete CRUD operations for patient records
- **JWT Authentication**: Secure authentication with refresh tokens
- **WebSocket Communication**: Real-time transcription streaming

## 📁 Project Structure

```
Medical Project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management
│   ├── database.py          # MongoDB connection
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py    # API router aggregation
│   │       ├── auth.py      # Authentication routes
│   │       ├── patients.py  # Patient management
│   │       ├── reports.py   # Medical reports
│   │       ├── images.py    # Image analysis
│   │       ├── transcription.py  # WebSocket transcription
│   │       └── analytics.py # Dashboard analytics
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py      # JWT & password utilities
│   │   └── exceptions.py    # Custom exceptions
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # User schemas
│   │   ├── patient.py       # Patient schemas
│   │   ├── report.py        # Report schemas
│   │   └── image.py         # Image analysis schemas
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py    # Gemini AI integration
│       ├── transcription_service.py  # Whisper transcription
│       ├── image_service.py # Medical image analysis
│       ├── pdf_service.py   # PDF generation
│       └── websocket_manager.py  # WebSocket management
├── reports/                  # Generated PDF reports
├── logs/                     # Application logs
├── run.py                    # Application runner
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- MongoDB 6.0+
- FFmpeg (for Whisper audio processing)

### Installation

1. Clone and navigate to the project:
```bash
cd "Medical Project"
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
copy .env.example .env
# Edit .env with your settings
```

5. Start MongoDB:
```bash
mongod
```

6. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get token |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| GET | `/api/v1/patients` | List patients |
| POST | `/api/v1/patients` | Create patient |
| POST | `/api/v1/reports` | Generate medical report |
| GET | `/api/v1/reports` | List reports |
| POST | `/api/v1/images/analyze` | Analyze medical image |
| WS | `/ws/transcribe/{session_id}` | Real-time transcription |
| GET | `/api/v1/analytics/health` | System health check |

## 🔐 Default Credentials

```
Username: doctor
Password: doctor123
```

## 🛠 Configuration

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | mongodb://localhost:27017 |
| `JWT_SECRET` | Secret key for JWT tokens | (change in production) |
| `GEMINI_API_KEY` | Google Gemini API key | (required for AI features) |
| `WHISPER_MODEL_SIZE` | Whisper model size | base |

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, contact the development team.

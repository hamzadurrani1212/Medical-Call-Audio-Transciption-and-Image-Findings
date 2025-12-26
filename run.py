"""
MedAI - Application Runner
"""
import uvicorn

if __name__ == "__main__":
    import os
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("DEBUG", "True").lower() == "true"
    
    import signal
    import sys
    
    def handle_exit(sig, frame):
        print("\n[INFO] Termination signal received. Shutting down...")
        sys.exit(0)
    
    # Register signal handlers for Windows
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
        access_log=True
    )

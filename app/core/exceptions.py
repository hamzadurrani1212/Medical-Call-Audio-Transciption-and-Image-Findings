"""
MedAI - Custom Exceptions
"""
from fastapi import HTTPException, status


class DatabaseConnectionError(HTTPException):
    """Raised when database connection is unavailable"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Database connection unavailable",
                "message": "Please check if MongoDB is running",
                "recovery_steps": [
                    "Ensure MongoDB service is running",
                    "Check MONGO_URI environment variable",
                    "Verify network connectivity"
                ]
            }
        )


class AuthenticationError(HTTPException):
    """Raised for authentication failures"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(HTTPException):
    """Raised for authorization failures"""
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class ValidationError(HTTPException):
    """Raised for validation failures"""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


class NotFoundError(HTTPException):
    """Raised when resource is not found"""
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found"
        )


class AIServiceError(HTTPException):
    """Raised when AI service fails"""
    def __init__(self, detail: str = "AI service error"):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail
        )


class FileProcessingError(HTTPException):
    """Raised when file processing fails"""
    def __init__(self, detail: str = "File processing failed"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


def check_database_connection(db):
    """Check if database connection is available"""
    if db is None:
        raise DatabaseConnectionError()

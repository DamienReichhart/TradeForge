from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import psutil
import time

from app.api.deps import get_db

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
def health_check(
    db: Session = Depends(get_db),
) -> Any:
    """
    Health check endpoint.
    """
    # Check database connection
    db_status = "healthy"
    try:
        # Execute a simple query to check DB connection
        db.execute("SELECT 1").scalar()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Get system metrics
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory_info = psutil.virtual_memory()
    disk_info = psutil.disk_usage('/')
    
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": db_status,
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory_info.percent,
            "disk_percent": disk_info.percent
        }
    } 
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ValidateExpressionRequest(BaseModel):
    """Request schema for validating a mathematical expression."""
    expression: str
    bot_id: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None 
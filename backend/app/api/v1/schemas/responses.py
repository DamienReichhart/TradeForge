from typing import Optional, Dict, List
from pydantic import BaseModel

class ExpressionValidationResponse(BaseModel):
    """Response schema for validating a mathematical expression."""
    valid: bool
    error: Optional[str] = None
    result: Optional[float] = None
    suggestions: Optional[Dict[str, List[str]]] = None 
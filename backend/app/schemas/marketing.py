from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Tutorial schemas
class TutorialBase(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = True

class TutorialCreate(TutorialBase):
    title: str
    slug: str
    content: str

class TutorialUpdate(TutorialBase):
    pass

class TutorialInDBBase(TutorialBase):
    id: int
    title: str
    slug: str
    content: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Tutorial(TutorialInDBBase):
    pass

# Opinion schemas
class OpinionBase(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    content: Optional[str] = None
    rating: Optional[int] = None
    is_published: Optional[bool] = True

class OpinionCreate(OpinionBase):
    name: str
    content: str
    rating: int

class OpinionUpdate(OpinionBase):
    pass

class OpinionInDBBase(OpinionBase):
    id: int
    name: str
    content: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class Opinion(OpinionInDBBase):
    pass 
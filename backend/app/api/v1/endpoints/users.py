from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser
from app.auth.jwt import get_password_hash, verify_password

router = APIRouter()

class TelegramUpdate(BaseModel):
    telegram_username: str

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve users. Only for superusers.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    user_in: schemas.UserUpdate,
) -> Any:
    """
    Update own user.
    """
    user_data = jsonable_encoder(current_user)
    update_data = user_in.dict(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for field in user_data:
        if field in update_data:
            setattr(current_user, field, update_data[field])
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/telegram", response_model=schemas.User)
def update_telegram_username(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    telegram_update: TelegramUpdate,
) -> Any:
    """
    Update user's Telegram username.
    """
    # Remove @ symbol if it's included
    telegram_username = telegram_update.telegram_username.lstrip('@')
    
    # Update the user's Telegram username
    current_user.telegram_username = telegram_username
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id. Only for superusers.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user 
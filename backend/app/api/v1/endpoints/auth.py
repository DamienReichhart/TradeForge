from datetime import timedelta
from typing import Any
import logging

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db
from app.core.config import settings
from app.auth.jwt import create_access_token, verify_password
from app.auth.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Register a new user.
    """
    try:
        logging.info(f"Received registration request: {user_in}")
        
        # Check if user with this email exists
        user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if user:
            error_msg = "A user with this email already exists."
            logging.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )
        
        # Check if user with this username exists
        user = db.query(models.User).filter(models.User.username == user_in.username).first()
        if user:
            error_msg = "A user with this username already exists."
            logging.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )
        
        # Create new user
        try:
            from app.auth.jwt import get_password_hash
            user = models.User(
                email=user_in.email,
                username=user_in.username,
                hashed_password=get_password_hash(user_in.password),
                first_name=user_in.first_name,
                last_name=user_in.last_name,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return user
        except Exception as e:
            logging.error(f"Error creating user: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error creating user: {str(e)}",
            )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected error in register_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Try to find user by username
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
        # Try to find user by email
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }

@router.post("/logout")
def logout(
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Logout the user. This is just a placeholder as we use JWT.
    With JWT, the client just needs to delete the token.
    """
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.User)
def get_current_user_info(
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get current user info.
    """
    return current_user 
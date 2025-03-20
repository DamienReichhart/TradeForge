from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser

router = APIRouter()

@router.get("/", response_model=List[schemas.Indicator])
def read_indicators(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all available indicators.
    """
    indicators = db.query(models.Indicator).filter(models.Indicator.is_active == True).offset(skip).limit(limit).all()
    return indicators

@router.post("/", response_model=schemas.Indicator)
def create_indicator(
    *,
    db: Session = Depends(get_db),
    indicator_in: schemas.IndicatorCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Create new indicator. Only for superusers.
    """
    # Check if indicator with this name already exists
    indicator = db.query(models.Indicator).filter(models.Indicator.name == indicator_in.name).first()
    if indicator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An indicator with this name already exists",
        )
    
    indicator = models.Indicator(
        name=indicator_in.name,
        description=indicator_in.description,
        parameters=indicator_in.parameters,
    )
    db.add(indicator)
    db.commit()
    db.refresh(indicator)
    return indicator

@router.get("/{indicator_id}", response_model=schemas.Indicator)
def read_indicator(
    *,
    db: Session = Depends(get_db),
    indicator_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get a specific indicator by ID.
    """
    indicator = db.query(models.Indicator).filter(models.Indicator.id == indicator_id).first()
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Indicator not found",
        )
    return indicator

@router.put("/{indicator_id}", response_model=schemas.Indicator)
def update_indicator(
    *,
    db: Session = Depends(get_db),
    indicator_id: int,
    indicator_in: schemas.IndicatorUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update an indicator. Only for superusers.
    """
    indicator = db.query(models.Indicator).filter(models.Indicator.id == indicator_id).first()
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Indicator not found",
        )
    
    update_data = indicator_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(indicator, field, update_data[field])
    
    db.add(indicator)
    db.commit()
    db.refresh(indicator)
    return indicator

@router.delete("/{indicator_id}", response_model=schemas.Indicator)
def delete_indicator(
    *,
    db: Session = Depends(get_db),
    indicator_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete an indicator. Only for superusers.
    """
    indicator = db.query(models.Indicator).filter(models.Indicator.id == indicator_id).first()
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Indicator not found",
        )
    
    # Don't actually delete, just mark as inactive
    indicator.is_active = False
    db.add(indicator)
    db.commit()
    db.refresh(indicator)
    return indicator 
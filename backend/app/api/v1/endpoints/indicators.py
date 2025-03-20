from typing import Any, List, Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser
from app.indicators.registry import IndicatorRegistry

router = APIRouter()

@router.get("/", response_model=List[schemas.Indicator])
def read_indicators(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    # Temporarily comment out authentication for testing
    # current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all available indicators.
    """
    indicators = db.query(models.Indicator).filter(models.Indicator.is_active == True).offset(skip).limit(limit).all()
    return indicators

@router.get("/available", response_model=List[Dict[str, Any]])
def read_available_indicators(
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all available indicator types with their parameters.
    """
    return IndicatorRegistry.get_all_indicators()

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
    
    # Check if the indicator type exists in registry
    try:
        # This will raise ValueError if indicator not found
        IndicatorRegistry.get_indicator(indicator_in.type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Indicator type '{indicator_in.type}' not found in registry",
        )
    
    indicator = models.Indicator(
        name=indicator_in.name,
        description=indicator_in.description,
        type=indicator_in.type,
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
    
    # If type is being changed, check if it exists in registry
    if indicator_in.type and indicator_in.type != indicator.type:
        try:
            # This will raise ValueError if indicator not found
            IndicatorRegistry.get_indicator(indicator_in.type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Indicator type '{indicator_in.type}' not found in registry",
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

@router.post("/sync", response_model=List[schemas.Indicator])
def sync_indicators(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Synchronize registered indicators with database. Only for superusers.
    """
    # Get all available indicators from registry
    available_indicators = IndicatorRegistry.get_all_indicators()
    
    # Get all indicators from database
    db_indicators = db.query(models.Indicator).all()
    db_indicator_types = {ind.type: ind for ind in db_indicators}
    
    # Create or update indicators
    updated_indicators = []
    for indicator_info in available_indicators:
        indicator_name = indicator_info["name"]
        
        if indicator_name in db_indicator_types:
            # Update existing indicator
            indicator = db_indicator_types[indicator_name]
            indicator.description = indicator_info["description"]
            indicator.parameters = indicator_info["default_parameters"]
            indicator.is_active = True
        else:
            # Create new indicator
            indicator = models.Indicator(
                name=indicator_name,
                type=indicator_name,  # Use name as type
                description=indicator_info["description"],
                parameters=indicator_info["default_parameters"],
                is_active=True
            )
            db.add(indicator)
        
        updated_indicators.append(indicator)
    
    db.commit()
    
    # Refresh all indicators
    for indicator in updated_indicators:
        db.refresh(indicator)
    
    return updated_indicators 
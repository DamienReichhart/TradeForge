from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser

router = APIRouter()

@router.get("/", response_model=List[schemas.Subscription])
def read_subscriptions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all subscription plans.
    """
    subscriptions = db.query(models.Subscription).filter(models.Subscription.is_active == True).offset(skip).limit(limit).all()
    return subscriptions

@router.post("/", response_model=schemas.Subscription)
def create_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_in: schemas.SubscriptionCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Create new subscription plan. Only for superusers.
    """
    subscription = models.Subscription(
        name=subscription_in.name,
        description=subscription_in.description,
        price=subscription_in.price,
        bot_limit=subscription_in.bot_limit,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.get("/{subscription_id}", response_model=schemas.Subscription)
def read_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
) -> Any:
    """
    Get a specific subscription by ID.
    """
    subscription = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    return subscription

@router.put("/{subscription_id}", response_model=schemas.Subscription)
def update_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    subscription_in: schemas.SubscriptionUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a subscription. Only for superusers.
    """
    subscription = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    update_data = subscription_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(subscription, field, update_data[field])
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.delete("/{subscription_id}", response_model=schemas.Subscription)
def delete_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a subscription. Only for superusers.
    """
    subscription = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Don't actually delete, just mark as inactive
    subscription.is_active = False
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.post("/upgrade", response_model=schemas.User)
def upgrade_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int = Body(...),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Upgrade current user's subscription.
    """
    subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.is_active == True
    ).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Here you would typically handle payment processing
    # For now, we're just updating the subscription
    
    current_user.subscription_id = subscription.id
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user 
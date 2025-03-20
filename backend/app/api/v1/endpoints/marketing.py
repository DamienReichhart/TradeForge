from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser

router = APIRouter()

# Tutorial endpoints
@router.get("/tutorials", response_model=List[schemas.Tutorial])
def read_tutorials(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all tutorials.
    """
    tutorials = db.query(models.Tutorial).filter(
        models.Tutorial.is_published == True
    ).offset(skip).limit(limit).all()
    
    return tutorials

@router.get("/tutorials/{slug}", response_model=schemas.Tutorial)
def read_tutorial(
    *,
    db: Session = Depends(get_db),
    slug: str,
) -> Any:
    """
    Get a specific tutorial by slug.
    """
    tutorial = db.query(models.Tutorial).filter(
        models.Tutorial.slug == slug,
        models.Tutorial.is_published == True
    ).first()
    
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found",
        )
    
    return tutorial

@router.post("/tutorials", response_model=schemas.Tutorial)
def create_tutorial(
    *,
    db: Session = Depends(get_db),
    tutorial_in: schemas.TutorialCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Create a new tutorial. Only for superusers.
    """
    # Check if tutorial with this slug already exists
    tutorial = db.query(models.Tutorial).filter(models.Tutorial.slug == tutorial_in.slug).first()
    if tutorial:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A tutorial with this slug already exists",
        )
    
    tutorial = models.Tutorial(
        title=tutorial_in.title,
        slug=tutorial_in.slug,
        summary=tutorial_in.summary,
        content=tutorial_in.content,
        is_published=tutorial_in.is_published,
    )
    
    db.add(tutorial)
    db.commit()
    db.refresh(tutorial)
    
    return tutorial

@router.put("/tutorials/{tutorial_id}", response_model=schemas.Tutorial)
def update_tutorial(
    *,
    db: Session = Depends(get_db),
    tutorial_id: int,
    tutorial_in: schemas.TutorialUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a tutorial. Only for superusers.
    """
    tutorial = db.query(models.Tutorial).filter(models.Tutorial.id == tutorial_id).first()
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found",
        )
    
    # If slug is being updated, check it doesn't conflict
    if tutorial_in.slug and tutorial_in.slug != tutorial.slug:
        exists = db.query(models.Tutorial).filter(
            models.Tutorial.slug == tutorial_in.slug,
            models.Tutorial.id != tutorial_id
        ).first()
        
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A tutorial with this slug already exists",
            )
    
    update_data = tutorial_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(tutorial, field, update_data[field])
    
    db.add(tutorial)
    db.commit()
    db.refresh(tutorial)
    
    return tutorial

@router.delete("/tutorials/{tutorial_id}", response_model=schemas.Tutorial)
def delete_tutorial(
    *,
    db: Session = Depends(get_db),
    tutorial_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a tutorial. Only for superusers.
    """
    tutorial = db.query(models.Tutorial).filter(models.Tutorial.id == tutorial_id).first()
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found",
        )
    
    db.delete(tutorial)
    db.commit()
    
    return tutorial

# Opinion endpoints
@router.get("/opinions", response_model=List[schemas.Opinion])
def read_opinions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all opinions.
    """
    opinions = db.query(models.Opinion).filter(
        models.Opinion.is_published == True
    ).offset(skip).limit(limit).all()
    
    return opinions

@router.post("/opinions", response_model=schemas.Opinion)
def create_opinion(
    *,
    db: Session = Depends(get_db),
    opinion_in: schemas.OpinionCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Create a new opinion. Only for superusers.
    """
    opinion = models.Opinion(
        name=opinion_in.name,
        company=opinion_in.company,
        position=opinion_in.position,
        content=opinion_in.content,
        rating=opinion_in.rating,
        is_published=opinion_in.is_published,
    )
    
    db.add(opinion)
    db.commit()
    db.refresh(opinion)
    
    return opinion

@router.put("/opinions/{opinion_id}", response_model=schemas.Opinion)
def update_opinion(
    *,
    db: Session = Depends(get_db),
    opinion_id: int,
    opinion_in: schemas.OpinionUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update an opinion. Only for superusers.
    """
    opinion = db.query(models.Opinion).filter(models.Opinion.id == opinion_id).first()
    if not opinion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opinion not found",
        )
    
    update_data = opinion_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(opinion, field, update_data[field])
    
    db.add(opinion)
    db.commit()
    db.refresh(opinion)
    
    return opinion

@router.delete("/opinions/{opinion_id}", response_model=schemas.Opinion)
def delete_opinion(
    *,
    db: Session = Depends(get_db),
    opinion_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete an opinion. Only for superusers.
    """
    opinion = db.query(models.Opinion).filter(models.Opinion.id == opinion_id).first()
    if not opinion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opinion not found",
        )
    
    db.delete(opinion)
    db.commit()
    
    return opinion 
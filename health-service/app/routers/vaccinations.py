from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vaccination
from app.schemas import (
    VaccinationCreate,
    VaccinationUpdate,
    VaccinationResponse
)

router = APIRouter(tags=["Vaccinations"])


@router.get(
    "/pets/{pet_id}/vaccinations",
    response_model=list[VaccinationResponse]
)
def get_pet_vaccinations(
    pet_id: str,
    db: Session = Depends(get_db)
):
    query = (
        select(Vaccination)
        .where(Vaccination.pet_id == pet_id)
        .order_by(Vaccination.vaccination_date.desc())
    )

    return db.scalars(query).all()


@router.get(
    "/vaccinations/{vaccination_id}",
    response_model=VaccinationResponse
)
def get_vaccination(
    vaccination_id: str,
    db: Session = Depends(get_db)
):
    vaccination = db.get(Vaccination, vaccination_id)

    if vaccination is None:
        raise HTTPException(
            status_code=404,
            detail="Vaccination not found"
        )

    return vaccination


@router.post(
    "/vaccinations",
    response_model=VaccinationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_vaccination(
    data: VaccinationCreate,
    db: Session = Depends(get_db)
):
    vaccination = Vaccination(**data.model_dump())

    db.add(vaccination)
    db.commit()
    db.refresh(vaccination)

    return vaccination


@router.put(
    "/vaccinations/{vaccination_id}",
    response_model=VaccinationResponse
)
def update_vaccination(
    vaccination_id: str,
    data: VaccinationUpdate,
    db: Session = Depends(get_db)
):
    vaccination = db.get(Vaccination, vaccination_id)

    if vaccination is None:
        raise HTTPException(
            status_code=404,
            detail="Vaccination not found"
        )

    for field, value in data.model_dump().items():
        setattr(vaccination, field, value)

    db.commit()
    db.refresh(vaccination)

    return vaccination


@router.delete(
    "/vaccinations/{vaccination_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_vaccination(
    vaccination_id: str,
    db: Session = Depends(get_db)
):
    vaccination = db.get(Vaccination, vaccination_id)

    if vaccination is None:
        raise HTTPException(
            status_code=404,
            detail="Vaccination not found"
        )

    db.delete(vaccination)
    db.commit()

    return Response(status_code=204)
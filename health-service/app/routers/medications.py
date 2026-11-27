from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Medication
from app.security import require_roles
from app.pet_client import verify_pet_access
from app.schemas import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse
)

router = APIRouter(tags=["Medications"])


@router.get(
    "/pets/{pet_id}/medications",
    response_model=list[MedicationResponse]
)
def get_pet_medications(
    pet_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles("OWNER", "VETERINARIAN")
    )
):
    pet = verify_pet_access(
        pet_id,
        current_user["token"]
    )

    query = (
        select(Medication)
        .where(Medication.pet_id == pet["id"])
        .order_by(Medication.start_date.desc())
    )

    return db.scalars(query).all()


@router.get(
    "/medications/{medication_id}",
    response_model=MedicationResponse
)
def get_medication(
    medication_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles("OWNER", "VETERINARIAN")
    )
):
    medication = db.get(Medication, medication_id)

    if medication is None:
        raise HTTPException(
            status_code=404,
            detail="Medication not found"
        )

    verify_pet_access(
        medication.pet_id,
        current_user["token"]
    )

    return medication


@router.post(
    "/medications",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_medication(
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles("VETERINARIAN")
    )
):
    pet = verify_pet_access(
        data.pet_id,
        current_user["token"]
    )

    medication_data = data.model_dump()
    medication_data["pet_id"] = pet["id"]
    medication_data["veterinarian_id"] = current_user["id"]

    medication = Medication(**medication_data)

    db.add(medication)
    db.commit()
    db.refresh(medication)

    return medication


@router.put(
    "/medications/{medication_id}",
    response_model=MedicationResponse
)
def update_medication(
    medication_id: str,
    data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles("VETERINARIAN")
    )
):
    medication = db.get(Medication, medication_id)

    if medication is None:
        raise HTTPException(
            status_code=404,
            detail="Medication not found"
        )

    if medication.veterinarian_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You cannot modify this medication"
        )

    verify_pet_access(
        medication.pet_id,
        current_user["token"]
    )

    for field, value in data.model_dump(
        exclude_unset=True
    ).items():
        if field not in ("veterinarian_id", "pet_id"):
            setattr(medication, field, value)

    db.commit()
    db.refresh(medication)

    return medication


@router.delete(
    "/medications/{medication_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_medication(
    medication_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles("VETERINARIAN")
    )
):
    medication = db.get(Medication, medication_id)

    if medication is None:
        raise HTTPException(
            status_code=404,
            detail="Medication not found"
        )

    if medication.veterinarian_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete this medication"
        )

    verify_pet_access(
        medication.pet_id,
        current_user["token"]
    )

    db.delete(medication)
    db.commit()

    return Response(status_code=204)
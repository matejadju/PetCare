from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vaccination, Medication
from app.schemas import HealthHistoryResponse
from app.security import require_roles
from app.pet_client import verify_pet_access

router = APIRouter(tags=["Health History"])


@router.get(
    "/pets/{pet_id}/health-history",
    response_model=HealthHistoryResponse
)
def get_health_history(
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

    vaccinations = db.scalars(
        select(Vaccination)
        .where(Vaccination.pet_id == pet["id"])
        .order_by(Vaccination.vaccination_date.desc())
    ).all()

    medications = db.scalars(
        select(Medication)
        .where(Medication.pet_id == pet["id"])
        .order_by(Medication.start_date.desc())
    ).all()

    return {
        "pet_id": pet["id"],
        "vaccinations": vaccinations,
        "medications": medications
    }
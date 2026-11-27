import httpx
from uuid import UUID
from fastapi import HTTPException

from app.config import PET_SERVICE_URL


def verify_pet_access(pet_id: str, token: str) -> dict:
    try:
        pet_id = str(UUID(str(pet_id)))
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Invalid pet ID"
        )

    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(
                f"{PET_SERVICE_URL}/pets/{pet_id}",
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Pet Service is unavailable"
        )

    errors = {
        401: "Invalid authentication token",
        403: "You do not have access to this pet",
        404: "Pet not found"
    }

    if response.status_code in errors:
        raise HTTPException(
            status_code=response.status_code,
            detail=errors[response.status_code]
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Pet Service returned an unexpected response"
        )

    return response.json()
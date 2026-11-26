from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class VaccinationBase(BaseModel):
    pet_id: str = Field(min_length=1, max_length=36)
    veterinarian_id: str = Field(min_length=1, max_length=36)
    vaccine_name: str = Field(min_length=1, max_length=150)
    vaccination_date: date
    next_due_date: date | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.next_due_date
            and self.next_due_date < self.vaccination_date
        ):
            raise ValueError(
                "Next due date cannot be before vaccination date."
            )

        return self


class VaccinationCreate(VaccinationBase):
    pass


class VaccinationUpdate(VaccinationBase):
    pass


class VaccinationResponse(VaccinationBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MedicationBase(BaseModel):
    pet_id: str = Field(min_length=1, max_length=36)
    veterinarian_id: str = Field(min_length=1, max_length=36)
    medication_name: str = Field(min_length=1, max_length=150)
    dosage: str = Field(min_length=1, max_length=100)
    start_date: date
    end_date: date | None = None
    instructions: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError(
                "End date cannot be before start date."
            )

        return self


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(MedicationBase):
    pass


class MedicationResponse(MedicationBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthHistoryResponse(BaseModel):
    pet_id: str
    vaccinations: list[VaccinationResponse]
    medications: list[MedicationResponse]
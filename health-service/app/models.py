from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import String, Text, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    pet_id: Mapped[str] = mapped_column(
        String(36), index=True
    )

    veterinarian_id: Mapped[str] = mapped_column(
        String(36), index=True
    )

    vaccine_name: Mapped[str] = mapped_column(String(150))

    vaccination_date: Mapped[date] = mapped_column(Date)

    next_due_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    pet_id: Mapped[str] = mapped_column(
        String(36), index=True
    )

    veterinarian_id: Mapped[str] = mapped_column(
        String(36), index=True
    )

    medication_name: Mapped[str] = mapped_column(String(150))

    dosage: Mapped[str] = mapped_column(String(100))

    start_date: Mapped[date] = mapped_column(Date)

    end_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    instructions: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
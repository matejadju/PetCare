import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  PawPrint,
  CalendarDays,
  Weight,
  Syringe,
  Pill,
  ClipboardList,
} from "lucide-react";

import { petApi } from "../api/pet.api";
import { getApiError } from "../utils/apiError";
import type { Pet } from "../types/pet";
import WeightHistory from "../components/WeightHistory";

import "../styles/health.css";
import "../styles/pets.css";

export default function PetDetails() {
  const { petId } = useParams<{ petId: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!petId) {
      return;
    }

    petApi
      .getPet(petId)
      .then((data) => {
        if (active) {
          setPet(data);
        }
      })
      .catch((error) => {
        if (active) {
          setError(getApiError(error, "Failed to load pet."));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [petId]);

  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="health-page">
      <Link to="/pets" className="pet-back-link">
        <ArrowLeft size={19} />
        Back to My Pets
      </Link>

      {loading ? (
        <div className="health-empty">
          <p>Loading pet details...</p>
        </div>
      ) : error || !pet ? (
        <div className="auth-error">{error || "Pet not found."}</div>
      ) : (
        <>
          <section className="pet-details-banner">
            <div className="pet-details-avatar">
              {pet.imageUrl ? (
                <img src={pet.imageUrl} alt={pet.name} />
              ) : (
                <PawPrint size={55} />
              )}
            </div>

            <div>
              <h1>{pet.name}</h1>
              <p>
                {pet.species} · {pet.breed || "Unknown breed"}
              </p>
              <span className="pet-gender">{pet.gender.toLowerCase()}</span>
            </div>
          </section>
          <WeightHistory
            key={pet.id}
            petId={pet.id}
            onWeightChange={(weight) =>
              setPet((previous) =>
                previous ? { ...previous, weight } : previous
              )
            }
          />

          <section className="pet-details-section">
            <h2>Pet information</h2>

            <div className="pet-details-grid">
              <div className="pet-detail-item">
                <PawPrint size={24} />
                <span>Species</span>
                <strong>{pet.species}</strong>
              </div>

              <div className="pet-detail-item">
                <PawPrint size={24} />
                <span>Breed</span>
                <strong>{pet.breed || "Not specified"}</strong>
              </div>

              <div className="pet-detail-item">
                <CalendarDays size={24} />
                <span>Birth date</span>
                <strong>{formatDate(pet.birthDate)}</strong>
              </div>

              <div className="pet-detail-item">
                <Weight size={24} />
                <span>Current weight</span>
                <strong>
                  {pet.weight != null ? `${pet.weight} kg` : "Not recorded"}
                </strong>
              </div>
            </div>
          </section>

          <section className="pet-details-section">
            <h2>Health records</h2>

            <div className="pet-details-grid">
              <Link
                to={`/vaccinations?petId=${pet.id}`}
                className="pet-detail-link"
              >
                <Syringe size={28} />
                <strong>Vaccinations</strong>
                <span>View vaccination records</span>
              </Link>

              <Link
                to={`/medications?petId=${pet.id}`}
                className="pet-detail-link"
              >
                <Pill size={28} />
                <strong>Medications</strong>
                <span>View prescribed medications</span>
              </Link>

              <Link
                to={`/health-history?petId=${pet.id}`}
                className="pet-detail-link"
              >
                <ClipboardList size={28} />
                <strong>Health History</strong>
                <span>View complete health history</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

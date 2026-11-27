import { useEffect, useState } from "react";
import {
  PawPrint,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Weight,
  Info,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { petApi } from "../api/pet.api";
import { getApiError } from "../utils/apiError";
import type { Pet } from "../types/pet";
import PetForm from "../components/PetForm";
import { Link } from "react-router-dom";

import "../styles/health.css";
import "../styles/pets.css";

export default function Pets() {
  const { user } = useAuth();

  const isOwner = user?.role === "OWNER";

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    let active = true;

    petApi
      .getPets()
      .then((data) => {
        if (active) {
          setPets(data);
        }
      })
      .catch((error) => {
        if (active) {
          setError(getApiError(error, "Failed to load pets."));
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
  }, [isOwner, user?.id]);

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

  const handleAdd = () => {
    setEditingPet(undefined);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingPet(undefined);
  };

  const handleSaved = (savedPet: Pet) => {
    setPets((previous) => {
      const exists = previous.some((pet) => pet.id === savedPet.id);

      if (exists) {
        return previous.map((pet) => (pet.id === savedPet.id ? savedPet : pet));
      }

      return [...previous, savedPet];
    });

    setSuccess(
      editingPet ? "Pet updated successfully." : "Pet added successfully."
    );
  };

  const handleDelete = async (pet: Pet) => {
    if (!isOwner) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${pet.name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(pet.id);
    setError("");
    setSuccess("");

    try {
      await petApi.deletePet(pet.id);

      setPets((previous) => previous.filter((item) => item.id !== pet.id));

      setSuccess("Pet deleted successfully.");
    } catch (error) {
      setError(getApiError(error, "Failed to delete pet."));
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOwner) {
    return (
      <div className="health-page">
        <div className="health-heading">
          <div>
            <h1>My Pets</h1>
            <p>Pet management</p>
          </div>
        </div>

        <div className="health-empty">
          <Info size={40} />

          <h3>Pet management is available to owners</h3>

          <p>
            Veterinarians can access pet information through their authorized
            patient records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="health-page">
      <div className="health-heading">
        <div>
          <h1>My Pets</h1>
          <p>Manage your pets and keep track of their information.</p>
        </div>

        {!formOpen && (
          <button
            className="primary-button"
            onClick={handleAdd}
            disabled={loading || deletingId !== null}
          >
            <Plus size={19} />
            Add pet
          </button>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      {success && <div className="profile-success">{success}</div>}

      <div className="health-summary">
        <div className="health-summary-icon">
          <PawPrint size={26} />
        </div>

        <div>
          <p>Total pets</p>
          <h2>{pets.length}</h2>
        </div>
      </div>

      {formOpen && (
        <PetForm
          key={editingPet?.id || "new"}
          pet={editingPet}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}

      <section className="health-records">
        <div className="health-section-heading">
          <h2>Your pets</h2>
        </div>

        {loading ? (
          <div className="health-empty">
            <p>Loading pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="health-empty">
            <PawPrint size={42} />
            <h3>No pets yet</h3>
            <p>Add your first pet to get started.</p>
          </div>
        ) : (
          <div className="pets-grid">
            {pets.map((pet) => (
              <article className="pet-card" key={pet.id}>
                <div className="pet-card-cover">
                  {pet.imageUrl ? (
                    <img src={pet.imageUrl} alt={pet.name} />
                  ) : (
                    <PawPrint size={64} />
                  )}

                  <span className="pet-species">{pet.species}</span>
                </div>

                <div className="pet-card-content">
                  <div className="pet-card-title">
                    <div>
                      <h2>{pet.name}</h2>
                      <p>{pet.breed || "Unknown breed"}</p>
                    </div>

                    <span className="pet-gender">
                      {pet.gender.toLowerCase()}
                    </span>
                  </div>

                  <div className="pet-card-info">
                    <div className="pet-info-item">
                      <CalendarDays size={20} />

                      <div>
                        <span>Birth date</span>
                        <strong>{formatDate(pet.birthDate)}</strong>
                      </div>
                    </div>

                    <div className="pet-info-item">
                      <Weight size={20} />

                      <div>
                        <span>Current weight</span>
                        <strong>
                          {pet.weight != null
                            ? `${pet.weight} kg`
                            : "Not recorded"}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <Link to={`/pets/${pet.id}`} className="pet-view-button">
                    <Info size={18} />
                    View details
                  </Link>
                  <div className="pet-card-actions">
                    <button
                      className="secondary-button"
                      onClick={() => handleEdit(pet)}
                      disabled={formOpen || deletingId !== null}
                    >
                      <Pencil size={17} />
                      Edit
                    </button>

                    <button
                      className="danger-outline-button"
                      onClick={() => handleDelete(pet)}
                      disabled={formOpen || deletingId !== null}
                    >
                      <Trash2 size={17} />
                      {deletingId === pet.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

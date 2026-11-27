import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Pencil,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import EditProfile from "../components/EditProfile";
import "../styles/profile.css";
import ChangePassword from "../components/ChangePassword";
import { LockKeyhole } from "lucide-react";
import DeleteAccount from "../components/DeleteAccount";
import { Trash2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div className="page-heading">
          <h1>My Profile</h1>
          <p>Manage your personal information and account.</p>
        </div>

        {!editing && (
          <button className="primary-button" onClick={() => setEditing(true)}>
            <Pencil size={18} />
            Edit profile
          </button>
        )}
      </div>

      <section className="profile-banner">
        <div className="profile-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>

          <span className="profile-role">
            <ShieldCheck size={16} />
            {user.role === "OWNER" ? "Pet Owner" : "Veterinarian"}
          </span>
        </div>
      </section>

      {editing ? (
        <EditProfile onClose={() => setEditing(false)} />
      ) : (
        <section className="profile-card">
          <h2>Personal information</h2>

          <p className="profile-description">
            Your personal and contact details.
          </p>

          <div className="profile-grid">
            <div className="profile-field">
              <UserRound size={21} />
              <div>
                <span>Full name</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="profile-field">
              <Mail size={21} />
              <div>
                <span>Email address</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="profile-field">
              <Phone size={21} />
              <div>
                <span>Phone number</span>
                <strong>{user.phone || "Not provided"}</strong>
              </div>
            </div>

            <div className="profile-field">
              <ShieldCheck size={21} />
              <div>
                <span>Account type</span>
                <strong>
                  {user.role === "OWNER" ? "Pet Owner" : "Veterinarian"}
                </strong>
              </div>
            </div>

            <div className="profile-field">
              <CalendarDays size={21} />
              <div>
                <span>Member since</span>
                <strong>
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}
      {changingPassword ? (
        <ChangePassword onClose={() => setChangingPassword(false)} />
      ) : (
        <section className="profile-card security-card">
          <h2>Account Security</h2>

          <p className="profile-description">
            Manage your password and account security.
          </p>

          <div className="security-row">
            <div className="security-info">
              <div className="security-icon">
                <LockKeyhole size={23} />
              </div>

              <div>
                <h3>Password</h3>
                <p>Update your account password.</p>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={() => setChangingPassword(true)}
            >
              Change password
            </button>
          </div>
        </section>
      )}
      {deletingAccount ? (
        <DeleteAccount onClose={() => setDeletingAccount(false)} />
      ) : (
        <section className="profile-card danger-card">
          <h2>Danger Zone</h2>

          <p className="profile-description">
            Manage permanent account actions.
          </p>

          <div className="security-row">
            <div className="security-info">
              <div className="security-icon danger-icon">
                <Trash2 size={23} />
              </div>

              <div>
                <h3>Delete account</h3>
                <p>Permanently delete your PetCare account.</p>
              </div>
            </div>

            <button
              className="danger-outline-button"
              onClick={() => setDeletingAccount(true)}
            >
              Delete account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

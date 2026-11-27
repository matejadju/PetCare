import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import "./styles/profile.css";
import "./styles/health.css";
import "./styles/veterinarians.css";

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Pets = lazy(() => import('./pages/Pets'));
const PetDetails = lazy(() => import('./pages/PetDetails'));
const Vaccinations = lazy(() => import('./pages/Vaccinations'));
const Medications = lazy(() => import('./pages/Medications'));
const HealthHistory = lazy(() => import('./pages/HealthHistory'));
const Veterinarians = lazy(() => import('./pages/Veterinarians'));
const Appointments = lazy(() => import('./pages/Appointments'));

function PageLoader() {
    return (
        <div className="page-loader" role="status">
            <div className="page-loader-spinner" />
            <p>Loading page...</p>
        </div>
    );
}

export default function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/pets"
                            element={<Pets />}
                        />

                        <Route
                            path="/pets/:petId"
                            element={<PetDetails />}
                        />

                        <Route
                            path="/vaccinations"
                            element={<Vaccinations />}
                        />

                        <Route
                            path="/medications"
                            element={<Medications />}
                        />

                        <Route
                            path="/health-history"
                            element={<HealthHistory />}
                        />

                        <Route
                            path="/veterinarians"
                            element={<Veterinarians />}
                        />

                        <Route
                            path="/appointments"
                            element={<Appointments />}
                        />

                        <Route
                            path="/profile"
                            element={<Profile />}
                        />
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </Suspense>
    );
}
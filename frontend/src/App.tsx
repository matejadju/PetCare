import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Profile from "./pages/Profile";
import Vaccinations from './pages/Vaccinations';
import Medications from './pages/Medications';
import HealthHistory from './pages/HealthHistory';
import Pets from './pages/Pets';
import PetDetails from './pages/PetDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/pets" element={<Pets />} />

          <Route path="/pets/:petId" element={<PetDetails />} />

          <Route path="/vaccinations" element={<Vaccinations />} />

          <Route path="/medications" element={<Medications />} />

          <Route path="/health-history" element={<HealthHistory />} />

          <Route
            path="/veterinarians"
            element={<PlaceholderPage title="Veterinarians" />}
          />

          <Route
            path="/appointments"
            element={<PlaceholderPage title="Appointments" />}
          />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

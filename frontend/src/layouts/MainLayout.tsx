import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    PawPrint,
    LayoutDashboard,
    Syringe,
    Pill,
    CalendarDays,
    HeartPulse,
    UserRound,
    Stethoscope,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';

const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Pets', path: '/pets', icon: PawPrint },
    { name: 'Vaccinations', path: '/vaccinations', icon: Syringe },
    { name: 'Medications', path: '/medications', icon: Pill },
    { name: 'Health History', path: '/health-history', icon: HeartPulse },
    { name: 'Veterinarians', path: '/veterinarians', icon: Stethoscope },
    { name: 'Appointments', path: '/appointments', icon: CalendarDays },
    { name: 'My Profile', path: '/profile', icon: UserRound },
];

export default function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="app-layout">
            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-logo">
                    <PawPrint size={30} />
                    <span>PetCare</span>

                    <button
                        className="mobile-close"
                        aria-label="Close menu"
                        onClick={() => setMenuOpen(false)}
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="sidebar-label">WORKSPACE</div>

                <nav className="sidebar-navigation">
                    {navigation.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon size={20} />
                            <span>{name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                />
                            ) : (
                                user?.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{user?.name}</strong>
                            <span>
                                {user?.role === 'VETERINARIAN'
                                    ? 'Veterinarian'
                                    : 'Pet Owner'}
                            </span>
                        </div>
                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        Sign out
                    </button>
                </div>
            </aside>

            <div className="main-area">
                <header className="main-header">
                    <div className="header-left">
                        <button
                            className="mobile-menu"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <span>PetCare Workspace</span>
                    </div>

                    <NavLink to="/profile" className="header-profile">
                        <div className="user-avatar">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                />
                            ) : (
                                user?.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        <span>{user?.name}</span>
                    </NavLink>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
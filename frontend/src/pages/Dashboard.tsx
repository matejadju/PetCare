import {
    PawPrint,
    Syringe,
    Pill,
    CalendarDays,
    HeartPulse,
    UserRound,
    Stethoscope,
    ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard.css';

const cards = [
    {
        title: 'My Pets',
        description: 'Manage your pets and their profiles.',
        icon: PawPrint,
        color: 'green',
        path: '/pets',
    },
    {
        title: 'Vaccinations',
        description: 'Keep track of vaccination records.',
        icon: Syringe,
        color: 'blue',
        path: '/vaccinations',
    },
    {
        title: 'Medications',
        description: 'Manage treatments and medications.',
        icon: Pill,
        color: 'purple',
        path: '/medications',
    },
    {
        title: 'Appointments',
        description: 'Manage your veterinary appointments.',
        icon: CalendarDays,
        color: 'orange',
        path: '/appointments',
    },
    {
        title: 'Health History',
        description: "Access your pet's medical history.",
        icon: HeartPulse,
        color: 'pink',
        path: '/health-history',
    },
    {
        title: 'Veterinarians',
        description: 'Find veterinary professionals.',
        icon: Stethoscope,
        color: 'blue',
        path: '/veterinarians',
    },
    {
        title: 'My Profile',
        description: 'Manage your personal information.',
        icon: UserRound,
        color: 'green',
        path: '/profile',
    },
];

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="dashboard-content">
            <section className="welcome-banner">
                <div>
                    <span className="welcome-label">
                        YOUR PET CARE COMPANION
                    </span>

                    <h1>Welcome, {user?.name}!</h1>

                    <p>
                        Everything your pets need for a happy
                        and healthy life, in one place.
                    </p>
                </div>

                <PawPrint className="welcome-icon" size={120} />
            </section>

            <h2>Overview</h2>

            <div className="dashboard-grid">
                {cards.map(({ title, description, icon: Icon, color, path }) => (
                    <Link
                        to={path}
                        className="dashboard-card"
                        key={path}
                    >
                        <div className="dashboard-card-top">
                            <div className={`card-icon ${color}`}>
                                <Icon size={26} />
                            </div>

                            <ArrowUpRight
                                size={20}
                                className="card-arrow"
                            />
                        </div>

                        <h3>{title}</h3>
                        <p>{description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
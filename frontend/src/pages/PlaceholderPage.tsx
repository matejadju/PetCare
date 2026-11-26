import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
}

export default function PlaceholderPage({
    title,
}: PlaceholderPageProps) {
    return (
        <div className="placeholder-page">
            <h1>{title}</h1>

            <div className="placeholder-card">
                <Construction size={48} />

                <h2>Coming soon</h2>

                <p>
                    This feature is currently under development.
                </p>
            </div>
        </div>
    );
}
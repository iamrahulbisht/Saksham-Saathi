import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">Saksham Saathi</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Beta</span>
                    </div>

                    {user && (
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <p className="font-medium text-gray-800">{user.fullName}</p>
                                <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-600 text-sm font-medium transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Saksham Saathi. Empowering Learning.
                </div>
            </footer>
        </div>
    );
}

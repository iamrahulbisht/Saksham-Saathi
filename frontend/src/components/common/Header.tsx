import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="bg-white shadow-sm z-20 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Menu className="w-6 h-6 text-gray-500 md:hidden cursor-pointer" />
                    <span className="text-xl font-bold text-blue-600">Saksham Saathi</span>
                </div>

                {user && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4" />
                            <span className="hidden md:inline">{user.fullName}</span>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="text-gray-500 hover:text-red-500"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

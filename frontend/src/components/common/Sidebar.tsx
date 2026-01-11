import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Activity, Users } from 'lucide-react';

export default function Sidebar({ role }: { role: string }) {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen pt-4">
            <nav className="flex flex-col gap-1 px-2">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Home className="w-5 h-5" />
                    Dashboard
                </NavLink>

                {(role === 'TEACHER' || role === 'THERAPIST') && (
                    <NavLink
                        to="/students"
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Users className="w-5 h-5" />
                        Students
                    </NavLink>
                )}

                <NavLink
                    to="/assessments"
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <ClipboardList className="w-5 h-5" />
                    Assessments
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Activity className="w-5 h-5" />
                    Reports
                </NavLink>
            </nav>
        </aside>
    );
}

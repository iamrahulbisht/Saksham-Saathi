import { Link } from 'react-router-dom';

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                You do not have permission to view this page. Please contact your administrator if you believe this is an error.
            </p>
            <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
                Go to Home
            </Link>
        </div>
    );
}

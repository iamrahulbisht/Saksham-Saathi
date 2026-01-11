
export default function FocusSchedule() {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Recommended Focus Times</h3>
            <ul className="space-y-2">
                {[1, 2, 3].map(i => (
                    <li key={i} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded">
                        <span>09:00 AM - 10:15 AM</span>
                        <span className="text-green-700 font-medium">High Focus</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

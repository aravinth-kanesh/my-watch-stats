export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-1 border border-gray-800">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-4xl font-bold text-white tracking-tight">{value ?? '--'}</span>
      {sub && <span className="text-gray-600 text-xs mt-1">{sub}</span>}
    </div>
  );
}

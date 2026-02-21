export default function Dashboard({ movies, stats, source }) {
  return (
    <div className="min-h-screen px-4 py-8">
      <p className="text-gray-400 text-center">
        Dashboard coming soon. {stats.total} films loaded from {source}.
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import StatCard          from './StatCard';
import RatingDistribution from './RatingDistribution';
import TimelineChart      from './TimelineChart';
import GenreChart         from './GenreChart';
import TopDirectorsChart  from './TopDirectorsChart';
import DecadePieChart     from './DecadePieChart';
import Insights          from './Insights';

export default function Dashboard({ stats, source, onReset }) {
  const { basic, genres, ratings, timeline, directors, decades } = stats;

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`min-h-screen px-4 py-10 max-w-5xl mx-auto transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            My<span className="text-orange-400">Watch</span>Stats
          </h1>
          <p className="text-gray-500 text-sm mt-1 capitalize">{source}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors border border-gray-700 rounded-lg px-3 py-1.5"
        >
          Load another file
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Films watched" value={basic.total.toLocaleString()} />
        <StatCard label="Est. hours"    value={basic.estimatedHours.toLocaleString()} />
        <StatCard label="Avg rating"    value={basic.avgRating ?? 'n/a'} />
        {basic.firstWatch && (
          <StatCard
            label="Watching since"
            value={basic.firstWatch.slice(0, 4)}
            sub={`to ${basic.lastWatch.slice(0, 4)}`}
          />
        )}
      </div>

      <Insights stats={stats} source={source} />

      {/* Charts */}
      <div className="flex flex-col gap-6">

        {/* Timeline — full width */}
        {timeline.length > 0 && (
          <ChartCard title="Watch timeline">
            <TimelineChart data={timeline} />
          </ChartCard>
        )}

        {/* Ratings + Decades side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratings.length > 0 && (
            <ChartCard
              title="Ratings breakdown"
              sub={basic.avgRating ? `avg ${basic.avgRating}` : null}
            >
              <RatingDistribution data={ratings} source={source} />
            </ChartCard>
          )}
          {decades.length > 0 && (
            <ChartCard title="Films by decade">
              <DecadePieChart data={decades} />
            </ChartCard>
          )}
        </div>

        {/* Genre — full width, IMDb only */}
        {genres.length > 0 && (
          <ChartCard title="Top genres">
            <GenreChart data={genres} />
          </ChartCard>
        )}

        {/* Directors — full width, IMDb only */}
        {directors.length > 0 && (
          <ChartCard title="Top directors">
            <TopDirectorsChart data={directors} />
          </ChartCard>
        )}

      </div>
    </div>
  );
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h2>
        {sub && <span className="text-gray-600 text-xs">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

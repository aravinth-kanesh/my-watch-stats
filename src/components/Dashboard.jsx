import { useState, useEffect, useMemo } from 'react';
import { computeStats, getContentLabel } from '../utils/dataProcessor';
import StatCard          from './StatCard';
import RatingDistribution from './RatingDistribution';
import TimelineChart      from './TimelineChart';
import GenreChart         from './GenreChart';
import TopDirectorsChart  from './TopDirectorsChart';
import DecadePieChart     from './DecadePieChart';
import Insights          from './Insights';
import FilterBar         from './FilterBar';

export default function Dashboard({ movies, source, onReset }) {
  const [filters, setFilters] = useState({ fromYear: null, toYear: null, genre: null, minRating: null, titleType: null });

  const filteredMovies = useMemo(() => applyFilters(movies, filters), [movies, filters]);
  const stats = useMemo(() => computeStats(filteredMovies), [filteredMovies]);
  const contentLabel = useMemo(() => getContentLabel(filteredMovies, source), [filteredMovies, source]);
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
          <p className="text-gray-500 text-sm mt-1">{source === 'imdb' ? 'IMDb' : 'Letterboxd'}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-orange-400 hover:border-orange-400 transition-colors border border-gray-700 rounded-lg px-3 py-1.5"
        >
          Load another file
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        movies={movies}
        filters={filters}
        onChange={setFilters}
        source={source}
        filteredCount={filteredMovies.length}
        totalCount={movies.length}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={source === 'imdb' ? 'Titles rated' : 'Films watched'} value={basic.total.toLocaleString()} />
        <StatCard label={source === 'imdb' ? 'Hours watched' : 'Est. hours'}   value={basic.estimatedHours.toLocaleString()} />
        <StatCard label="Avg rating"    value={basic.avgRating ?? 'n/a'} />
        {basic.firstWatch && (() => {
          const since = basic.firstWatch.slice(0, 4);
          const until = basic.lastWatch.slice(0, 4);
          return (
            <StatCard
              label="Years active"
              value={since !== until ? `${since} - ${until}` : since}
            />
          );
        })()}
      </div>

      <Insights stats={stats} source={source} contentLabel={contentLabel} />

      {/* Charts */}
      <div className="flex flex-col gap-6">

        {/* Timeline — full width */}
        {timeline.length > 0 && (
          <ChartCard title="Watch timeline">
            <TimelineChart data={timeline} contentLabel={contentLabel} />
          </ChartCard>
        )}

        {/* Ratings + Decades side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratings.length > 0 && (
            <ChartCard
              title="Ratings breakdown"
              sub={basic.avgRating ? `avg ${basic.avgRating}` : null}
            >
              <RatingDistribution data={ratings} source={source} contentLabel={contentLabel} />
            </ChartCard>
          )}
          {decades.length > 0 && (
            <ChartCard title={`${contentLabel.charAt(0).toUpperCase() + contentLabel.slice(1)} by decade`}>
              <DecadePieChart data={decades} contentLabel={contentLabel} />
            </ChartCard>
          )}
        </div>

        {/* Genre — full width, IMDb only */}
        {genres.length > 0 && (
          <ChartCard title="Top genres">
            <GenreChart data={genres} contentLabel={contentLabel} />
          </ChartCard>
        )}

        {/* Directors — full width, IMDb only */}
        {directors.length > 0 && (
          <ChartCard title="Top directors">
            <TopDirectorsChart data={directors} contentLabel={contentLabel} />
          </ChartCard>
        )}

      </div>
    </div>
  );
}

function applyFilters(movies, filters) {
  return movies.filter(m => {
    if (filters.fromYear !== null) {
      if (!m.watchedDate) return false;
      if (parseInt(m.watchedDate.slice(0, 4)) < filters.fromYear) return false;
    }
    if (filters.toYear !== null) {
      if (!m.watchedDate) return false;
      if (parseInt(m.watchedDate.slice(0, 4)) > filters.toYear) return false;
    }
    if (filters.titleType !== null && m.titleType !== filters.titleType) return false;
    if (filters.genre !== null && !m.genres.includes(filters.genre)) return false;
    if (filters.minRating !== null && (m.rating === null || m.rating < filters.minRating)) return false;
    return true;
  });
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

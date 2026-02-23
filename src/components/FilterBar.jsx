export default function FilterBar({ movies, filters, onChange, source, filteredCount, totalCount }) {
  const watchYears = [...new Set(
    movies
      .filter(m => m.watchedDate)
      .map(m => parseInt(m.watchedDate.slice(0, 4)))
  )].sort((a, b) => a - b);

  const allGenres = source === 'imdb'
    ? [...new Set(movies.flatMap(m => m.genres))].filter(Boolean).sort()
    : [];

  const ratingSteps = source === 'letterboxd'
    ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const hasFilters = filters.fromYear !== null || filters.toYear !== null ||
                     filters.genre !== null || filters.minRating !== null;

  function update(key, raw) {
    const value = raw === '' ? null : key === 'genre' ? raw : parseFloat(raw);
    onChange({ ...filters, [key]: value });
  }

  function clear() {
    onChange({ fromYear: null, toYear: null, genre: null, minRating: null });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Sel
        value={filters.fromYear ?? ''}
        onChange={e => update('fromYear', e.target.value)}
      >
        <option value="">From year</option>
        {watchYears.map(y => (
          <option key={y} value={y} disabled={filters.toYear !== null && y > filters.toYear}>{y}</option>
        ))}
      </Sel>

      <Sel
        value={filters.toYear ?? ''}
        onChange={e => update('toYear', e.target.value)}
      >
        <option value="">To year</option>
        {watchYears.map(y => (
          <option key={y} value={y} disabled={filters.fromYear !== null && y < filters.fromYear}>{y}</option>
        ))}
      </Sel>

      {allGenres.length > 0 && (
        <Sel
          value={filters.genre ?? ''}
          onChange={e => update('genre', e.target.value)}
        >
          <option value="">All genres</option>
          {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </Sel>
      )}

      <Sel
        value={filters.minRating ?? ''}
        onChange={e => update('minRating', e.target.value)}
      >
        <option value="">Any rating</option>
        {ratingSteps.map((r, i) => (
          <option key={r} value={r}>{r}{i < ratingSteps.length - 1 ? '+' : ''}</option>
        ))}
      </Sel>

      {hasFilters && (
        <>
          <button
            onClick={clear}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
          <span className="ml-auto text-xs text-gray-500">
            {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} films
          </span>
        </>
      )}
    </div>
  );
}

function Sel({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 hover:border-orange-400 hover:text-white focus:outline-none transition-colors cursor-pointer"
    >
      {children}
    </select>
  );
}

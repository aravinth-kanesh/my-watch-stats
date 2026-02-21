import { normaliseLetterboxdRating } from './csvParser';

// Map raw CSV rows to a common shape regardless of which service they came from.
export function normalizeData(rows, source) {
  if (source === 'letterboxd') return normalizeLetterboxd(rows);
  if (source === 'imdb') return normalizeIMDb(rows);
  return [];
}

function normalizeLetterboxd(rows) {
  return rows
    .filter((r) => r['Name'] || r['Title'])
    .map((r) => ({
      title: r['Name'] || r['Title'] || '',
      year: parseInt(r['Year']) || null,
      rating: normaliseLetterboxdRating(r['Rating']),
      watchedDate: r['Watched Date'] || r['Date'] || null,
      rewatch: r['Rewatch'] === 'Yes',
      genres: [],
      source: 'letterboxd',
    }));
}

function normalizeIMDb(rows) {
  return rows
    .filter((r) => r['Title'] || r['Primary Title'])
    .map((r) => {
      const genres = r['Genres']
        ? r['Genres'].split(',').map((g) => g.trim()).filter(Boolean)
        : [];
      return {
        title: r['Title'] || r['Primary Title'] || '',
        year: parseInt(r['Year']) || null,
        rating: r['Your Rating'] ? parseFloat(r['Your Rating']) : null,
        watchedDate: r['Date Rated'] || null,
        rewatch: false,
        genres,
        source: 'imdb',
      };
    });
}

// Crunch the normalised records into all the chart-ready stats the dashboard needs.
export function computeStats(movies) {
  const rated = movies.filter((m) => m.rating !== null);

  // Ratings distribution (1-10, half-star for letterboxd 0.5 increments)
  const ratingCounts = {};
  rated.forEach((m) => {
    const key = String(m.rating);
    ratingCounts[key] = (ratingCounts[key] || 0) + 1;
  });
  const ratingsDistribution = Object.entries(ratingCounts)
    .map(([rating, count]) => ({ rating: parseFloat(rating), count }))
    .sort((a, b) => a.rating - b.rating);

  // Movies per year
  const yearCounts = {};
  movies.forEach((m) => {
    if (m.year) yearCounts[m.year] = (yearCounts[m.year] || 0) + 1;
  });
  const moviesPerYear = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  // Watch activity over time (by month)
  const monthCounts = {};
  movies.forEach((m) => {
    if (m.watchedDate) {
      const month = m.watchedDate.slice(0, 7); // "YYYY-MM"
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });
  const watchActivity = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Genre breakdown. Only populated for IMDb exports since Letterboxd doesn't include genres.
  const genreCounts = {};
  movies.forEach((m) => {
    m.genres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const genreBreakdown = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, m) => s + m.rating, 0) / rated.length) * 10) / 10
      : null;

  return {
    total: movies.length,
    rated: rated.length,
    avgRating,
    rewatches: movies.filter((m) => m.rewatch).length,
    ratingsDistribution,
    moviesPerYear,
    watchActivity,
    genreBreakdown,
  };
}

// Map raw CSV rows to a common shape regardless of which service they came from.
export function normaliseData(rows, source) {
  if (source === 'letterboxd') return normaliseLetterboxd(rows);
  if (source === 'imdb') return normaliseIMDb(rows);
  return [];
}

function normaliseLetterboxd(rows) {
  return rows
    .filter((r) => r['Name'] || r['Title'])
    .map((r) => ({
      title:       r['Name'] || r['Title'] || '',
      year:        parseInt(r['Year']) || null,
      rating:      r['Rating'] ? parseFloat(r['Rating']) : null,
      watchedDate: r['Watched Date'] || r['Date'] || null,
      rewatch:     r['Rewatch'] === 'Yes',
      genres:      [],
      director:    null,
      source:      'letterboxd',
    }));
}

function normaliseIMDb(rows) {
  return rows
    .filter((r) => r['Title'] || r['Primary Title'])
    .map((r) => {
      const genres = r['Genres']
        ? r['Genres'].split(',').map((g) => g.trim()).filter(Boolean)
        : [];
      return {
        title:       r['Title'] || r['Primary Title'] || '',
        year:        parseInt(r['Year']) || null,
        rating:      r['Your Rating'] ? parseFloat(r['Your Rating']) : null,
        watchedDate: r['Date Rated'] || null,
        rewatch:     false,
        genres,
        director:    r['Directors'] || null,
        titleType:   r['Title Type'] || null,
        runtime:     r['Runtime (mins)'] ? parseInt(r['Runtime (mins)']) : null,
        source:      'imdb',
      };
    });
}

// Total count, estimated hours, average rating, and date range.
export function calculateBasicStats(movies) {
  const total = movies.length;
  const totalMinutes = movies.reduce((sum, m) => sum + (m.runtime ?? 120), 0);
  const estimatedHours = Math.round(totalMinutes / 60);

  const rated = movies.filter((m) => m.rating !== null);
  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, m) => s + m.rating, 0) / rated.length) * 100) / 100
      : null;

  const dated = movies
    .filter((m) => m.watchedDate)
    .map((m) => m.watchedDate)
    .sort();

  const firstWatch = dated[0] ?? null;
  const lastWatch  = dated[dated.length - 1] ?? null;

  return { total, estimatedHours, avgRating, ratedCount: rated.length, firstWatch, lastWatch };
}

// Count per genre, sorted by count descending.
export function getGenreDistribution(movies) {
  const counts = {};
  movies.forEach((m) => {
    m.genres.forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

// Count and percentage per rating bucket.
// Letterboxd buckets by 0.5 (native scale), IMDb by whole number.
export function getRatingDistribution(movies) {
  const rated = movies.filter((m) => m.rating !== null);
  if (!rated.length) return [];

  const isLetterboxd = rated[0]?.source === 'letterboxd';

  const counts = {};
  rated.forEach((m) => {
    const bucket = isLetterboxd
      ? Math.round(m.rating * 2) / 2   // snap to nearest 0.5
      : Math.round(m.rating);           // snap to nearest whole number
    counts[bucket] = (counts[bucket] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([stars, count]) => ({
      stars:      parseFloat(stars),
      count,
      percentage: Math.round((count / rated.length) * 100),
    }))
    .sort((a, b) => a.stars - b.stars);
}

// Watch count grouped by YYYY-MM, sorted chronologically.
export function getWatchTimeline(movies) {
  const counts = {};
  movies.forEach((m) => {
    if (!m.watchedDate) return;
    const month = m.watchedDate.slice(0, 7);
    counts[month] = (counts[month] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Top 10 directors by film count with their average rating. IMDb only.
export function getTopDirectors(movies) {
  const withDirector = movies.filter((m) => m.director);
  if (!withDirector.length) return [];

  const map = {};
  withDirector.forEach((m) => {
    // IMDb can list multiple directors separated by ", "
    const names = m.director.split(',').map((n) => n.trim()).filter(Boolean);
    names.forEach((name) => {
      if (!map[name]) map[name] = { films: 0, ratingSum: 0, ratedCount: 0 };
      map[name].films += 1;
      if (m.rating !== null) {
        map[name].ratingSum  += m.rating;
        map[name].ratedCount += 1;
      }
    });
  });

  return Object.entries(map)
    .map(([name, d]) => ({
      name,
      films:     d.films,
      avgRating: d.ratedCount > 0
        ? Math.round((d.ratingSum / d.ratedCount) * 10) / 10
        : null,
    }))
    .sort((a, b) => b.films - a.films)
    .slice(0, 10);
}

// Film count and percentage per release decade.
export function getDecadeBreakdown(movies) {
  const withYear = movies.filter((m) => m.year);
  if (!withYear.length) return [];

  const counts = {};
  withYear.forEach((m) => {
    const decade = Math.floor(m.year / 10) * 10;
    counts[decade] = (counts[decade] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([decade, count]) => ({
      decade:     parseInt(decade),
      label:      `${decade}s`,
      count,
      percentage: Math.round((count / withYear.length) * 100),
    }))
    .sort((a, b) => a.decade - b.decade);
}

// Return the singular form of a content label.
export function toSingular(label) {
  if (label === 'series') return 'series'; // unchanged
  return label.replace(/s$/, '');          // films->film, episodes->episode, titles->title, shorts->short
}

// Derive a human-readable content label from the types present in the filtered set.
// Letterboxd is always films. For IMDb, sniff the unique title types and pick the right word.
export function getContentLabel(movies, source) {
  if (source === 'letterboxd') return 'films';
  const types = [...new Set(movies.map(m => m.titleType).filter(Boolean))];
  if (types.length !== 1) return 'titles';
  const t = types[0].toLowerCase().replace(/\s+/g, '');
  if (t === 'movie' || t === 'tvmovie') return 'films';
  if (t === 'tvepisode') return 'episodes';
  if (t === 'tvseries' || t === 'tvminiseries') return 'series';
  if (t === 'short') return 'shorts';
  return 'titles';
}

// Convenience wrapper — returns everything the Dashboard needs in one call.
export function computeStats(movies) {
  return {
    basic:     calculateBasicStats(movies),
    genres:    getGenreDistribution(movies),
    ratings:   getRatingDistribution(movies),
    timeline:  getWatchTimeline(movies),
    directors: getTopDirectors(movies),
    decades:   getDecadeBreakdown(movies),
  };
}

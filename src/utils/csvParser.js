import Papa from 'papaparse';

const REQUIRED_COLUMNS = {
  letterboxd: ['Name', 'Year', 'Rating'],
  imdb:       ['Title', 'Year', 'Your Rating', 'Date Rated', 'Genres'],
};

// Sniff which service exported the CSV by looking at the column headers.
export function detectSource(headers) {
  const h = headers.map((s) => s.toLowerCase());
  if (h.includes('letterboxd uri') || h.includes('rewatch')) return 'letterboxd';
  if (h.includes('your rating') || h.includes('imdb rating') || h.includes('const')) return 'imdb';
  return 'unknown';
}

// Check that the expected columns are present. Missing ones are returned so the
// error message can tell the user exactly what's wrong.
function validateColumns(headers, source) {
  const required = REQUIRED_COLUMNS[source] ?? [];
  const missing = required.filter((col) => !headers.includes(col));
  return missing;
}

// Letterboxd rates on a 0.5-5.0 half-star scale; convert to 1-10 so both
// sources share the same scale throughout the app.
export function normaliseLetterboxdRating(raw) {
  if (raw === '' || raw == null) return null;
  const n = parseFloat(raw);
  if (isNaN(n)) return null;
  return Math.round(n * 2 * 10) / 10; // 0.5 -> 1, 5.0 -> 10
}

// Parse a CSV File object. Resolves with:
//   { valid: true,  source, data, headers }
//   { valid: false, error }
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const source  = detectSource(headers);

        if (source === 'unknown') {
          resolve({
            valid: false,
            error: "Couldn't recognise this CSV format. Expected a Letterboxd or IMDb export.",
          });
          return;
        }

        const missing = validateColumns(headers, source);
        if (missing.length > 0) {
          resolve({
            valid: false,
            error: `Missing columns for ${source} format: ${missing.join(', ')}.`,
          });
          return;
        }

        resolve({ valid: true, source, data: results.data, headers });
      },
      error: (err) => reject(err),
    });
  });
}

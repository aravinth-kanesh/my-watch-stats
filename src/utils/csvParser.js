import Papa from 'papaparse';

// Sniff which service exported the CSV by looking at the column headers.
export function detectSource(headers) {
  const h = headers.map((s) => s.toLowerCase());
  if (h.includes('letterboxd uri') || h.includes('rewatch')) return 'letterboxd';
  if (h.includes('your rating') || h.includes('imdb rating') || h.includes('const')) return 'imdb';
  return 'unknown';
}

// Parse a CSV File object; resolves with { source, data, errors, headers }.
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const source = detectSource(headers);
        resolve({ source, data: results.data, errors: results.errors, headers });
      },
      error: (err) => reject(err),
    });
  });
}

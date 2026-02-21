import { useState, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';
import { normalizeData, computeStats } from '../utils/dataProcessor';

export default function FileUpload({ onDataLoaded }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a .csv file exported from Letterboxd or IMDb.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { source, data } = await parseCSV(file);

      if (source === 'unknown') {
        setError("Couldn't recognise this CSV format. Try a Letterboxd or IMDb export.");
        setLoading(false);
        return;
      }

      const movies = normalizeData(data, source);
      const stats = computeStats(movies);
      onDataLoaded({ movies, stats, source });
    } catch (err) {
      setError('Something went wrong parsing the file. Is it a valid CSV?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-2">
          My<span className="text-orange-400">Watch</span>Stats
        </h1>
        <p className="text-gray-400 text-lg">
          Drop in your Letterboxd or IMDb export and see your viewing habits laid bare.
        </p>
      </div>

      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative w-full max-w-lg rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-orange-400 bg-orange-400/10 scale-[1.02]'
            : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800/60'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={onInputChange}
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${dragging ? 'bg-orange-400/20' : 'bg-gray-800'}
            transition-colors duration-200
          `}>
            <svg
              className={`w-8 h-8 ${dragging ? 'text-orange-400' : 'text-gray-500'} transition-colors duration-200`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Crunching the numbers...</span>
            </div>
          ) : (
            <>
              <div>
                <p className="text-white font-medium text-lg">
                  {dragging ? 'Drop it!' : 'Drag your CSV here'}
                </p>
                <p className="text-gray-500 text-sm mt-1">or click to browse</p>
              </div>

              <div className="flex gap-2 mt-2">
                {['Letterboxd', 'IMDb'].map((src) => (
                  <span
                    key={src}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-400 max-w-sm text-center">{error}</p>
      )}

      <p className="mt-8 text-xs text-gray-600 max-w-sm text-center">
        Everything runs in your browser. No data ever leaves your machine.
      </p>
    </div>
  );
}

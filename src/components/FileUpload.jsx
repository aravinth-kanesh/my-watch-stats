import { useState, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';
import { normaliseData, computeStats } from '../utils/dataProcessor';

export default function FileUpload({ onDataLoaded }) {
  const [dragging, setDragging] = useState(false);
  const [stagedFile, setStagedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stageFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a .csv file exported from Letterboxd or IMDb.');
      return;
    }
    setError(null);
    setStagedFile(file);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    stageFile(e.dataTransfer.files[0]);
  }, [stageFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => stageFile(e.target.files[0]);

  const handleParse = async () => {
    if (!stagedFile) return;
    setError(null);
    setLoading(true);

    try {
      const result = await parseCSV(stagedFile);

      if (!result.valid) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const movies = normaliseData(result.data, result.source);
      const stats = computeStats(movies);

      onDataLoaded({ movies, stats, source: result.source });
    } catch (err) {
      setError('Something went wrong parsing the file. Is it a valid CSV?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setStagedFile(null);
    setError(null);
  };

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

      {/* Drop zone — only shown before a file is staged */}
      {!stagedFile && (
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
          </div>
        </label>
      )}

      {/* File staged: show name + parse button */}
      {stagedFile && (
        <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-400/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{stagedFile.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {(stagedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="text-gray-600 hover:text-gray-400 transition-colors p-1"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleParse}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Parsing...
              </>
            ) : (
              'Parse CSV'
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400 max-w-sm text-center">{error}</p>
      )}

      <p className="mt-8 text-xs text-gray-600 max-w-sm text-center">
        Everything runs in your browser. No data ever leaves your machine.
      </p>
    </div>
  );
}

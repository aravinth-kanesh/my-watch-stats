import { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

export default function App() {
  const [watchData, setWatchData] = useState(null);

  return (
    <div className="dark">
      {watchData ? (
        <Dashboard
          movies={watchData.movies}
          source={watchData.source}
          onReset={() => setWatchData(null)}
        />
      ) : (
        <FileUpload onDataLoaded={setWatchData} />
      )}
    </div>
  );
}

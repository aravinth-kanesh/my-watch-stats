const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonth(yyyyMm) {
  const [year, m] = yyyyMm.split('-');
  return `${MONTHS[parseInt(m) - 1]} ${year}`;
}

export default function Insights({ stats, source }) {
  const { basic, genres, timeline, directors, decades } = stats;
  const lines = [];

  if (basic.estimatedHours > 0) {
    lines.push(`You've watched an estimated ${basic.estimatedHours.toLocaleString()} hours of film.`);
  }

  if (basic.firstWatch) {
    const since = basic.firstWatch.slice(0, 4);
    const until = basic.lastWatch.slice(0, 4);
    const range = since === until ? since : `${since} to ${until}`;
    lines.push(`You logged ${basic.total.toLocaleString()} films from ${range}.`);
  }

  if (timeline.length > 0) {
    const peak = [...timeline].sort((a, b) => b.count - a.count)[0];
    lines.push(`Your busiest month was ${formatMonth(peak.month)} with ${peak.count} films.`);
  }

  if (basic.avgRating !== null) {
    const scale = source === 'letterboxd' ? '5' : '10';
    const sourceName = source === 'letterboxd' ? 'Letterboxd' : 'IMDb';
    lines.push(`Your average ${sourceName} rating is ${basic.avgRating} out of ${scale}.`);
  }

  if (genres.length > 0) {
    lines.push(`Your most-watched genre is ${genres[0].genre} with ${genres[0].count} films.`);
  }

  if (decades.length > 0) {
    const top = [...decades].sort((a, b) => b.count - a.count)[0];
    lines.push(`Most of your films are from the ${top.label}.`);
  }

  if (directors.length > 0) {
    lines.push(`You've watched the most films directed by ${directors[0].name} (${directors[0].films} films).`);
  }

  if (lines.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Insights</h2>
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="text-gray-300 text-sm flex items-start gap-2.5">
            <span className="text-orange-400 leading-5 flex-shrink-0">&#8250;</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

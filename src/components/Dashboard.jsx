export default function Dashboard({ stats, source, onReset }) {
  const { basic, genres, ratings, timeline, directors, decades } = stats;
  const isLetterboxd = source === 'letterboxd';

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            My<span className="text-orange-400">Watch</span>Stats
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Source: <span className="text-gray-400 capitalize">{source}</span>
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors border border-gray-700 rounded-lg px-3 py-1.5"
        >
          Load another file
        </button>
      </div>

      {/* Basic stats */}
      <Section title="Overview">
        <StatRow label="Total films"     value={basic.total} />
        <StatRow label="Estimated hours" value={`${basic.estimatedHours.toLocaleString()} hrs`} />
        {basic.ratedCount < basic.total && (
          <StatRow label="Films rated" value={`${basic.ratedCount} / ${basic.total}`} />
        )}
        <StatRow label="Average rating" value={basic.avgRating ?? 'n/a'} />
        {basic.firstWatch && (
          <StatRow
            label="Date range"
            value={`${formatFullDate(basic.firstWatch)} - ${formatFullDate(basic.lastWatch)}`}
          />
        )}
      </Section>

      {/* Rating distribution */}
      {ratings.length > 0 && (
        <Section title="Ratings breakdown">
          {ratings.map((r) => (
            <div key={r.stars} className="flex items-center gap-3 py-1.5">
              <span className="text-orange-400 w-28 text-sm flex-shrink-0 tracking-tight">
                {isLetterboxd ? toStars(r.stars) : `${r.stars} stars`}
              </span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-orange-400"
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
              <span className="text-gray-500 text-sm w-20 text-right flex-shrink-0">
                {r.count} ({r.percentage}%)
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Watch timeline */}
      {timeline.length > 0 && (
        <Section title="Watch timeline">
          {timeline.map((t) => (
            <StatRow
              key={t.month}
              label={formatMonth(t.month)}
              value={`${t.count} film${t.count !== 1 ? 's' : ''}`}
            />
          ))}
        </Section>
      )}

      {/* Decade breakdown */}
      {decades.length > 0 && (
        <Section title="Films by decade">
          {decades.map((d) => (
            <div key={d.decade} className="flex items-center gap-3 py-1.5">
              <span className="text-gray-400 w-16 text-sm flex-shrink-0">{d.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-orange-400/70"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <span className="text-gray-500 text-sm w-20 text-right flex-shrink-0">
                {d.count} ({d.percentage}%)
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Genre distribution */}
      {genres.length > 0 && (
        <Section title="Genres">
          {genres.slice(0, 10).map((g) => (
            <StatRow key={g.genre} label={g.genre} value={g.count} />
          ))}
        </Section>
      )}

      {/* Top directors */}
      {directors.length > 0 && (
        <Section title="Top directors">
          {directors.map((d) => (
            <StatRow
              key={d.name}
              label={d.name}
              value={`${d.films} film${d.films !== 1 ? 's' : ''}${d.avgRating ? ` · avg ${d.avgRating}` : ''}`}
            />
          ))}
        </Section>
      )}

    </div>
  );
}

// "2023-09-23" -> "September 23rd 2023"
function formatFullDate(str) {
  const [year, month, day] = str.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthName = date.toLocaleString('en-GB', { month: 'long' });
  return `${monthName} ${ordinal(day)} ${year}`;
}

// "2023-09" -> "September 2023"
function formatMonth(str) {
  const [year, month] = str.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// 3.5 -> "★★★½", 5 -> "★★★★★", 0.5 -> "½"
function toStars(rating) {
  const full = Math.floor(rating);
  const half = (rating % 1) >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '');
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-2">
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}

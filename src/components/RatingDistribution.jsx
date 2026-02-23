import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toSingular } from '../utils/dataProcessor';

// Full star glyphs for tooltips.
function toStars(rating) {
  const full = Math.floor(rating);
  const half = (rating % 1) >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '');
}

// Compact axis labels: ½, 1, 1½, 2 ... 5 — never wider than 2-3 chars.
function toCompactLabel(rating) {
  const full = Math.floor(rating);
  const half = (rating % 1) >= 0.5;
  if (full === 0) return '½';
  return half ? `${full}½` : String(full);
}

function ChartTooltip({ active, payload, source, contentLabel }) {
  if (!active || !payload?.length) return null;
  const { stars, count, percentage } = payload[0].payload;
  const n = contentLabel ?? 'titles';
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-amber-400 font-medium">
        {source === 'letterboxd' ? toStars(stars) : `${stars} stars`}
      </p>
      <p className="text-gray-400">{count} {count === 1 ? toSingular(n) : n} ({percentage}%)</p>
    </div>
  );
}

export default function RatingDistribution({ data, source, contentLabel }) {
  if (!data?.length) return null;

  const isLetterboxd = source === 'letterboxd';

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="stars"
          interval={0}
          tickFormatter={(v) => isLetterboxd ? toCompactLabel(v) : v}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          content={(props) => <ChartTooltip {...props} source={source} contentLabel={contentLabel} />}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Bar dataKey="percentage" fill="url(#ratingGrad)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

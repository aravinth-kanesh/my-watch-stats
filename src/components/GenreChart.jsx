import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toSingular } from '../utils/dataProcessor';

function ChartTooltip({ active, payload, contentLabel }) {
  if (!active || !payload?.length) return null;
  const { genre, count } = payload[0].payload;
  const n = contentLabel ?? 'titles';
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{genre}</p>
      <p className="text-gray-400">{count} {count === 1 ? toSingular(n) : n}</p>
    </div>
  );
}

export default function GenreChart({ data, contentLabel }) {
  if (!data?.length) return null;

  const top10 = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, top10.length * 36)}>
      <BarChart data={top10} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="genreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="genre"
          width={80}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} contentLabel={contentLabel} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar
          dataKey="count"
          fill="url(#genreGrad)"
          radius={[0, 4, 4, 0]}
          label={{ position: 'right', fill: '#6b7280', fontSize: 11 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

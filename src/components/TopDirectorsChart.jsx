import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, films, avgRating } = payload[0].payload;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{name}</p>
      <p className="text-gray-400">
        {films} film{films !== 1 ? 's' : ''}{avgRating ? ` · avg ${avgRating}` : ''}
      </p>
    </div>
  );
}

export default function TopDirectorsChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="directorGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar
          dataKey="films"
          fill="url(#directorGrad)"
          radius={[0, 4, 4, 0]}
          label={{ position: 'right', fill: '#6b7280', fontSize: 11 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

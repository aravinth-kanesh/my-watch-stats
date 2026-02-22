import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Fill every month between first and last entry, zeroing months with no watches.
function expandTimeline(data) {
  if (!data.length) return [];
  const map = new Map(data.map((d) => [d.month, d.count]));
  const result = [];
  let [y, m] = data[0].month.split('-').map(Number);
  const [ey, em] = data[data.length - 1].month.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    result.push({ month: key, count: map.get(key) ?? 0 });
    m++;
    if (m > 12) { y++; m = 1; }
  }
  return result;
}

function tickLabel(str) {
  const [y, mo] = str.split('-').map(Number);
  const d = new Date(y, mo - 1);
  return d.toLocaleString('en-GB', { month: 'short' }) + " '" + String(y).slice(2);
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { month, count } = payload[0].payload;
  const [y, mo] = month.split('-').map(Number);
  const label = new Date(y, mo - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{label}</p>
      <p className="text-gray-400">{count} {count === 1 ? 'film' : 'films'}</p>
    </div>
  );
}

export default function TimelineChart({ data }) {
  if (!data?.length) {
    return <p className="text-gray-600 text-sm text-center py-8">No watch dates in this export.</p>;
  }

  const expanded = expandTimeline(data);
  const tickInterval = Math.max(1, Math.floor(expanded.length / 8));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={expanded} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tickFormatter={tickLabel}
          interval={tickInterval}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<ChartTooltip />} cursor={false} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="url(#timelineGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

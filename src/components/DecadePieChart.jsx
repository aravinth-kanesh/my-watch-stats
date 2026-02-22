import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#fb923c', '#2dd4bf'];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, count, percentage } = payload[0].payload;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{label}</p>
      <p className="text-gray-400">{count} films ({percentage}%)</p>
    </div>
  );
}

export default function DecadePieChart({ data }) {
  if (!data?.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={95}
            label={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-gray-400 text-xs">{d.label}</span>
            <span className="text-gray-600 text-xs">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

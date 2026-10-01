import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/Card.jsx";
export default function PriceChart({ title, data, dataKey, suffix = "" }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" hide />
              <YAxis
                domain={["auto", "auto"]}
                width={60}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)}${suffix}`,
                  title,
                ]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                dot={false}
                stroke="currentColor"
                className="text-indigo-500"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state h-full">Not enough history yet.</div>
        )}
      </div>
    </Card>
  );
}

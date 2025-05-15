import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface MonthlyRevenueChartProps {
  data: { label: string; trip: number; event: number }[] | undefined;
  isLoading: boolean;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({
  data,
  isLoading,
}) => {
    console.log("📊 Monthly Revenue Data:", data);
  if (isLoading)
    return <p className="text-gray-500">Loading revenue chart...</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="trip"
            stroke="#6366f1"
            name="Trip Revenue"
          />
          <Line
            type="monotone"
            dataKey="event"
            stroke="#10b981"
            name="Event Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyRevenueChart;

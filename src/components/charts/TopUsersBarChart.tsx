import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface Props {
  data: {
    name: string;
    lastname: string;
    points: number;
  }[];
}

const TopUsersBarChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((user) => ({
    name: `${user.name} ${user.lastname}`,
    points: user.points,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="points" fill="#46A996">
            <LabelList dataKey="points" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopUsersBarChart;

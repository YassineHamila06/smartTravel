import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: {
    _id: string;
    count: number;
  }[];
}

const COLORS = [
  "#46A996",
  "#8367c7",
  "#87986a",
  "#05668d",

  "#38a3a5",

  //
];

const PreferencePieChart: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="count"
            data={data}
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
            label={({ _id }) => _id}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PreferencePieChart;

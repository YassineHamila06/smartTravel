import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#9b2226", "#bb3e03", "#ca6702", "#ee9b00", "#e9d8a6", "#94d2bd", "#0a9396", "#001219","#005f73"];

interface Props {
  data: { _id: string; count: number }[];
}

const TripTypePieChart: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name }) => name}
            labelLine={false}
            
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, `${name}`]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              maxWidth: "100%",
              overflow: "auto",
              whiteSpace: "nowrap",
              textAlign: "center",
              marginTop: 10,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripTypePieChart;

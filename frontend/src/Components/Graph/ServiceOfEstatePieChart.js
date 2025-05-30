import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import axios from "axios";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA46BE",
  "#EA5455",
  "#FFD460",
  "#2D4059",
  "#6A2C70",
  "#4E944F",
  "#FF6B6B",
];

const validServices = [
  "ለመኖረያ",
  "ለንግድ",
  "የመንግስት",
  "የሐይማኖት ተቋም",
  "ኢንቨስትመንት",
  "የቀበሌ",
  "የኪይ ቤቶች",
  "ኮንዲኒሚየም",
  "መንገድ",
  "የማሃበር",
  "ሌሎች",
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0 ? (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: "14px", fontWeight: "bold" }}
    >
      {(percent * 100).toFixed(1)}%
    </text>
  ) : null;
};

const ServiceOfEstatePieChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/statistics/service-of-estate")
      .then((response) => {
        const stats = response.data;
        const filtered = stats.filter((item) =>
          validServices.includes(item.ServiceOfEstate)
        );
        const formatted = filtered.map((item) => ({
          name: item.ServiceOfEstate,
          value: item.count,
        }));
        setChartData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
      });
  }, []);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <PieChart width={500} height={400}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={150}
        fill="#8884d8"
        dataKey="value"
      >
        {chartData.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            style={{ cursor: "pointer" }}
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) =>
          `${((value / total) * 100).toFixed(1)}% (${value})`
        }
        contentStyle={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontSize: "14px",
          fontWeight: "500",
        }}
      />
      <Legend
        wrapperStyle={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: "20px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#333",
        }}
      />
    </PieChart>
  );
};

export default ServiceOfEstatePieChart;

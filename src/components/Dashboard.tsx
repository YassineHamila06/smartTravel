import React from 'react';
import { Users, Map, TrendingUp, Award } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-lg p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const stats = [
    {
      icon: Map,
      label: 'Total Trips',
      value: '24',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: '156',
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Monthly Revenue',
      value: '$12,426',
      color: 'bg-purple-500',
    },
    {
      icon: Award,
      label: 'Loyal Clients',
      value: '45',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard
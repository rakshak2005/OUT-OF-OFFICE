import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
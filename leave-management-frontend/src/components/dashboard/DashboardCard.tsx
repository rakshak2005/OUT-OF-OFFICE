import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-6 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all">
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
import { useEffect, useState } from 'react';
import { api, type AgentRecap } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RecapChart() {
  const [data, setData] = useState<AgentRecap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecap().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-500 animate-pulse">Visualizing metrics...</div>;
  if (data.length === 0) return <div className="text-center p-8 text-gray-600 italic">Not enough data to graph.</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AgentRecap;
      return (
        <div className="bg-[#0F1923] border border-gray-700 p-3 rounded shadow-xl flex items-center gap-3">
          <img src={data.agent_icon} alt={data.agent_name} className="w-10 h-10 rounded bg-gray-900 object-cover" />
          <div>
             <p className="text-white font-bold uppercase">{data.agent_name}</p>
             <p className="text-gray-400 text-xs">Picked <span className="text-[#FF4655] font-bold">{data.pick_count}</span> times</p>
          </div>
        </div>
      );
    }
    return null;
  };


  
  const chartHeight = Math.max(400, data.length * 50);

  return (
    <div className="w-full bg-[#1c252e] border border-gray-700 rounded-lg p-6 overflow-hidden" style={{ height: `${chartHeight}px` }}>
            <p className='text-[9px] text-gray-500 mb-4'>How frequent agents picked</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" stroke="#6b7280" fontSize={10} />
          <YAxis dataKey="agent_name" type="category" stroke="#9ca3af" fontSize={10} width={80} />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="pick_count" fill="#FF4655" radius={[0, 4, 4, 0]}>
             {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index < 3 ? '#FF4655' : '#bd3e4a'} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

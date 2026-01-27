import { useEffect, useState } from 'react';
import { api, type AgentRecap } from '../../lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RoleIcon from '../ui/RoleIcon';

export default function RecapTable() {
  const [data, setData] = useState<AgentRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof AgentRecap>('pick_count');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    api.getRecap().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  const handleSort = (field: keyof AgentRecap) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const SortIndicator = ({ field }: { field: keyof AgentRecap }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDesc ? <ChevronDown size={14} className="text-[#FF4655]" /> : <ChevronUp size={14} className="text-[#FF4655]" />;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-8 h-8 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Syncing Database...</span>
    </div>
  );

  return (
    <div className="w-full bg-[#1c252e] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0F1923]/50 border-b border-gray-800">
              <th 
                className="px-6 py-5 cursor-pointer group transition-colors hover:bg-white/[0.02]" 
                onClick={() => handleSort('agent_name')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Agent</span>
                  <SortIndicator field="agent_name" />
                </div>
              </th>
              <th 
                className="px-6 py-5 cursor-pointer group transition-colors hover:bg-white/[0.02]" 
                onClick={() => handleSort('agent_role')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Role</span>
                  <SortIndicator field="agent_role" />
                </div>
              </th>
              <th 
                className="px-6 py-5 cursor-pointer group transition-colors hover:bg-white/[0.02] text-right" 
                onClick={() => handleSort('pick_count')}
              >
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Frequency</span>
                  <SortIndicator field="pick_count" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {sortedData.map((row) => (
              <tr key={row.agent_name} className="group hover:bg-white/[0.02] transition-all duration-300">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="absolute inset-0 bg-[#FF4655]/20 skew-x-12 group-hover:bg-[#FF4655]/40 transition-colors rounded-sm" />
                      <img 
                        src={row.agent_icon} 
                        alt={row.agent_name} 
                        className="relative z-10 w-full h-full object-cover rounded-sm border border-white/10 group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <span className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#FF4655] transition-colors">
                      {row.agent_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-900 rounded border border-gray-800 group-hover:border-gray-700 transition-colors">
                        <RoleIcon role={row.agent_role} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {row.agent_role}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex flex-col items-end">
                      <span className="text-lg font-black italic text-white leading-none tracking-tighter">
                        {row.pick_count}<span className="text-[10px] not-italic text-gray-600 ml-1 uppercase">Picks</span>
                      </span>
                   </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-2 opacity-30">
                      <div className="w-12 h-12 border border-dashed border-gray-500 rounded-full" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No Intelligence Gathered</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

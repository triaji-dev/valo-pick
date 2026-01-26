import { useEffect, useState } from 'react';
import { api, type AgentRecap } from '../../lib/api';
import { ArrowUpDown } from 'lucide-react';

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

  if (loading) return <div className="text-center p-8 text-gray-500 animate-pulse">Analyzing tactical data...</div>;

  return (
    <div className="w-full overflow-x-auto border border-gray-700 rounded-lg">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-[#1c252e] text-xs uppercase font-bold text-gray-200 border-b border-gray-700">
          <tr>
            <th className="px-6 py-4 cursor-pointer hover:text-[#FF4655] transition-colors" onClick={() => handleSort('agent_name')}>
               <div className="flex items-center gap-2">Agent <ArrowUpDown size={12}/></div>
            </th>
            <th className="px-6 py-4 cursor-pointer hover:text-[#FF4655] transition-colors" onClick={() => handleSort('agent_role')}>
               <div className="flex items-center gap-2">Role <ArrowUpDown size={12}/></div>
            </th>
            <th className="px-6 py-4 cursor-pointer hover:text-[#FF4655] transition-colors" onClick={() => handleSort('pick_count')}>
               <div className="flex items-center gap-2">Pick Count <ArrowUpDown size={12}/></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#0F1923]">
          {sortedData.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-bold text-white">
                <div className="flex items-center gap-3">
                  <img src={row.agent_icon} alt={row.agent_name} className="w-8 h-8 rounded bg-gray-900 border border-gray-700 object-cover" />
                  {row.agent_name}
                </div>
              </td>
              <td className="px-6 py-4">{row.agent_role}</td>
              <td className="px-6 py-4 font-mono text-[#FF4655]">{row.pick_count}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-600 italic">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

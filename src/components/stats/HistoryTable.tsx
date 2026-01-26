import { useEffect, useState, useRef, useCallback } from 'react';
import { api, type PickLog } from '../../lib/api';
import { format } from 'date-fns';
import { Trash2, Check, X } from 'lucide-react';

export default function HistoryTable() {
  const [logs, setLogs] = useState<PickLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastLogElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  useEffect(() => {
    setLoading(true);
    api.getHistory(20, 0).then(data => {
      setLogs(data);
      setHasMore(data.length === 20);
      setLoading(false);
    });
  }, []);

  const loadMore = async () => {
    setIsFetchingMore(true);
    const offset = logs.length;
    const moreData = await api.getHistory(20, offset);
    
    if (moreData.length < 20) {
        setHasMore(false);
    }
    setLogs(prev => [...prev, ...moreData]);
    setIsFetchingMore(false);
  };

  const handleDelete = async (id: string) => {
     api.deletePick(id).then(success => {
       if (success) {
         setLogs(prev => prev.filter(log => log.id !== id));
       }
       setConfirmDeleteId(null);
     });
  };

  if (loading) return <div className="text-center p-8 text-gray-500 animate-pulse">Loading history protocol...</div>;

  return (
    <div className="w-full overflow-x-auto border border-gray-700 rounded-lg">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-[#1c252e] text-xs uppercase font-bold text-gray-200 border-b border-gray-700">
          <tr>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4">Mode</th>
            <th className="px-6 py-4">Squad Composition</th>
            <th className="px-6 py-4 text-right w-[120px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#0F1923]">
          {logs.map((log, index) => (
            <tr 
                key={log.id} 
                ref={index === logs.length - 1 ? lastLogElementRef : null}
                className="hover:bg-white/5 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                {format(new Date(log.created_at), 'dd MMM HH:mm')}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  log.mode === 'balance' ? 'bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {log.mode}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {log.picked_agents.map((agent: any, i: number) => (
                    <div key={i} className="flex flex-col items-center" title={agent.displayName}>
                       <img src={agent.displayIcon} alt={agent.displayName} className="w-8 h-8 rounded border border-gray-700 bg-gray-900 object-cover" />
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {confirmDeleteId === log.id ? (
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all"
                      title="Confirm Delete"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-2 bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-all"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteId(log.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete Log"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-600 italic">
                No tactical records found.
              </td>
            </tr>
          )}
          {isFetchingMore && (
             <tr>
               <td colSpan={4} className="px-6 py-4 text-center text-xs text-gray-500 animate-pulse">
                 Retrieving archives...
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

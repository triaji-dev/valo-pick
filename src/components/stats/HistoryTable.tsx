import { useEffect, useState, useRef, useCallback } from 'react';
import { api, type PickLog } from '../../lib/api';
import { format } from 'date-fns';
import { Trash2, Check, X, RotateCcw, Clock, Shield, Zap } from 'lucide-react';

interface HistoryTableProps {
  onRestore?: (log: PickLog) => void;
}

export default function HistoryTable({ onRestore }: HistoryTableProps) {
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-8 h-8 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Accessing Archives...</span>
    </div>
  );

  return (
    <div className="w-full bg-[#1c252e] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0F1923]/50 border-b border-gray-800">
              <th className="px-0 py-0 md:px-6 md:py-5 hidden md:table-cell">
                <div className="flex items-center gap-2">
                   <Clock size={12} className="text-gray-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</span>
                </div>
              </th>
              <th className="px-0 py-0 md:px-6 md:py-5 hidden md:table-cell">
                <div className="flex items-center gap-2">
                   <Zap size={12} className="text-gray-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mode</span>
                </div>
              </th>
              <th className="px-0 py-0 md:px-6 md:py-5">
                <div className="flex items-center justify-center gap-2">
                   <Shield size={12} className="text-gray-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Composition</span>
                </div>
              </th>
              <th className="px-0 py-0 md:px-6 md:py-5 text-center md:text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {logs.map((log, index) => (
              <tr 
                key={log.id} 
                ref={index === logs.length - 1 ? lastLogElementRef : null}
                className="group hover:bg-white/[0.02] transition-all duration-300"
              >
                <td className="px-1 py-1 md:px-6 md:py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-xs font-black italic tracking-tighter text-white uppercase leading-none">
                      {format(new Date(log.created_at), 'dd MMM yyyy')}
                    </span>
                    <span className="text-[10px] font-mono text-gray-600 mt-1 uppercase">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-1 md:px-6 md:py-4 hidden md:table-cell">
                   <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-tighter rounded-sm ${
                      log.mode !== 'balance' 
                        ? 'bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {log.mode === 'balance' ? 'Balance' : 'Chaos'}
                   </span>
                </td>
                <td className="px-1 py-1 md:px-6 md:py-4">
                  <div className="flex justify-center space-x-1 md:space-x-2 transition-all">
                    {log.picked_agents.map((agent: any, i: number) => (
                      <div key={i} className="relative w-9 h-9 md:h-16 md:w-16 flex-shrink-0" title={agent.displayName}>
                        <div className="absolute inset-x-0 inset-y-0.5 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden transition-transform">
                          <img 
                            src={agent.displayIcon} 
                            alt={agent.displayName} 
                            className="w-full h-full object-cover hover:scale-110 opacity-70 transition-all" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-1 py-1 md:px-6 md:py-4">
                  {confirmDeleteId === log.id ? (
                    <div className="flex gap-1.5 justify-end">
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-sm transition-all"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700/50 rounded-sm transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 justify-end transition-opacity">
                        {onRestore && (
                          <button
                              onClick={() => onRestore(log)}
                              className="px-2 py-1.5 flex items-center gap-2 bg-blue-400/10 hover:bg-blue-400 text-blue-400 hover:text-white border border-blue-400/20 rounded-sm transition-all text-[9px] font-black uppercase tracking-widest"
                              title="Restore Sequence"
                          >
                              <RotateCcw size={14} />
                              <span className="hidden md:inline">Restore</span>
                          </button>
                        )}
                        <button 
                          onClick={() => setConfirmDeleteId(log.id)}
                          className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-all"
                          title="Purge Record"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-2 opacity-30">
                      <div className="w-12 h-12 border border-dashed border-gray-500 rounded-full" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Archive Empty</p>
                   </div>
                </td>
              </tr>
            )}
            {isFetchingMore && (
               <tr>
                 <td colSpan={4} className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#FF4655] animate-pulse">
                      <div className="w-1 h-1 bg-[#FF4655] rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-[#FF4655] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-[#FF4655] rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[9px] font-black uppercase tracking-widest ml-2">Loading More Data</span>
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

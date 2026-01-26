import { useState } from 'react';
import HistoryTable from './HistoryTable';
import RecapTable from './RecapTable';
import RecapChart from './RecapChart';

export default function StatisticsView() {
  const [activeTab, setActiveTab] = useState<'history' | 'recap_table' | 'recap_chart'>('history');

  return (
    <div className="w-full flex flex-col gap-6">
       <div className="flex gap-4 border-b border-gray-700 pb-2">
         <button 
           onClick={() => setActiveTab('history')}
           className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'history' ? 'text-white border-b-2 border-[#FF4655]' : 'text-gray-500 hover:text-gray-300'}`}
         >
           Log History
         </button>
         <button 
           onClick={() => setActiveTab('recap_table')}
           className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'recap_table' ? 'text-white border-b-2 border-[#FF4655]' : 'text-gray-500 hover:text-gray-300'}`}
         >
           Agent Recap (Table)
         </button>
         <button 
           onClick={() => setActiveTab('recap_chart')}
           className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'recap_chart' ? 'text-white border-b-2 border-[#FF4655]' : 'text-gray-500 hover:text-gray-300'}`}
         >
           Agent Recap (Chart)
         </button>
       </div>

       <div className="min-h-[400px]">
          {activeTab === 'history' && <HistoryTable />}
          {activeTab === 'recap_table' && <RecapTable />}
          {activeTab === 'recap_chart' && <RecapChart />}
       </div>
    </div>
  );
}

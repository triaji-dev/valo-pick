import { BarChart2 } from 'lucide-react';
import StatisticsView from './StatisticsView';
import type { PickLog } from '../../lib/api';

interface StatisticsSectionProps {
  onRestore?: (log: PickLog) => void;
}

export default function StatisticsSection({ onRestore }: StatisticsSectionProps) {
  return (
    <section className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <BarChart2 className="text-[#FF4655]" size={32} />
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Tactical <span className="text-[#FF4655]">Database</span></h2>
          <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">History & Analytics Protocol</p>
        </div>
      </div>
      <StatisticsView onRestore={onRestore} />
    </section>
  );
}

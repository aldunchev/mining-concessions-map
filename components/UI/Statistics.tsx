'use client';

import { useMemo, useState } from 'react';
import { BarChart3, MapPin, TrendingUp, Database, ChevronUp, ChevronDown } from 'lucide-react';
import { Deposit } from '@/lib/types';
import { calculateStatistics } from '@/lib/utils';

interface StatisticsProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
}

export default function Statistics({ deposits, filteredDeposits }: StatisticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stats = useMemo(() => {
    const all = calculateStatistics(deposits);
    const filtered = calculateStatistics(filteredDeposits);
    return { all, filtered };
  }, [deposits, filteredDeposits]);

  const topMinerals = useMemo(() => {
    return Object.entries(stats.filtered.byMineralType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.filtered.byMineralType]);

  const topRegions = useMemo(() => {
    return Object.entries(stats.filtered.byOblast)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.filtered.byOblast]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-semibold text-lg mb-4 lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          Статистика
        </div>
        <div className="lg:hidden">
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
        </div>
      </button>

      {/* Summary Cards */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Общо находища"
          value={stats.all.total}
          subValue={`${stats.filtered.total} показани`}
        />
        <StatCard
          icon={<MapPin className="h-4 w-4" />}
          label="Области"
          value={Object.keys(stats.all.byOblast).length}
          subValue={`${Object.keys(stats.filtered.byOblast).length} активни`}
        />
      </div>

      {/* Top Minerals */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Топ минерали</h3>
        <div className="space-y-2">
          {topMinerals.map(([mineral, count]) => (
            <div key={mineral} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate flex-1">{mineral}</span>
              <span className="text-xs font-medium text-gray-900 ml-2">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Regions */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Топ области</h3>
        <div className="space-y-2">
          {topRegions.map(([region, count]) => (
            <div key={region} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate flex-1">{region}</span>
              <span className="text-xs font-medium text-gray-900 ml-2">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Статус</h3>
        <div className="space-y-2">
          {Object.entries(stats.filtered.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate flex-1">{status}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${(count / stats.filtered.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-600 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-bold text-xl text-gray-900">{value}</div>
      {subValue && (
        <div className="text-xs text-gray-500">{subValue}</div>
      )}
    </div>
  );
}
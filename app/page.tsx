'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Deposit, DepositsData, MapFilters } from '@/lib/types';
import { filterDeposits } from '@/lib/utils';
import FilterPanel from '@/components/Filters/FilterPanel';
import Statistics from '@/components/UI/Statistics';
import { Menu, X } from 'lucide-react';

// Dynamically import GoogleMap to avoid SSR issues
const GoogleMapComponent = dynamic(
  () => import('@/components/Map/GoogleMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане на картата...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({
    search: '',
    oblast: [],
    mineralType: [],
    status: [],
    confidence: []
  });

  // Load deposits data
  useEffect(() => {
    fetch('/mining_deposits.json')
      .then(res => res.json())
      .then((data: DepositsData) => {
        setDeposits(data.deposits);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deposits:', err);
        setError('Failed to load deposits data');
        setLoading(false);
      });
  }, []);

  // Filter deposits based on current filters
  const filteredDeposits = useMemo(() => {
    return filterDeposits(deposits, filters);
  }, [deposits, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане на данни...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Грешка</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Минни концесии в България
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {filteredDeposits.length} от {deposits.filter(d => d.coordinates && !d.id.includes("Идентифика")).length} находища
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            absolute lg:relative inset-y-0 left-0 z-20 w-80 bg-gray-50 
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:transform-none overflow-y-auto border-r
          `}
        >
          <div className="p-4 space-y-4">
            <FilterPanel
              deposits={deposits}
              filters={filters}
              onFiltersChange={setFilters}
            />
            <Statistics
              deposits={deposits}
              filteredDeposits={filteredDeposits}
            />
          </div>
        </aside>

        {/* Map Container */}
        <main className="flex-1 relative">
          <GoogleMapComponent
            deposits={filteredDeposits}
            onMarkerClick={(deposit) => {
              console.log('Clicked deposit:', deposit);
            }}
          />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Deposit, MapFilters } from '@/lib/types';
import { getUniqueValues, cn } from '@/lib/utils';

interface FilterPanelProps {
  deposits: Deposit[];
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  className?: string;
}

export default function FilterPanel({ 
  deposits, 
  filters, 
  onFiltersChange, 
  className 
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['search', 'oblast', 'mineral', 'status'])
  );

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    const validDeposits = deposits.filter(d => d.coordinates && !d.id.includes("Идентифика"));
    return {
      oblasts: getUniqueValues(validDeposits, 'oblast'),
      minerals: getUniqueValues(validDeposits, 'vid_bogatstvo'),
      statuses: getUniqueValues(validDeposits, 'status'),
      confidences: ['high', 'medium', 'low']
    };
  }, [deposits]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterToggle = (
    filterType: keyof Omit<MapFilters, 'search'>, 
    value: string
  ) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      oblast: [],
      mineralType: [],
      status: [],
      confidence: []
    });
  };

  const activeFiltersCount = 
    filters.oblast.length + 
    filters.mineralType.length + 
    filters.status.length + 
    filters.confidence.length +
    (filters.search ? 1 : 0);

  return (
    <div className={cn("bg-white rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-lg">Филтри</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Изчисти
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-sm text-gray-700">Търсене</label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Търси находище, концесионер..."
                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Oblast Filter */}
          <FilterSection
            title="Област"
            sectionKey="oblast"
            isExpanded={expandedSections.has('oblast')}
            onToggle={() => toggleSection('oblast')}
            options={uniqueValues.oblasts}
            selectedValues={filters.oblast}
            onValueToggle={(value) => handleFilterToggle('oblast', value)}
          />

          {/* Mineral Type Filter */}
          <FilterSection
            title="Тип минерал"
            sectionKey="mineral"
            isExpanded={expandedSections.has('mineral')}
            onToggle={() => toggleSection('mineral')}
            options={uniqueValues.minerals}
            selectedValues={filters.mineralType}
            onValueToggle={(value) => handleFilterToggle('mineralType', value)}
          />

          {/* Status Filter */}
          <FilterSection
            title="Статус"
            sectionKey="status"
            isExpanded={expandedSections.has('status')}
            onToggle={() => toggleSection('status')}
            options={uniqueValues.statuses}
            selectedValues={filters.status}
            onValueToggle={(value) => handleFilterToggle('status', value)}
          />

          {/* Confidence Filter */}
          <FilterSection
            title="Точност на координати"
            sectionKey="confidence"
            isExpanded={expandedSections.has('confidence')}
            onToggle={() => toggleSection('confidence')}
            options={uniqueValues.confidences}
            selectedValues={filters.confidence}
            onValueToggle={(value) => handleFilterToggle('confidence', value)}
          />
        </div>
      )}
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  options: string[];
  selectedValues: string[];
  onValueToggle: (value: string) => void;
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  options,
  selectedValues,
  onValueToggle
}: FilterSectionProps) {
  return (
    <div className="border-t pt-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-2"
      >
        <span className="font-medium text-sm text-gray-700">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => onValueToggle(option)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 truncate">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
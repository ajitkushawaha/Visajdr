'use client';

import { useState } from 'react';

interface MutualExclusiveFilterProps {
  onSearchChange: (searchTerm: string) => void;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  onStatusChange?: (status: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  showStatusFilter?: boolean;
}

export default function MutualExclusiveFilter({
  onSearchChange,
  onDateChange,
  onStatusChange,
  onApplyFilters,
  onClearFilters,
  searchPlaceholder = "Search...",
  statusOptions = [],
  showStatusFilter = false
}: MutualExclusiveFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Clear date filters when searching
    if (value.trim()) {
      setDateFrom('');
      setDateTo('');
      onDateChange('', '');
    }
    onSearchChange(value);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    // Clear search when selecting date
    if (value) {
      setSearchTerm('');
      onSearchChange('');
    }
    onDateChange(value, dateTo);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    // Clear search when selecting date
    if (value) {
      setSearchTerm('');
      onSearchChange('');
    }
    onDateChange(dateFrom, value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    onSearchChange('');
    onDateChange('', '');
    if (onStatusChange) {
      onStatusChange('');
    }
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
      
      <div className={`grid grid-cols-1 md:grid-cols-${showStatusFilter ? '4' : '3'} gap-4`}>
        {/* Search */}
        <div className={showStatusFilter ? '' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            disabled={searchTerm.trim() !== ''}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              searchTerm.trim() !== '' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            disabled={searchTerm.trim() !== ''}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              searchTerm.trim() !== '' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filter Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onApplyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

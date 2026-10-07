'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Job = {
  _id: string;
  title: string;
  location: string;
  categories: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

type JobCategory = {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
};

export default function CareerListPage() {
  const [rows, setRows] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  // Enhanced filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title' | 'location'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Date range filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    
    // If search term is provided, use search filtering
    if (searchTerm.trim()) {
      sp.set('search', searchTerm);
    } 
    // If date range is provided, use date filtering
    else if (dateFrom || dateTo) {
      if (dateFrom) sp.set('from', dateFrom);
      if (dateTo) sp.set('to', dateTo);
    }
    
    if (selectedCategory) sp.set('category', selectedCategory);
    if (selectedStatus) sp.set('status', selectedStatus);
    if (selectedLocation) sp.set('location', selectedLocation);
    sp.set('page', String(page));
    sp.set('limit', String(limit));
    sp.set('sort', sortBy);
    sp.set('dir', sortOrder);
    return sp.toString();
  }, [searchTerm, dateFrom, dateTo, selectedCategory, selectedStatus, selectedLocation, page, limit, sortBy, sortOrder]);

  // Fetch job categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/career-categories', { cache: 'no-store' });
        const data = await res.json();
        setCategories(data.rows || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/career-categories/category-list?${query}`, { cache: 'no-store' });
      const data = await res.json();
      
      // Deduplicate rows by _id to prevent React key conflicts
      const uniqueRows = (data.rows || []).filter((job: Job, index: number, self: Job[]) => 
        index === self.findIndex(j => j._id === job._id)
      );
      setRows(uniqueRows);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setRows([]);
    } finally {
      setLoading(false);
      setSelected([]);
    }
  }

  useEffect(() => { fetchRows(); }, [query]);

  function resetFilters() {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLocation('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
  }

  async function remove(id: string) {
    if (!confirm('Delete this job?')) return;
    try {
      const res = await fetch(`/api/admin/career-categories/category-list/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Delete failed');
        return;
      }
      fetchRows();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Delete failed');
    }
  }

  async function bulkDelete() {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} job(s)?`)) return;
    
    try {
      const promises = selected.map(id => 
        fetch(`/api/admin/career-categories/category-list/${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);
      fetchRows();
    } catch (error) {
      console.error('Error bulk deleting jobs:', error);
      alert('Bulk delete failed');
    }
  }

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => {
    if (allChecked) setSelected([]);
    else setSelected(rows.map(r => r._id));
  };
  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = rows.map(job => job.location).filter(Boolean);
    return [...new Set(locations)].sort();
  }, [rows]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-6 mb-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-600 mt-1">Manage and organize job postings</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/career/list/new">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <span>+</span>
              <span>Add New Job</span>
            </button>
          </Link>
          <button 
            onClick={() => fetchRows()} 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Clear date filters when searching
                if (e.target.value.trim()) {
                  setDateFrom('');
                  setDateTo('');
                }
              }}
              placeholder="Search by title, description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                // Clear search when selecting date
                if (e.target.value) {
                  setSearchTerm('');
                }
              }}
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
              onChange={(e) => {
                setDateTo(e.target.value);
                // Clear search when selecting date
                if (e.target.value) {
                  setSearchTerm('');
                }
              }}
              disabled={searchTerm.trim() !== ''}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                searchTerm.trim() !== '' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
              }`}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={fetchRows}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selected.length} job(s) selected
            </span>
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={allChecked} 
                    onChange={toggleAll} 
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">Job Title</th>
                <th className="p-4 text-left font-semibold text-gray-900">Category</th>
                <th className="p-4 text-left font-semibold text-gray-900">Location</th>
                <th className="p-4 text-left font-semibold text-gray-900">Type</th>
                <th className="p-4 text-left font-semibold text-gray-900">Experience</th>
                <th className="p-4 text-left font-semibold text-gray-900">Salary</th>
                <th className="p-4 text-left font-semibold text-gray-900">Status</th>
                <th className="p-4 text-left font-semibold text-gray-900">Created</th>
                <th className="p-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📋</div>
                      <div className="text-lg text-gray-500">No Jobs Found</div>
                      <div className="text-sm text-gray-400 mt-1">Try adjusting your search filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((job) => (
                  <tr key={job._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(job._id)}
                        onChange={() => toggleOne(job._id)}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{job.title}</div>
                      {job.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {job.description.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.categories}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">{job.location}</td>
                    <td className="p-4 text-gray-900">{job.type}</td>
                    <td className="p-4 text-gray-900">{job.experience || 'N/A'}</td>
                    <td className="p-4 text-gray-900">{job.salary || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/career/list/${job._id}`}>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => remove(job._id)}
                          className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(rows.length > 0) ? ((page - 1) * limit + 1) : 0}–{(page - 1) * limit + rows.length} of {total} jobs
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 px-3">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
type JobApplication = {
  _id: string
  jobTitle?: string
  jobCategory?: string
  name: string
  email: string
  phone: string
  city?: string
  noticePeriod?: string // e.g., "30 days"
  currentCompany?: string
  experience: string // e.g., "4.5"
  currentCTC?: string // e.g., "8 LPA"
  expectedCTC?: string
  resumeUrl?: string
  position?: string
  appliedAt?: string // ISO
  status: string
  createdAt?: string
}

type KeyOption =
  | ''
  | 'jobTitle'
  | 'jobCategory'
  | 'name'
  | 'email'
  | 'phone'
  | 'city'
  | 'noticePeriod'
  | 'currentCompany'
  | 'experience'
  | 'currentCTC'
  | 'expectedCTC'
  | 'position'
  | 'status'

export default function JobApplicationList() {
  const [rows, setRows] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  // filters
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const query = useMemo(() => {
    const sp = new URLSearchParams()

    // If search term is provided, use search filtering
    if (searchTerm.trim()) {
      sp.set('search', searchTerm)
    }
    // If date range is provided, use date filtering
    else if (dateFrom || dateTo) {
      if (dateFrom) sp.set('from', dateFrom)
      if (dateTo) sp.set('to', dateTo)
    }

    if (statusFilter) sp.set('status', statusFilter)
    return sp.toString()
  }, [searchTerm, dateFrom, dateTo, statusFilter])

  async function fetchRows() {
    setLoading(true)
    try {
      const url = `/api/admin/career-categories/job` // fix spelling
      const res = await fetch(url, { cache: 'no-store' })

      // If not OK, log text for debugging (HTML error pages will show here)
      if (!res.ok) {
        const text = await res.text()
        console.error(`HTTP ${res.status} from ${url}`, text.slice(0, 300))
        setRows([])
        setSelected([])
        return
      }

      // Check content-type to avoid JSON parse on HTML
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text.slice(0, 300))
        setRows([])
        setSelected([])
        return
      }

      const data = await res.json()
      setRows(Array.isArray(data?.rows) ? data.rows : [])
      setSelected([])
    } catch (e) {
      console.error('fetchRows error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [query])

  function resetFilters() {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
  }

  const allChecked = rows.length > 0 && selected.length === rows.length
  const toggleAll = () => setSelected(allChecked ? [] : rows.map(r => r._id))
  const toggleOne = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  async function bulkDelete() {
    if (selected.length === 0) return
    if (!confirm(`Delete ${selected.length} application(s)?`)) return
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, action: 'delete' }),
    })
    if (!res.ok) {
      alert('Delete failed')
      return
    }
    await fetchRows()
  }
  function truncate(str: string, max = 10) {
    if (!str) return ''
    return str.length > max ? str.slice(0, max) + '...' : str
  }
  return (
    <div className=" bg-slate-100 py-6">
      <div className="">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white rounded-md border p-4">
          <h1 className="text-xl text-gray-900 font-semibold tracking-wide">
            APPLIED JOB LIST
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/career/list"
              className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-3 py-2 text-white hover:bg-blue-700"
            >
              <span className="text-sm font-medium ">Job Listings</span>
            </Link>
            <button
              onClick={bulkDelete}
              className="inline-flex items-center gap-2 rounded-md bg-red-800 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={selected.length === 0}
            >
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 bg-white rounded-md border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            {/* Search */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Search Applications
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  // Clear date filters when searching
                  if (e.target.value.trim()) {
                    setDateFrom('')
                    setDateTo('')
                  }
                }}
                placeholder="Search by name, email, job title..."
                className="w-full border rounded px-3 py-2 text-gray-900 bg-white placeholder-gray-500"
              />
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => {
                  setDateFrom(e.target.value)
                  // Clear search when selecting date
                  if (e.target.value) {
                    setSearchTerm('')
                  }
                }}
                disabled={searchTerm.trim() !== ''}
                className={`w-full border rounded px-3 py-2 text-gray-900 bg-white ${
                  searchTerm.trim() !== ''
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                    : ''
                }`}
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={e => {
                  setDateTo(e.target.value)
                  // Clear search when selecting date
                  if (e.target.value) {
                    setSearchTerm('')
                  }
                }}
                disabled={searchTerm.trim() !== ''}
                className={`w-full border rounded px-3 py-2 text-gray-900 bg-white ${
                  searchTerm.trim() !== ''
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                    : ''
                }`}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="reviewed">Reviewed</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchRows}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-md border bg-white">
          <div className="overflow-auto">
            <table className=" w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-3 text-left">Job Title</th>
                  <th className="p-3 text-left">Job Category</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Resume</th>
                  <th className="p-3 text-left">View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="p-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                          Loading applications...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="p-6 text-center text-lg text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">📋</div>
                        <div>No Job Applications Found</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Try adjusting your search filters
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map(r => (
                    <tr key={r._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(r._id)}
                          onChange={() => toggleOne(r._id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 text-gray-900">
                        {r.jobTitle || r.position || 'N/A'}
                      </td>
                      <td className="p-3 text-gray-900">
                        {r.jobCategory || 'N/A'}
                      </td>
                      <td className="p-3 text-gray-900">{r.name}</td>
                      <td className="p-3 text-gray-900">{r.email}</td>
                      <td className="p-3 text-gray-900">{r.phone}</td>
                      <td className="p-3 text-gray-900">{r.city || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            r.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : r.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {r.resumeUrl ? (
                          <a
                            className="text-blue-600 hover:underline"
                            href={`${r.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {truncate(r.resumeUrl, 10)}
                          </a>
                        ) : (
                          <span className="text-gray-400">No resume</span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/admin/career/job/${r._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

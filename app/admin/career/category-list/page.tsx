'use client'

import { useEffect, useMemo, useState } from 'react'

type Row = {
  _id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export default function CareerCategoriesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(10)

  // Filters
  const [key, setKey] = useState<'name' | 'slug' | 'status' | ''>('')
  const [value, setValue] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<'createdAt' | 'updatedAt' | 'name'>(
    'createdAt'
  )
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  // Modal
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const canSubmit = name.trim().length >= 2

  const query = useMemo(() => {
    const sp = new URLSearchParams()
    if (key && value) {
      sp.set('key', key)
      sp.set('value', value)
    }
    if (from) sp.set('from', from)
    if (to) sp.set('to', to)
    sp.set('page', String(page))
    sp.set('limit', String(limit))
    sp.set('sort', sort)
    sp.set('dir', dir)
    return sp.toString()
  }, [key, value, from, to, page, limit, sort, dir])
  async function fetchRows() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/career-categories?${query}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      setRows(data.rows || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setRows([])
    } finally {
      setLoading(false)
      setSelected([])
    }
  }

  useEffect(() => {
    fetchRows()
  }, [query])

  function resetFilters() {
    setKey('')
    setValue('')
    setFrom('')
    setTo('')
    setPage(1)
    setSort('createdAt')
    setDir('desc')
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setStatus('active')
    setOpen(true)
  }

  function openEdit(r: Row) {
    setEditing(r)
    setName(r.name)
    setStatus(r.status)
    setOpen(true)
  }

  async function save() {
    if (!canSubmit) return
    const payload = { name, status }
    const res = await fetch(
      editing
        ? `/api/admin/career-categories/${editing._id}`
        : '/api/admin/career-categories',
      {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (!res.ok) {
      const err = await res.json()
      alert(`Error: ${JSON.stringify(err.error || err)}`)
      return
    }
    setOpen(false)
    fetchRows()
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/admin/career-categories/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) alert('Delete failed')
    fetchRows()
  }

  async function bulk(
    action: 'status' | 'delete',
    status?: 'active' | 'inactive'
  ) {
    if (selected.length === 0) return
    if (action === 'delete' && !confirm(`Delete ${selected.length} item(s)?`))
      return
    const res = await fetch('/api/admin/career-categories/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, action, status }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(`Error: ${JSON.stringify(err.error || err)}`)
      return
    }
    fetchRows()
  }

  const allChecked = rows.length > 0 && selected.length === rows.length
  const toggleAll = () => {
    if (allChecked) setSelected([])
    else setSelected(rows.map(r => r._id))
  }
  const toggleOne = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between bg-white rounded-lg border p-4 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Career Categories List
        </h1>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Career Categories
          </button>
          <button
            onClick={() => bulk('delete')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm mb-1 text-gray-700">
              Select key to search by *
            </label>
            <select
              value={key}
              onChange={e => setKey(e.target.value as any)}
              className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
            >
              <option value="">Please select</option>
              <option value="name">Job Category Name</option>
              <option value="slug">Slug Url</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1 text-gray-700">Value</label>
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Value"
              className="w-full border rounded px-3 py-2 text-gray-900 bg-white placeholder-gray-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1 text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1 text-gray-700">To Date</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div className="md:col-span-1 flex gap-2">
            <button
              onClick={fetchRows}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-auto border rounded">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-3 text-left">Job Category Name</th>
              <th className="p-3 text-left">Slug Url</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created Date</th>
              <th className="p-3 text-left">Modified Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-600">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-600">
                  No Career Found
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
                  <td className="p-3 text-gray-900">{r.name}</td>
                  <td className="p-3 text-gray-900">{r.slug || '-'}</td>
                  <td className="p-3">
                    {r.status ? (
                      <span
                        className={`px-2 py-1 rounded text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}
                      >
                        {r.status}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-900">
                    {r.createdAt
                      ? (() => {
                          const date = new Date(r.createdAt)
                          return isNaN(date.getTime())
                            ? '-'
                            : date.toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                        })()
                      : '-'}
                  </td>
                  <td className="p-3 text-gray-900">
                    {r.updatedAt
                      ? (() => {
                          const date = new Date(r.updatedAt)
                          return isNaN(date.getTime())
                            ? '-'
                            : date.toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                        })()
                      : '-'}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openEdit(r)}
                      className="px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r._id)}
                      className="px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between bg-white rounded-lg border p-4">
        <div className="text-sm text-gray-600">
          Showing {rows.length > 0 ? (page - 1) * limit + 1 : 0}–
          {(page - 1) * limit + rows.length} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} / {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
            className="px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
          <select
            value={limit}
            onChange={e => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded shadow-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? 'Edit Career Category' : 'Add Career Category'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Job Category Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!canSubmit}
                onClick={save}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

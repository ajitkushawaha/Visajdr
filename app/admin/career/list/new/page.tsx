'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Department {
  id: string
  name: string
}

export default function NewJobPage() {
  const router = useRouter()

  const [jobTitle, setJobTitle] = useState('')
  const [categories, setCategories] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('Full-time')
  const [experience, setExperience] = useState('')
  const [salary, setSalary] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/career-categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // Handle fetched data if needed
        setDepartments(data?.rows || [])
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      jobTitle,
      categories,
      location,
      jobType,
      experience,
      salary,
      description,
      requirements,
      status,
    }

    try {
      const res = await fetch('/api/admin/career-categories/category-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(`Error: ${err.message || 'Failed to create job'}`)
      } else {
        alert('Job created successfully!')
        router.push('/admin/career/list')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Add New Job</h1>
        <button
          onClick={() => router.push('/admin/career/list')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Jobs
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm mb-1">Job Title *</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm mb-1">Categories *</label>
            <select
              value={categories}
              onChange={e => setCategories(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Category</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-1">Location *</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm mb-1">Job Type *</label>
            <select
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm mb-1">Experience *</label>
            <input
              value={experience}
              onChange={e => setExperience(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 2+ years"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm mb-1">Salary</label>
            <input
              value={salary}
              onChange={e => setSalary(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. ₹50,000/month"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm mb-1">Requirements *</label>
            <textarea
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              required
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/career/list')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Saving…' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

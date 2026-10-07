'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Department {
  _id: string
  name: string
}

export default function JobFormPage() {
  const router = useRouter()
  const params = useParams() // will have { id: "..." } or undefined
  const jobId = params?.id as string | undefined

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

  // Fetch departments
  useEffect(() => {
    fetch('/api/admin/career-categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setDepartments(data?.rows || []))
  }, [])

  // If edit → fetch existing job
  useEffect(() => {
    fetch(`/api/admin/career-categories/category-list/${jobId}`, {
      cache: 'no-store',
    })
      .then(res => res.json())
      .then(data => {
        const job = data
        setJobTitle(job.title)
        setCategories(job.categories)
        setLocation(job.location)
        setJobType(job.type)
        setExperience(job.experience)
        setSalary(job.salary)
        setDescription(job.description)
        setRequirements(job.requirements)
        setStatus(job.status)
      })
  }, [jobId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      title: jobTitle,
      categories,
      location,
      type: jobType,
      experience,
      salary,
      description,
      requirements,
      status,
    }

    try {
      const res = await fetch(
        `/api/admin/career-categories/category-list/${jobId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        alert(`Error: ${err.message || 'Failed to save job'}`)
      } else {
        alert('Job updated successfully!')
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
      <h1 className="text-xl font-semibold mb-6">{'Edit Job'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/career/list')}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Update Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

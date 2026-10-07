'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PolicyForm from '../../components/PolicyForm'
import { toast } from 'sonner'

export default function EditPolicyPage() {
  const params = useParams()
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/admin/pages/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setPageData(data)
        } else {
          toast.error('Failed to load policy')
        }
      } catch (error) {
        toast.error('Error loading policy')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPage()
    }
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return <PolicyForm initialData={pageData} isEditing={true} />
}

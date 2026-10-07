'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Page {
  _id: string
  title: string
  slug: string
  status: 'active' | 'inactive' | 'draft'
  updatedAt: string
}

export default function PoliciesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/admin/pages?category=policy')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages)
      } else {
        toast.error('Failed to fetch policies')
      }
    } catch (error) {
      toast.error('Error loading policies')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Policy deleted successfully')
        fetchPolicies()
      } else {
        toast.error('Failed to delete policy')
      }
    } catch (error) {
      toast.error('Error deleting policy')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
          <p className="text-muted-foreground">
            Manage your dynamic policy pages (Refund, Cookie, etc.)
          </p>
        </div>
        <Link href="/admin/content/policies/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Policy
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No policies found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map(page => (
                  <TableRow key={page._id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          page.status === 'active'
                            ? 'default'
                            : page.status === 'draft'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/policies/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/content/policies/edit/${page._id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(page._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

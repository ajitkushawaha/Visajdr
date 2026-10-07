import React from 'react'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/db'
import Page from '@/models/Page'
import { Metadata } from 'next'

interface PolicyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const resolvedParams = await params
  await connectDB()
  const page = await Page.findOne({
    slug: resolvedParams.slug,
    status: 'active',
    category: 'policy',
  })

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    keywords: page.metaKeywords,
  }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const resolvedParams = await params
  await connectDB()
  const page = await Page.findOne({
    slug: resolvedParams.slug,
    status: 'active',
    category: 'policy',
  })

  if (!page) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}

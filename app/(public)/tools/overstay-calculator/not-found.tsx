import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Calculator Not Available
        </h1>
        <p className="text-gray-600 mb-8">
          The overstay calculator for this country is not currently available.
        </p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    </div>
  )
}

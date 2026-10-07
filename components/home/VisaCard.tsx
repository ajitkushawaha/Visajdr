import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'

interface VisaCardProps {
  country: string
  image: string
  processedCount: string
  processingDate: string
  link: string
  isTrending?: boolean
}

export function VisaCard({
  country,
  image,
  processedCount,
  processingDate,
  link,
  isTrending,
}: VisaCardProps) {
  return (
    <Link href={link} className="block group h-full">
      <Card className="h-full overflow-hidden border border-gray-200 bg-white  transition-all duration-300 rounded-xl">
        <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden ">
          <Image
            src={optimizeCloudinaryUrl(image)}
            alt={`${country} Visa`}
            fill
            className="object-cover p-1 transition-transform duration-500 group-hover:scale-110 rounded-xl"
          />
          {/* <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-black backdrop-blur-sm hover:bg-white font-bold text-[10px] px-3 py-1.5 h-auto rounded-full shadow-sm"
            >
              {processedCount} Visas Processed
            </Badge>
          </div> */}
        </div>

        <CardContent className="py-3 px-4">
          <h4 className="text-base font-bold text-gray-900 group-hover:text-brand-primary transition-colors capitalize mb-1">
            {country}
          </h4>
          <p className="text-xs text-gray-500 font-medium">{processingDate}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

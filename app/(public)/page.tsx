import dynamic from 'next/dynamic'
import CountrySwiper from '@/components/common/CountrySwiper'
import { VisaSection } from '@/components/home/VisaSection'

// Lazy load non-critical components for better initial page load
const ScrollingServices = dynamic(
  () => import('@/components/home/ScrollingServices'),
  {
    ssr: true, // Still render on server for SEO
  }
)
import BrandCollaborationSection from '@/components/home/BrandCollaborationSection'
import RecognitionSection from '@/components/home/RecognitionSection'
import FAQSection from '@/components/home/FAQSection'
import CTASection from '@/components/home/CTASection'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import { fetchHomePageData } from '@/lib/homePageData'
import PreloadResources from '@/components/seo/PreloadResources'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'
import HeroSearchSection from '@/components/home/HeroSearchSection'
import AboutTestimonials from '@/components/about/AboutTestimonials'

export const revalidate = 0

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/')
  return generateSEOMetadata(seoData)
}

export default async function HomePage() {
  // Fetch all home page data server-side in parallel
  const pageData = await fetchHomePageData()
  // Filter Services
  const trendingServices = pageData.services
    .filter((s: any) => s.hotlistedCount > 0)
    .slice(0, 5)

  const otherServices = pageData.services
    .filter((s: any) => s.restlistedCount > 0)
    .slice(0, 5)

  const fastTrackServices = pageData.services
    .filter((s: any) =>
      s.visaTypes.some((v: any) => {
        const days = parseInt(v.processingTime || '999')
        return days <= 1
      })
    )
    .slice(0, 5)
  // const weeklyServices = pageData.services
  //   .filter((s: any) =>
  //     s.visaTypes.some((v: any) => {
  //       const days = parseInt(v.processingTimeDays || '999')
  //       return days <= 7
  //     })
  //   )
  //   .slice(0, 5)

  const schengenServices = pageData.services
    .filter((s: any) =>
      s.visaTypes.some((v: any) =>
        v.processingTimeDays?.toLowerCase().includes('schengen')
      )
    )
    .slice(0, 5)

  // Get LCP image URL for preloading (first image of trending services)
  const lcpImageUrl = (() => {
    const imageUrl = trendingServices[0]?.countryImage || '/visa/Rectangle.png'
    if (imageUrl.includes('cloudinary.com')) {
      return optimizeCloudinaryUrl(imageUrl, {
        width: 1200,
        height: 900,
        quality: 'auto:good',
        format: 'auto',
      })
    }
    return imageUrl
  })()

  // Get animated countries from Hero Section data or fallback
  const heroFloatingCountries = pageData.heroContent?.floatingCountries || []
  const animatedCountries =
    heroFloatingCountries.length > 0
      ? heroFloatingCountries.map((c: any) => c.country)
      : ['France', 'Indonesia', 'Ireland', 'Egypt', 'Australia']

  // Duplicate the first country at the end for seamless loop animation
  const displayCountries = [...animatedCountries, animatedCountries[0]]
  return (
    <div className="pt-10 bg-white  space-y-6">
      {/* Preload critical resources for faster FCP and LCP */}
      <PreloadResources lcpImageUrl={lcpImageUrl} />
      <HeroSearchSection />

      <div className="pt-6 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center  gap-1 justify-center text-3xl md:text-4xl font-semibold text-gray-800">
          <span>{pageData.heroContent?.title || 'Get'} </span>
          <span className="relative flex items-center h-[2.5rem] md:h-[3rem] overflow-hidden align-bottom">
            <CountrySwiper countries={displayCountries} />
          </span>
          <span>{pageData.heroContent?.highlightedText || 'Visa Online'}</span>
        </div>

        <p className="mt-3 text-gray-600 text-sm md:text-base">
          {pageData.heroContent?.description ? (
            <span
              dangerouslySetInnerHTML={{
                __html: pageData.heroContent.description.replace(
                  /(\d+(\.\d+)?%)/g,
                  '<b class="font-semibold">$1</b>'
                ),
              }}
            />
          ) : (
            <>
              With <b className="font-semibold">99.3%</b> Approval Rate
            </>
          )}
        </p>
      </div>
      {/* Hot Listed Visa */}
      {trendingServices.length > 0 && (
        <VisaSection title="Trending Countries" services={trendingServices} />
      )}

      {/* Visa within 24 Hours */}
      {fastTrackServices.length > 0 && (
        <VisaSection
          title="Visa within 24 Hours"
          services={fastTrackServices}
        />
      )}

      {/* Visa in a Week */}
      {/* {weeklyServices.length > 0 && (
        <VisaSection title="Visa in a Week" services={weeklyServices} />
      )} */}

      {/* Schengen */}
      {schengenServices.length > 0 && (
        <VisaSection title="Schengen" services={schengenServices} />
      )}

      {/* Other Countries */}
      {otherServices.length > 0 && (
        <VisaSection title="Rest Of Countries" services={otherServices} />
      )}
      {/* Brand Collaboration with server-side data */}
      <BrandCollaborationSection initialData={pageData.brandCollaboration} />

      {/* CTA Section with server-side data */}
      <CTASection initialData={pageData.ctaSection} />

      {/* Testimonials */}
      <AboutTestimonials initialData={pageData.testimonials} />

      {/* Recognition Section */}
      <RecognitionSection initialData={pageData.recognitionSection} />

      {/* FAQ Section with server-side data */}
      <FAQSection initialFaqs={pageData.faqs} />
    </div>
  )
}

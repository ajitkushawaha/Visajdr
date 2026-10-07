import Link from 'next/link'
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ChevronRight,
  Youtube,
} from 'lucide-react'
import { getNavigationData } from '@/lib/navigation'
import { getCompanySettings as fetchSettings } from '@/lib/companySettings'

async function getFooterData() {
  return await getNavigationData('footer')
}
async function getMainData() {
  return await getNavigationData('main')
}

async function getCompanySettings() {
  const data = await fetchSettings()
  if (data) {
    return {
      copyright: data.copyright || '© 2025 Visa4. All rights reserved.',
      companyName: data.companyName || 'Visa4',
      logoUrl: data.logoUrl || '/logo.png',
      streetAddress:
        data.streetAddress ||
        'F -14 1st Floor Alfran Plaza Near Don Bosco, MG Road, Panjim, Goa, India',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      zipCode: data.zipCode || '403001',
      supportNo: data.supportNo || '+919822553417',
      supportEmail: data.supportEmail || 'sales@eu-world.com',
      facebookLink: data.facebookLink || '',
      instagramLink: data.instagramLink || '',
      twitterLink: data.twitterLink || '',
      linkedinLink: data.linkedinLink || '',
      youtubeLink: data.youtubeLink || '',
    }
  }
  return {
    copyright: '© 2025 Visa4. All rights reserved.',
    companyName: 'Visa4',
    logoUrl: '/logo.png',
    streetAddress:
      'F -14 1st Floor Alfran Plaza Near Don Bosco, MG Road, Panjim, Goa, India',
    zipCode: '403001',
    supportNo: '+919822553417',
    supportEmail: 'sales@eu-world.com',
    facebookLink: '',
    instagramLink: '',
    twitterLink: '',
    linkedinLink: '',
  }
}

// Removed Explore Visas countries listing from footer

export default async function Footer() {
  const navData = await getFooterData()
  const companySettings = await getCompanySettings()
  const maainData = navData[0].dropdownItems.filter(
    (item: any) => item.status === 'active'
  )
  // Extract links from footer navigation data
  const usefulLinksItem = navData.find(
    (item: any) => item.label === 'Useful Links'
  )
  const agentLinksItem =
    navData.find((item: any) => item.label === 'For Agent') ||
    navData.find((item: any) => item.label === 'Policies')

  const usefulLinks = (usefulLinksItem?.dropdownItems || []).filter(
    (item: any) => item.status === 'active'
  )
  const agentLinks = (agentLinksItem?.dropdownItems || []).filter(
    (item: any) => item.status === 'active'
  )

  return (
    <footer className="bg-white text-gray-700 shadow-md">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-7xl w-full max-[600px]:w-[90%] grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:items-start md:justify-items-center p-8">
          {/* Company Info */}
          <div className="text-gray-600 flex flex-col items-start justify-center gap-4">
            <img
              src={companySettings.logoUrl}
              alt={companySettings.companyName}
              className="w-40"
              width={160}
              height={40}
            />

            <h3 className="text-base md:text-lg font-semibold mb-1 px-2">
              Head Office
            </h3>
            <span className="text-gray-500 text-xs md:text-sm  block px-2">
              {companySettings.streetAddress}
              {companySettings.city && `, ${companySettings.city}`}
              {companySettings.state && `, ${companySettings.state}`}
              {companySettings.country && `, ${companySettings.country}`}
              {companySettings.zipCode && (
                <>
                  <br /> {companySettings.zipCode}
                </>
              )}
            </span>

            {companySettings.supportNo && (
              <a
                href={`tel:${companySettings.supportNo}`}
                className="text-600 px-2 text-xs md:text-sm hover:text-black transition-colors block"
              >
                {companySettings.supportNo}
              </a>
            )}
            {companySettings.supportEmail && (
              <a
                href={`mailto:${companySettings.supportEmail}`}
                className="text-600 px-2 text-xs md:text-sm hover:text-black transition-colors block"
              >
                {companySettings.supportEmail}
              </a>
            )}
          </div>

          {/* Branches */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              {navData[0].label}
            </h3>
            <ul className="space-y-2">
              {maainData.map((item: any, index: number) => (
                <ul key={item._id || index}>
                  <li>
                    <h3 className="text-gray-700 text-xs md:text-sm font-medium capitalize">
                      {item.label}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm capitalize">
                      {item.href}
                    </p>
                  </li>
                </ul>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              {navData[1].label}
            </h3>
            <ul className="space-y-2">
              {/* Dynamic Useful Links */}
              {usefulLinks.length > 0 &&
                usefulLinks.map((item: any, index: number) => (
                  <li key={item._id || index}>
                    <Link
                      href={item.href}
                      className="text-600 text-xs md:text-sm flex items-center hover:text-black"
                      target={item.target || '_self'}
                    >
                      <ChevronRight
                        size={12}
                        className="md:w-[14px] md:h-[14px]"
                      />{' '}
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              {navData[2].label}
            </h3>
            <ul className="space-y-2">
              {agentLinks.map((item: any, index: number) => (
                <li key={item._id || index}>
                  <Link
                    href={item.href}
                    className="text-600 text-xs md:text-sm flex items-center hover:text-black"
                    target={item.target || '_self'}
                  >
                    <ChevronRight
                      size={12}
                      className="md:w-[14px] md:h-[14px]"
                    />{' '}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="w-full max-w-7xl px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {companySettings.facebookLink && (
            <a
              href={companySettings.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group  border-t border-gray-300  pt-4"
              aria-label="Facebook"
            >
              <span className="text-xs md:text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                Facebook
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Facebook size={16} className="text-blue-600" />
              </div>
            </a>
          )}

          {companySettings.twitterLink && (
            <a
              href={companySettings.twitterLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group  border-t border-gray-300 pt-4"
              aria-label="X (Twitter)"
            >
              <span className="text-xs md:text-sm text-gray-600 group-hover:text-black transition-colors">
                X
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <Twitter size={16} className="text-black" />
              </div>
            </a>
          )}

          {companySettings.instagramLink && (
            <a
              href={companySettings.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group  border-t border-gray-300 pt-4 "
              aria-label="Instagram"
            >
              <span className="text-xs md:text-sm text-gray-600 group-hover:text-pink-600 transition-colors">
                Instagram
              </span>
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <Instagram size={16} className="text-pink-600" />
              </div>
            </a>
          )}

          {companySettings.linkedinLink && (
            <a
              href={companySettings.linkedinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group  border-t border-gray-300 pt-4 "
              aria-label="LinkedIn"
            >
              <span className="text-xs md:text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                LinkedIn
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Linkedin size={16} className="text-blue-700" />
              </div>
            </a>
          )}

          {companySettings.youtubeLink && (
            <a
              href={companySettings.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group  border-t border-gray-300 pt-4"
              aria-label="Youtube"
            >
              <span className="text-xs md:text-sm text-gray-600 group-hover:text-red-600 transition-colors">
                Youtube
              </span>
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Youtube size={16} className="text-red-600" />
              </div>
            </a>
          )}
        </div>
      </div>

      <div className="w-full  flex items-center justify-center py-10 ">
        <p className="text-600 text-xs md:text-sm">
          {companySettings.copyright}
        </p>
      </div>
    </footer>
  )
}

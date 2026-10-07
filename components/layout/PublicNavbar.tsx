'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import HomeNavbar from './HomeNavbar'

export default function PublicNavbar() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return !isHomePage && <HomeNavbar />
}

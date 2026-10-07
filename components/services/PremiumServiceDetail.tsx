import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  Mail,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  Play,
  FileCheck,
  Plane,
  Home,
  Calendar,
  CreditCard,
  Briefcase,
  UserCheck,
  Star,
  GraduationCap,
  Activity,
  Compass,
  Repeat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ClientReviews from './ClientReviews'
import ServiceFaqs from './ServiceFaqs'
import ApplicationPacketCarousel from './ApplicationPacketCarousel'

interface Step {
  number?: string
  title: string
  description: string
}

interface Benefit {
  icon?: string
  title: string
  description: string
}

interface Requirement {
  title: string
  description: string
}

interface Faq {
  question: string
  answer: string
}

interface ServiceData {
  title: string
  slug: string
  hero: {
    title: string
    subtitle: string
    image?: string
    imageAlt?: string
    badgeText?: string
    primaryButtonText?: string
    primaryButtonLink?: string
    secondaryButtonText?: string
    secondaryButtonLink?: string
  }
  description: string
  sidebar?: {
    bannerText?: string
    bannerDate?: string
    contactText?: string
    whatsappNumber?: string
    guaranteeTitle?: string
    guaranteeSubtext?: string
  }
  applySectionTitle?: string
  applySectionSubtitle?: string
  applySectionDescription?: string
  visaInfo?: {
    title: string
    items: {
      label: string
      value: string
      type:
        | 'sticker'
        | 'stay'
        | 'category'
        | 'entry'
        | 'validity'
        | 'processing'
        | 'document'
        | 'fees'
        | 'guest'
        | 'purpose'
        | 'business'
        | 'student'
        | 'medical'
        | 'tourist'
        | 'transit'
    }[]
  }
  benefits?: {
    title?: string
    items: Benefit[]
  }
  requirements?: {
    title?: string
    items: Requirement[]
  }
  process?: {
    title?: string
    subtitle?: string
    steps: Step[]
  }
  comparison?: {
    title: string
    description: string
    atlysRate: string
    overallRate: string
    table: {
      title: string
      good: string
      bad: string
    }[]
  }
  video?: {
    url: string
    poster: string
    title: string
    subtitle?: string
  }
  documentsSection?: {
    title: string
    steps: {
      title: string
      description: string
      subtext?: string
      commonDocs?: {
        title: string
        items: {
          label: string
          icon: string
        }[]
      }
    }[]
  }
  pricing?: {
    title: string
    govFee: string
    govFeeLabel?: string
    atlysFee: string
    atlysFeeLabel?: string
    totalFee: string
    totalFeeLabel?: string
    appointmentFeeLabel?: string
    appointmentFeeSubtext?: string
    paymentMethodsText?: string
    ctaText: string
    guaranteeText: string
    guaranteeSubtext: string
    mobileCtaText?: string
  }
  reviews?: {
    rating: string
    totalCount: string
    items: {
      name: string
      location: string
      date: string
      rating: number
      title: string
      comment: string
      initials: string
      color: string
      travelerType: string
      image?: string
    }[]
  }
  faqs?: {
    title?: string
    subtitle?: string
    items: Faq[]
  }
  applicationPacket?: { src: string; label: string }[]
  applicationPacketTitle?: string
  applicationPacketDescription?: string
  applicationPacketPreviewTitle?: string
  applicationPacketPreviewSubtitle?: string
  applicationPacketDisclaimer?: string
  statistics?: {
    label: string
    value: string
    icon: string
  }[]
}

const iconMap: Record<string, any> = {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Plane,
  Home,
  Calendar,
  CreditCard,
  Briefcase,
  UserCheck,
  MapPin,
  FileCheck,
}

export default function PremiumServiceDetail({
  service,
}: {
  service: ServiceData
}) {
  const slides = service.applicationPacket || []

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans">
      {/* Hero Banner Section */}
      <section className="relative w-full md:min-h-[450px] lg:min-h-[550px] py-16 flex items-center justify-center overflow-hidden">
        <img
          src={service.hero.image || '/images/hero-fallback.png'}
          className="absolute inset-0 w-full h-full object-cover"
          alt={service.hero.imageAlt || service.hero.title}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8 mt-12">
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            {service.hero.badgeText && (
              <Badge className="bg-white/10 text-white backdrop-blur-md border-white/20 px-4 py-2 text-sm font-semibold rounded-full mb-6 uppercase tracking-wider">
                {service.hero.badgeText}
              </Badge>
            )}
            <h1 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
              {service.hero.title}
            </h1>
            <div className="hidden md:flex items-center justify-center gap-6 text-base font-medium">
              {service.statistics?.map((stat, idx) => {
                const Icon = iconMap[stat.icon] || CheckCircle2
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                  >
                    <Icon
                      className={`w-5 h-5 ${idx === 0 ? 'text-green-400' : 'text-blue-400'}`}
                    />
                    <span>
                      {stat.value} {stat.label}
                    </span>
                  </div>
                )
              }) || (
                <>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>99% Approval Rate</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>Fast Track Processing</span>
                  </div>
                </>
              )}
            </div>

            {(service.hero.primaryButtonText ||
              service.hero.secondaryButtonText) && (
              <div className="pt-8 flex flex-wrap justify-center gap-4">
                {service.hero.primaryButtonText && (
                  <Link href={service.hero.primaryButtonLink || '#'}>
                    <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 md:px-10 py-2 md:py-7 text-sm md:text-xl font-bold rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                      {service.hero.primaryButtonText}
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  </Link>
                )}
                {service.hero.secondaryButtonText && (
                  <Link href={service.hero.secondaryButtonLink || '#'}>
                    <Button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 md:px-10 py-2 md:py-7 text-sm md:text-xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95">
                      {service.hero.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/*  Main Content Section */}
      <section className="relative py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            {service.applySectionTitle || 'Apply Tourist Visa Online in India'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h3 className="text-xl text-gray-900 leading-relaxed max-w-2xl mt-6">
                  {service.applySectionSubtitle ||
                    `Make Your Travel Dreams Come True with ${service.title}`}
                </h3>

                <div className="prose prose-lg text-[#334155] max-w-none py-2">
                  {service.applySectionDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: service.applySectionDescription,
                      }}
                    />
                  ) : (
                    <p>{service.description}</p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold lg:text-2xl">
                    <span>
                      {service.visaInfo?.title ||
                        `${service.title} Information`}
                    </span>
                  </h2>
                  <div className="mt-2.5 h-px w-12 border border-primary transition-all duration-500" />
                </div>

                {/* Info Grid */}
                <div className="relative z-10">
                  <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
                    {service.visaInfo?.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center"
                        data-testid="clp-visa-info"
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                            item.type === 'sticker'
                              ? 'bg-brand-primary/10'
                              : item.type === 'stay'
                                ? 'bg-cyan-50'
                                : item.type === 'category'
                                  ? 'bg-emerald-50'
                                  : item.type === 'entry'
                                    ? 'bg-purple-50'
                                    : item.type === 'validity'
                                      ? 'bg-amber-50'
                                      : item.type === 'processing'
                                        ? 'bg-orange-50'
                                        : item.type === 'document'
                                          ? 'bg-indigo-50'
                                          : item.type === 'fees'
                                            ? 'bg-rose-50'
                                            : item.type === 'guest'
                                              ? 'bg-teal-50'
                                              : item.type === 'business'
                                                ? 'bg-brand-primary/10'
                                                : item.type === 'student'
                                                  ? 'bg-indigo-50'
                                                  : item.type === 'medical'
                                                    ? 'bg-brand-accent/10'
                                                    : item.type === 'tourist'
                                                      ? 'bg-emerald-50'
                                                      : item.type === 'transit'
                                                        ? 'bg-slate-50'
                                                        : 'bg-slate-50'
                          }`}
                        >
                          {item.type === 'sticker' && (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                          {item.type === 'stay' && (
                            <Clock className="w-5 h-5 text-cyan-600" />
                          )}
                          {item.type === 'category' && (
                            <MapPin className="w-5 h-5 text-emerald-600" />
                          )}
                          {item.type === 'entry' && (
                            <Plane className="w-5 h-5 text-purple-600" />
                          )}
                          {item.type === 'validity' && (
                            <Calendar className="w-5 h-5 text-amber-600" />
                          )}
                          {item.type === 'processing' && (
                            <Clock className="w-5 h-5 text-orange-600" />
                          )}
                          {item.type === 'document' && (
                            <FileCheck className="w-5 h-5 text-indigo-600" />
                          )}
                          {item.type === 'fees' && (
                            <CreditCard className="w-5 h-5 text-rose-600" />
                          )}
                          {item.type === 'guest' && (
                            <UserCheck className="w-5 h-5 text-teal-600" />
                          )}
                          {item.type === 'purpose' && (
                            <Briefcase className="w-5 h-5 text-slate-600" />
                          )}
                          {item.type === 'business' && (
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          )}
                          {item.type === 'student' && (
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                          )}
                          {item.type === 'medical' && (
                            <Activity className="w-5 h-5 text-brand-accent" />
                          )}
                          {item.type === 'tourist' && (
                            <Compass className="w-5 h-5 text-emerald-600" />
                          )}
                          {item.type === 'transit' && (
                            <Repeat className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="pl-3">
                          <p className="text-xs text-gray-500 md:text-sm">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800 underline">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <>
                        <div
                          className="flex items-center"
                          data-testid="clp-visa-info"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E5EFFF]">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="pl-3">
                            <p className="text-xs text-gray-500 md:text-sm">
                              Visa Type:
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800 underline">
                              Sticker
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <section className="flex flex-col gap-7">
                {/* Ribbon */}
                <div className="relative w-full">
                  <hr />
                  <div className="hidden md:absolute md:-top-2 md:right-0 md:block">
                    <div className="relative inline-block">
                      <img
                        src="https://media.atlys.com/b2c/clp/Assets/approval-changes-ribbon.svg"
                        alt="Approval Changes Ribbon"
                        width={100}
                        height={100}
                      />
                      <div className="absolute inset-x-0 top-2 flex flex-col items-center gap-1 text-center">
                        <span className="text-base font-bold text-[#1DF792]">
                          Higher
                        </span>
                        <span className="text-xs text-white">
                          approval chances
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-4">
                      <img
                        src="https://media.atlys.com/b2c/clp/Assets/approval-guarantee.svg"
                        alt="Approval Guarantee"
                        width={21}
                        height={24}
                      />
                      <h2 className="text-lg font-semibold lg:text-2xl -ml-2">
                        {service.comparison?.title ||
                          'Your Approval is Guaranteed on Visa 4'}
                      </h2>
                    </div>
                    <div className="mt-2.5 h-px w-12 border border-primary transition-all duration-500" />
                  </div>

                  <p className="text-sm text-gray-600 md:text-base">
                    {service.comparison?.description ||
                      `Applying for a visa is tedious and often gets rejected due to manual errors. Visa 4 combines expert human review with AI to ensure ZERO mistakes.`}
                  </p>
                </div>

                {/* Comparison Card */}
                <div className="relative flex flex-col gap-7 md:rounded-xl md:border md:border-gray-200 md:px-3 md:py-4">
                  {/* Stats */}
                  <div className="relative flex gap-3">
                    <div className="flex flex-1 flex-col items-center gap-2.5 rounded-xl border border-[#AAE19D] bg-[#F5FCF5] p-4">
                      <img
                        src="https://media.atlys.com/b2c/clp/Assets/PositiveSolid.svg"
                        alt="Success Icon"
                        width={24}
                      />
                      <div className="text-center">
                        <div className="text-lg md:text-3xl font-bold">
                          {service.comparison?.atlysRate || '99%'}
                        </div>
                        <div className="text-xs md:text-sm font-bold uppercase text-[#42935A]">
                          approval on Visa 4
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-black text-sm font-bold text-white">
                      VS
                    </div>

                    <div className="flex flex-1 flex-col items-center gap-2.5 rounded-xl border border-[#FEE4E1] bg-[#FEF6F5] p-4">
                      <img
                        src="https://media.atlys.com/b2c/clp/Assets/WarningOctagon.svg"
                        alt="Warning Icon"
                        width={24}
                      />
                      <div className="text-center">
                        <div className="text-lg md:text-3xl font-bold">
                          {service.comparison?.overallRate || '75%'}
                        </div>
                        <div className="text-xs md:text-sm font-bold uppercase text-[#E93E33]">
                          approval overall
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="w-full overflow-hidden text-xs md:text-sm">
                    {(
                      service.comparison?.table || [
                        [
                          'Documents',
                          'Consistent and up to date',
                          'Often vague and mismatched',
                        ],
                        ['Itinerary', 'Accurate', 'Unclear and not verifiable'],
                        [
                          'Finances',
                          'Extensive options provided',
                          'Poorly presented',
                        ],
                        [
                          'Checks',
                          'AI + Human reviewed',
                          'Manual, error-prone',
                        ],
                      ]
                    ).map((row: any, idx) => {
                      const title = Array.isArray(row) ? row[0] : row.title
                      const good = Array.isArray(row) ? row[1] : row.good
                      const bad = Array.isArray(row) ? row[2] : row.bad
                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-[0.5fr_1.1fr_1.7fr] items-center justify-start gap-4 border-t border-gray-200 py-2.5"
                        >
                          <div className="font-semibold text-gray-900">
                            {title}
                          </div>
                          <div className="flex justify-end gap-2 text-gray-900">
                            {good}
                            <img
                              src="https://media.atlys.com/b2c/clp/Assets/PositiveSolid.svg"
                              width={16}
                              alt="Good"
                            />
                          </div>
                          <div className="flex justify-end gap-2 text-gray-500">
                            {bad}
                            <img
                              src="https://media.atlys.com/b2c/clp/Assets/WarningOctagon.svg"
                              width={16}
                              alt="Bad"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer Badge */}
                  <div className="flex items-center justify-center gap-2 rounded-full bg-[#EEFFF4] p-2 text-xs font-semibold shadow md:absolute md:inset-x-0 md:bottom-0 md:rounded-b-xl">
                    <img
                      src="https://media.atlys.com/b2c/clp/Assets/approval-guarantee.svg"
                      width={15}
                      alt=""
                    />
                    Your approval is guaranteed, or your visa fees back!
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                {/* Section Header */}
                <div>
                  <h2 className="text-lg font-semibold lg:text-2xl">
                    {service.video?.title ||
                      `Why choose ${service.title} via Visa 4?`}
                  </h2>
                  <div className="mt-2.5 h-px w-12 border border-primary transition-all duration-500" />
                </div>

                {/* Video Section */}
                <section className="relative flex h-full w-full flex-col gap-4 rounded-2xl bg-transparent sm:gap-6">
                  <div className="mt-4 rounded-[26px] border border-slate-200 p-1.5">
                    <div className="group mx-auto aspect-video w-full transform-gpu overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-none transition-all duration-300 ease-out">
                      <div className="relative w-full overflow-hidden rounded-[22px]">
                        <video
                          className="h-full w-full rounded-[22px] object-cover"
                          playsInline
                          controls
                          poster={
                            service.video?.poster ||
                            'https://media.atlys.com/b2c/schengen/Assets/clp/video-exp-thumbnail.png'
                          }
                        >
                          <source
                            src={
                              service.video?.url ||
                              'https://media.atlys.com/b2c/schengen/Assets/clp/Schengen%20Explainer%20Video%204K.mp4'
                            }
                            type="video/mp4"
                          />
                        </video>

                        {/* Play Overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300">
                          <button
                            type="button"
                            aria-label="Play video"
                            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-20 sm:w-20"
                          >
                            <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-slate-600 sm:border-y-[12px] sm:border-l-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Documents & Process Section (Combined Timeline) */}
              <div className="space-y-6" id="how-it-works-section">
                {/* Section Header */}
                <div>
                  <h2 className="text-lg font-semibold lg:text-2xl">
                    {service.documentsSection?.title ||
                      'Documents Required & Process'}
                  </h2>
                  <div className="mt-2.5 h-px w-12 border border-primary transition-all duration-500" />
                </div>

                {/* Timeline */}
                <div className="relative ml-7 max-w-xl space-y-5">
                  {/* Vertical Line */}
                  <div className="absolute -left-[26px] top-7 bottom-10 w-0.5 rounded-full bg-gray-200 animate-reveal-timeline-hiw z-20" />

                  {(
                    service.documentsSection?.steps || [
                      {
                        title: 'Gather Your Documents',
                        description:
                          'The specific documents you must submit depend on factors such as:',
                        subtext:
                          'Your travel history | Financial status | Occupation',
                        commonDocs: {
                          title: 'Common Documents for All Applicants',
                          items: [
                            { label: 'Passport', icon: 'passport.svg' },
                            { label: 'Bank Statements', icon: 'document.svg' },
                            { label: 'Pay Slips', icon: 'document.svg' },
                            { label: 'ITR', icon: 'document.svg' },
                          ],
                        },
                      },
                      {
                        title: 'Visa 4 books your appointment',
                        description:
                          'You will receive an appointment confirmation after you book.',
                      },
                      {
                        title: 'Submit your documents at your appointment',
                        description:
                          'Visa 4 arranges your final document packet in the order they’ll be reviewed.',
                      },
                    ]
                  ).map((step, idx) => (
                    <div
                      key={idx}
                      className="relative space-y-1 rounded-2xl pb-5 pt-3.5 md:px-5"
                    >
                      <div className="absolute -left-[33px] top-6 flex size-4 items-center justify-center rounded-full border border-gray-200 bg-white z-50">
                        <div className="size-[10px] rounded-full bg-brand-primary" />
                      </div>
                      <div className="absolute -left-[33px] bottom-6 flex size-4 items-center justify-center rounded-full border border-gray-200 bg-white z-50">
                        <div className="size-[10px] rounded-full bg-brand-primary" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-base font-medium md:text-lg">
                          {step.title}
                        </p>
                        <p className="text-sm text-gray-500 md:text-base">
                          {step.description}
                        </p>

                        {step.subtext && (
                          <p className="text-sm font-light text-primary">
                            {step.subtext}
                          </p>
                        )}

                        {step.commonDocs && (
                          <div className="mt-5 rounded-xl p-3 shadow-md md:border md:p-5 md:shadow-none">
                            <div>
                              <h3 className="text-base font-semibold">
                                {step.commonDocs.title}
                              </h3>
                              <div className="mt-1.5 h-px w-12 border border-primary" />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {step.commonDocs.items.map((doc, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 p-2.5"
                                >
                                  <img
                                    src={`https://media.atlys.com/b2c/schengen/Assets/clp/${doc.icon || 'document.svg'}`}
                                    alt={doc.label}
                                    width={15}
                                    height={15}
                                  />
                                  <p className="text-sm">{doc.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Mask Line End */}
                  <div className="absolute -left-7 top-9 bottom-0 z-[1px] w-1 bg-white" />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold lg:text-2xl">
                    {service.pricing?.title ||
                      `How Much Does a ${service.title} Cost?`}
                  </h2>
                  <div className="mt-2.5 w-12 border border-primary transition-all duration-500" />
                </div>

                <div className="relative space-y-5 md:ml-9">
                  {/* Vertical timeline line */}
                  <div className="absolute bottom-6 top-7 -left-[26px] hidden w-px rounded-full bg-gray-200 md:block" />

                  {/* Pay Now Card */}
                  <div className="relative rounded-2xl border px-4 py-5">
                    <div className="absolute -left-[34px] top-[21px] hidden md:flex size-4 items-center justify-center rounded-full border bg-white">
                      <div className="size-2.5 rounded-full bg-brand-primary" />
                    </div>

                    <p className="font-semibold">Pay Now on Visa 4</p>

                    <div className="mt-1 flex items-center gap-1">
                      <p className="text-xs text-primary">
                        {service.pricing?.paymentMethodsText ||
                          'Acceptable Payment Methods:'}
                      </p>

                      <div className="flex items-center gap-1 rounded border px-1">
                        <img
                          src="https://media.atlys.com/b2c/schengen/Images/clp/credit-card.svg"
                          alt="Credit Card"
                          width={17}
                          height={17}
                        />
                        <p className="text-[10px]">Credit/Debit</p>
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="flex justify-between">
                      <div>
                        <p className="flex items-center gap-1 font-medium">
                          {service.pricing?.appointmentFeeLabel ||
                            'Appointment Fee'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {service.pricing?.appointmentFeeSubtext ||
                            'Paid to government | Zero commission'}
                        </p>
                      </div>
                      <p>{service.pricing?.govFee || '₹0'}</p>
                    </div>

                    <div className="mt-3.5 flex justify-between">
                      <p className="font-medium">
                        {service.pricing?.atlysFeeLabel || 'Visa 4 Service Fee'}
                      </p>
                      <p>{service.pricing?.atlysFee || '₹0'}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="relative rounded-2xl border px-5 py-4 font-semibold">
                    <div className="absolute -left-[34px] top-[21px] hidden md:flex size-4 items-center justify-center rounded-full border bg-white">
                      <div className="size-2.5 rounded-full bg-brand-primary" />
                    </div>

                    <div className="flex justify-between">
                      <p>
                        {service.pricing?.totalFeeLabel ||
                          'Total Amount for one Traveller'}
                      </p>
                      <p>{service.pricing?.totalFee || '₹0'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Packet Carousel */}
              <ApplicationPacketCarousel
                slides={slides}
                title={service.applicationPacketTitle}
                description={service.applicationPacketDescription}
                previewTitle={service.applicationPacketPreviewTitle}
                previewSubtitle={service.applicationPacketPreviewSubtitle}
                disclaimer={service.applicationPacketDisclaimer}
                showArrows
                enableSwipe
              />

              {/* Reviews Section */}
              <section className="space-y-6">
                <header>
                  <h2 className="text-lg font-semibold lg:text-2xl">Reviews</h2>
                  <div className="mt-2.5 w-12 border border-primary" />
                </header>

                <ClientReviews reviews={service.reviews?.items || []} />
              </section>

              {/* FAQs */}
              <ServiceFaqs faqs={service.faqs} />
            </div>

            {/* Right Sticky Sidebar (Visible on Desktop) */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24 z-10">
                <div className="w-full">
                  <div className="relative w-full">
                    <div className="relative z-10 rounded-2xl border bg-white py-4 shadow-lg">
                      {/* Header */}
                      <div
                        className="z-20 -mx-[10px] mb-4 flex h-[75px] w-[calc(100%+20px)] items-center bg-brand-primary pl-5 font-normal md:text-xs lg:text-base rounded-[10px]"
                        style={{ top: 20, zIndex: 40 }}
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-8 h-8 text-white/80" />

                          <p className="text-white">
                            {service.sidebar?.bannerText || 'Get your visa by'}{' '}
                            <br />
                            <span className="font-bold">
                              {service.sidebar?.bannerDate || 'TBD'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Fees */}
                      <div className="flex w-full flex-col gap-3 px-5">
                        <div className="flex items-center py-2 text-sm text-gray-700">
                          <div className="px-2">
                            <span className="underline">
                              {service.pricing?.govFeeLabel || 'Government fee'}
                            </span>{' '}
                            × 1
                          </div>
                          <span className="flex-1" />
                          <p>{service.pricing?.govFee || '₹0'}</p>
                        </div>

                        <div className="flex items-center py-2 text-sm text-gray-700">
                          <div className="px-2">
                            <span className="underline">
                              {service.pricing?.atlysFeeLabel || 'Visa 4 Fees'}
                            </span>{' '}
                            × 1
                          </div>
                          <span className="flex-1" />
                          <p>{service.pricing?.atlysFee || '₹0'}</p>
                        </div>

                        <hr className="my-3" />

                        {/* Total */}
                        <div className="flex items-center px-3">
                          <p className="flex-1 text-lg font-semibold">
                            {service.pricing?.totalFeeLabel || 'Total Amount'}
                          </p>
                          <p className="text-lg font-bold">
                            {service.pricing?.totalFee || '₹0'}
                          </p>
                        </div>

                        {/* CTA */}
                        <button className="mt-3 w-full rounded-xl border border-primary bg-brand-primary py-2 text-white shadow-md font-bold hover:bg-brand-primary/90 transition-colors">
                          {service.pricing?.ctaText ||
                            'Get Your Visa Or Full Refund'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div
                    className="relative mt-5 rounded-[12px] border px-3 py-3"
                    style={{ boxShadow: '0 0 6px rgba(0,0,0,0.02)' }}
                  >
                    <div className="flex gap-2">
                      <img
                        src="https://media.atlys.com/b2c/clp/Assets/approval-guarantee.svg"
                        alt="Approval Guarantee"
                        width={21}
                        height={24}
                      />
                      <div>
                        <div className="text-sm font-semibold">
                          {service.sidebar?.guaranteeTitle ||
                            'Approval guaranteed, or your money back!'}
                        </div>
                        <p className="text-xs text-gray-500">
                          {service.sidebar?.guaranteeSubtext ||
                            'This also includes the government fees. Zero loss for you!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {service.sidebar?.contactText ||
                        'Contact us for assistance:'}
                    </span>
                    <a
                      href={`https://wa.me/${service.sidebar?.whatsappNumber || '918007011942'}`}
                      target="_blank"
                      className="flex items-center gap-1 rounded-full border border-green-500 px-3 py-1 text-sm font-medium text-green-500"
                      rel="noreferrer"
                    >
                      Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <Button className="w-full bg-[#5057EA] hover:bg-[#4046cd] h-16 text-lg font-bold rounded-2xl shadow-2xl shadow-blue-900 transition-all active:scale-95">
          {service.pricing?.mobileCtaText || 'Get Started Now'}
        </Button>
      </div>
    </div>
  )
}

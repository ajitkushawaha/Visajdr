import { CheckCircle2 } from 'lucide-react'

interface VisaScheduleStep {
  date: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'pending'
  badgeLabel?: string
}

interface VisaScheduleTimelineProps {
  steps: VisaScheduleStep[]
  title?: string
  className?: string
}

const VisaScheduleTimeline = ({
  steps,
  title = 'Your Visa Schedule',
  className = '',
}: VisaScheduleTimelineProps) => {
  return (
    <div
      className={`max-w-md mx-auto p-6 rounded-xl bg-theme-light-green ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      )}

      <div className="relative border-l-2 border-yellow-400 ml-3 md:ml-4 space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="relative pl-6 md:pl-8">
            {/* Timeline Dot */}
            <span
              className={`absolute -left-[5px] top-0 flex h-2 w-2 items-center justify-center rounded-full ring-4 ring-white ${
                step.status === 'completed'
                  ? 'bg-yellow-500'
                  : step.status === 'current'
                    ? 'bg-brand-primary'
                    : 'bg-gray-300'
              }`}
            ></span>

            {/* Optional Badge (e.g., EMBASSY) */}
            {step.badgeLabel && (
              <span className="absolute -left-16 top-0 translate-y-[-2px] bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                {step.badgeLabel}
              </span>
            )}

            {/* Content */}
            <div className="flex flex-col gap-1">
              <p className="captlize flex items-center gap-2">
                <span className="text-brand-accent text-sm font-semibold">
                  {step.date}{' '}
                </span>{' '}
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {step.title}
                </span>
              </p>
              <div>
                {step.description && (
                  <p className="mt-1 text-xs text-gray-600 leading-snug">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisaScheduleTimeline

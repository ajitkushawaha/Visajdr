import React from 'react';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationProgressProps {
  status: "submitted" | "pending" | "under_review" | "assigned_to_agent" | "in_embassy" | "approved" | "rejected" | "completed" | "cancelled";
  className?: string;
  showSteps?: boolean;
}

const statusSteps = [
  { 
    key: 'submitted', 
    label: 'Submitted', 
    icon: FileText, 
    description: 'Application submitted successfully' 
  },
  { 
    key: 'pending', 
    label: 'Pending', 
    icon: Clock, 
    description: 'Under review by our team' 
  },
  { 
    key: 'under_review', 
    label: 'Under Review', 
    icon: AlertCircle, 
    description: 'Application being processed' 
  },
  { 
    key: 'assigned_to_agent', 
    label: 'Assigned to Agent', 
    icon: User, 
    description: 'Agent assigned to handle your case' 
  },
  { 
    key: 'in_embassy', 
    label: 'In Embassy', 
    icon: MapPin, 
    description: 'Submitted to embassy for processing' 
  },
  { 
    key: 'approved', 
    label: 'Approved', 
    icon: CheckCircle, 
    description: 'Visa approved successfully' 
  }
];

const getProgressPercentage = (status: string) => {
  switch (status) {
    case "submitted":
      return 20;
    case "pending":
      return 30;
    case "under_review":
      return 40;
    case "assigned_to_agent":
      return 50;
    case "in_embassy":
      return 70;
    case "approved":
    case "completed":
      return 100;
    case "rejected":
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

const getCurrentStepIndex = (status: string) => {
  const stepIndex = statusSteps.findIndex(step => step.key === status);
  return stepIndex >= 0 ? stepIndex : 0;
};

export function ApplicationProgress({ status, className, showSteps = true }: ApplicationProgressProps) {
  const progress = getProgressPercentage(status);
  const currentStepIndex = getCurrentStepIndex(status);
  const isRejected = status === 'rejected';
  const isCancelled = status === 'cancelled';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className={cn(
            "h-2",
            isRejected && "bg-red-100",
            isCancelled && "bg-gray-100"
          )}
        />
      </div>

      {/* Steps */}
      {showSteps && (
        <div className="space-y-3">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex && !isRejected && !isCancelled;
            const isUpcoming = index > currentStepIndex;

            return (
              <div 
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isCompleted && "bg-green-50 border border-green-200",
                  isCurrent && "bg-blue-50 border border-blue-200",
                  isUpcoming && "bg-gray-50 border border-gray-200",
                  isRejected && index === currentStepIndex && "bg-red-50 border border-red-200"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  isCompleted && "bg-green-500 text-white border-green-500",
                  isCurrent && "bg-blue-500 text-white border-blue-500",
                  isUpcoming && "bg-gray-200 text-gray-400 border-gray-200",
                  isRejected && index === currentStepIndex && "bg-red-500 text-white border-red-500"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-green-800",
                    isCurrent && "text-blue-800",
                    isUpcoming && "text-gray-500",
                    isRejected && index === currentStepIndex && "text-red-800"
                  )}>
                    {step.label}
                  </p>
                  <p className={cn(
                    "text-xs",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600",
                    isUpcoming && "text-gray-400",
                    isRejected && index === currentStepIndex && "text-red-600"
                  )}>
                    {step.description}
                  </p>
                </div>

                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {isRejected && index === currentStepIndex && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Message */}
      <div className={cn(
        "p-3 rounded-lg text-sm",
        isRejected && "bg-red-50 text-red-800 border border-red-200",
        isCancelled && "bg-gray-50 text-gray-800 border border-gray-200",
        !isRejected && !isCancelled && "bg-blue-50 text-blue-800 border border-blue-200"
      )}>
        {isRejected && (
          <p className="font-medium">Application Rejected</p>
        )}
        {isCancelled && (
          <p className="font-medium">Application Cancelled</p>
        )}
        {!isRejected && !isCancelled && (
          <p className="font-medium">
            {statusSteps[currentStepIndex]?.description || 'Processing your application...'}
          </p>
        )}
      </div>
    </div>
  );
}

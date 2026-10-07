import React from 'react';
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

interface StatusHistoryEntry {
  status: string;
  changedBy: string;
  changedByRole: 'user' | 'admin' | 'agent';
  changedByName: string;
  timestamp: string;
  notes?: string;
  reason?: string;
}

interface StatusTimelineProps {
  statusHistory: StatusHistoryEntry[];
  currentStatus: string;
  className?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'submitted': return FileText;
    case 'pending': return Clock;
    case 'under_review': return AlertCircle;
    case 'assigned_to_agent': return User;
    case 'in_embassy': return MapPin;
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    case 'completed': return CheckCircle;
    case 'cancelled': return XCircle;
    default: return Clock;
  }
};

const getStatusColor = (status: string, isCurrent: boolean) => {
  const baseColors = {
    submitted: "bg-gray-100 text-gray-600",
    pending: "bg-amber-100 text-amber-600",
    under_review: "bg-blue-100 text-blue-600",
    assigned_to_agent: "bg-purple-100 text-purple-600",
    in_embassy: "bg-indigo-100 text-indigo-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-600",
    completed: "bg-green-100 text-green-600",
    cancelled: "bg-gray-100 text-gray-600"
  };

  const currentColors = {
    submitted: "bg-gray-500 text-white",
    pending: "bg-amber-500 text-white",
    under_review: "bg-blue-500 text-white",
    assigned_to_agent: "bg-purple-500 text-white",
    in_embassy: "bg-indigo-500 text-white",
    approved: "bg-green-500 text-white",
    rejected: "bg-red-500 text-white",
    completed: "bg-green-500 text-white",
    cancelled: "bg-gray-500 text-white"
  };

  return isCurrent ? currentColors[status as keyof typeof currentColors] : baseColors[status as keyof typeof baseColors];
};

export function StatusTimeline({ statusHistory, currentStatus, className }: StatusTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No status history available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {statusHistory.map((entry, index) => {
        const Icon = getStatusIcon(entry.status);
        const isCurrent = entry.status === currentStatus;
        const isLast = index === statusHistory.length - 1;

        return (
          <div key={index} className="flex items-start gap-4">
            {/* Icon and line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                getStatusColor(entry.status, isCurrent),
                isCurrent && "ring-2 ring-offset-2 ring-blue-200"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-gray-900" : "text-gray-700"
                )}>
                  {entry.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {isCurrent && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {entry.changedByRole}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mb-1">
                by {entry.changedByName}
              </p>
              
              <p className="text-xs text-gray-500 mb-2">
                {new Date(entry.timestamp).toLocaleString()}
              </p>

              {entry.notes && (
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {entry.notes}
                </p>
              )}

              {entry.reason && (
                <p className="text-sm text-red-700 bg-red-50 p-2 rounded mt-2">
                  <strong>Reason:</strong> {entry.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

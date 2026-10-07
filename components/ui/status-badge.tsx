import React from 'react';
import { Badge } from '@/components/ui/badge';
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

interface StatusBadgeProps {
  status: "submitted" | "pending" | "under_review" | "assigned_to_agent" | "in_embassy" | "approved" | "rejected" | "completed" | "cancelled";
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  submitted: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
    label: "Submitted"
  },
  pending: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    label: "Pending"
  },
  under_review: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertCircle,
    label: "Under Review"
  },
  assigned_to_agent: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: User,
    label: "Assigned to Agent"
  },
  in_embassy: {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: MapPin,
    label: "In Embassy"
  },
  approved: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Approved"
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Rejected"
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Completed"
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle,
    label: "Cancelled"
  }
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn(config.color, className)}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

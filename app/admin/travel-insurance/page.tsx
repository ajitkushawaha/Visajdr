"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Eye, Edit, Shield, Calendar, MapPin, User, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface TravelInsuranceApplication {
  _id: string;
  trackingId: string;
  status: 'pending' | 'approved' | 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
  };
  tripDetails: {
    destination: string;
    purpose: string;
    startDate: string;
    endDate: string;
    numberOfTravelers: number;
  };
  selectedPlan: {
    planType: string;
    totalPremium: number;
  };
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  policyNumber?: string;
  policyStartDate?: string;
  policyEndDate?: string;
}

interface AdminTravelInsurancePageProps {
  applications: TravelInsuranceApplication[];
  total: number;
  page: number;
  totalPages: number;
  statusSummary: Record<string, number>;
  onStatusUpdate: (applicationId: string, status: string, notes?: string) => void;
  onPageChange: (page: number) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export default function AdminTravelInsurancePage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<TravelInsuranceApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/travel-insurance?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setStatusSummary(data.statusSummary);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch("/api/admin/travel-insurance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application status updated successfully",
        });
        
        // Refresh the applications list
        fetchApplications(page);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update application status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchApplications(newPage);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Insurance Applications</h1>
          <p className="text-gray-600">Manage and track all travel insurance applications</p>
        </div>
        <Button
          onClick={() => fetchApplications(page)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(statusSummary).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]?.replace('bg-', 'bg-').replace('text-', 'text-')}`}></div>
                <div>
                  <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Insurance Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tracking ID</th>
                  <th className="text-left p-3 font-medium">Applicant</th>
                  <th className="text-left p-3 font-medium">Trip Details</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Payment</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {app.trackingId}
                      </code>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{app.personalInfo.firstName} {app.personalInfo.lastName}</p>
                        <p className="text-sm text-gray-600">{app.personalInfo.email}</p>
                        <p className="text-xs text-gray-500">{app.personalInfo.nationality}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{app.tripDetails.destination}</p>
                        <p className="text-sm text-gray-600 capitalize">{app.tripDetails.purpose}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.tripDetails.startDate).toLocaleDateString()} - {new Date(app.tripDetails.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {app.selectedPlan.planType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[app.status]}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={paymentStatusColors[app.paymentStatus]}>
                        {app.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">₹{app.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(app.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open status update dialog
                            // This would need to be implemented with a state management
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

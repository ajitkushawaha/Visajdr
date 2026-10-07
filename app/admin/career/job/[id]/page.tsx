'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface JobApplication {
  _id: string;
  jobTitle: string;
  jobCategory: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  noticePeriod: string;
  currentCompany: string;
  experience: string;
  currentCTC: string;
  expectedCTC: string;
  resumeUrl: string;
  position: string;
  appliedAt: string;
  status: string;
}

export default function JobApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  async function fetchApplication() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/career-categories/job/${applicationId}`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch application');
      }
      
      const data = await res.json();
      setApplication(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!application) return;
    
    try {
      const res = await fetch(`/api/admin/career-categories/job/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      alert('Status updated successfully!');
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading application details...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          {error || 'Application not found'}
        </div>
        <div className="text-center mt-4">
          <Link href="/admin/career/job" className="text-blue-600 hover:underline">
            ← Back to Applied Job List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Job Application Details</h1>
          <p className="text-gray-600">Application ID: {application._id}</p>
        </div>
        <Link
          href="/admin/career/job"
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ← Back to Applied Job List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{application.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{application.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{application.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="mt-1 text-sm text-gray-900">{application.city}</p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <p className="mt-1 text-sm text-gray-900">{application.jobTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Category</label>
                <p className="mt-1 text-sm text-gray-900">{application.jobCategory}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position Type</label>
                <p className="mt-1 text-sm text-gray-900">{application.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Period</label>
                <p className="mt-1 text-sm text-gray-900">{application.noticePeriod}</p>
              </div>
            </div>
          </div>

          {/* Experience & Salary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Experience & Salary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Experience</label>
                <p className="mt-1 text-sm text-gray-900">{application.experience}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Company</label>
                <p className="mt-1 text-sm text-gray-900">{application.currentCompany || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current CTC</label>
                <p className="mt-1 text-sm text-gray-900">{application.currentCTC || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected CTC</label>
                <p className="mt-1 text-sm text-gray-900">{application.expectedCTC || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Resume */}
          {application.resumeUrl && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Resume</h2>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                View Resume
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Application Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {application.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="space-y-2">
                  <button
                    onClick={() => updateStatus('Pending')}
                    className={`w-full px-3 py-2 text-sm rounded ${
                      application.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus('Approved')}
                    className={`w-full px-3 py-2 text-sm rounded ${
                      application.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => updateStatus('Rejected')}
                    className={`w-full px-3 py-2 text-sm rounded ${
                      application.status === 'Rejected' 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Application Timeline</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(application.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.open(`mailto:${application.email}`, '_blank')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send Email
              </button>
              <button
                onClick={() => window.open(`tel:${application.phone}`, '_blank')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Call Candidate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

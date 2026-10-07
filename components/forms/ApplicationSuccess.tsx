"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReceipt } from "@/hooks/useReceipt";
import { toast } from "sonner";

interface ApplicationSuccessProps {
  trackingId: string;
  applicationId: string;
  status: string;
  estimatedProcessingDate: string;
}

const ApplicationSuccess: React.FC<ApplicationSuccessProps> = ({
  trackingId,
  applicationId,
  status,
  estimatedProcessingDate
}) => {
  const searchParams = useSearchParams();
  const [copied, setCopied] = React.useState(false);
  const { downloadApplicationReceipt, loading: receiptLoading } = useReceipt();

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy tracking ID:", err);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadApplicationReceipt(trackingId);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 md:px-8">
      <div className="w-4/5 max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600 mb-2">
              Application Submitted Successfully!
            </CardTitle>
            <p className="text-gray-600">
              Your visa application has been received and is being processed.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tracking ID Section */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Your Tracking ID</h3>
              <div className="flex items-center justify-center gap-3 mb-3">
                <code className="bg-white px-4 py-2 rounded border text-lg font-mono text-blue-800">
                  {trackingId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTrackingId}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-blue-700">
                Save this tracking ID to monitor your application status
              </p>
            </div>

            {/* Application Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium capitalize">{status}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Estimated Processing</p>
                  <p className="font-medium">
                    {new Date(estimatedProcessingDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Submission Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Application ID</p>
                  <p className="font-medium font-mono text-xs">{applicationId}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">What Happens Next?</h3>
              <div className="text-left space-y-2 text-sm text-yellow-800">
                <p>1. Our team will review your application and documents</p>
                <p>2. You'll receive updates via email about your application status</p>
                <p>3. Track your application progress using the tracking ID above</p>
                <p>4. We'll notify you once processing is complete</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                disabled={receiptLoading}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {receiptLoading ? 'Downloading...' : 'Download Receipt'}
              </Button>
              
              <Link href={`/track?trackingId=${trackingId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Track Application
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Important Notes */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Keep your tracking ID safe for future reference</p>
              <p>• Check your email regularly for updates</p>
              <p>• Contact support if you have any questions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationSuccess;

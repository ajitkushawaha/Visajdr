"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Phone, Mail, Shield } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function TravelInsuranceSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trackingId = searchParams.get('trackingId');

  return (
    <div className="min-h-screen bg-gray-50 py-28">
      <div className="w-4/5 max-[600px]:w-[100%] mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Your travel insurance application has been received and is being processed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Tracking ID</p>
              <p className="font-mono text-lg font-bold text-blue-900">{trackingId}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="font-semibold">Application Status</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="font-semibold">Coverage Type</p>
                <p className="text-sm text-gray-600">Travel Insurance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold">Application Review</p>
                  <p className="text-sm text-gray-600">
                    Our team will review your application and documents within 24-48 hours
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold">Policy Generation</p>
                  <p className="text-sm text-gray-600">
                    Once approved, your insurance policy will be generated and sent to your email
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold">Coverage Activation</p>
                  <p className="text-sm text-gray-600">
                    Your coverage will be active from your trip start date
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-sm text-gray-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-sm text-gray-600">support@eu-world.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/travel-insurance')}
          >
            Apply for Another Policy
          </Button>
        </div>
      </div>
    </div>
  );
}

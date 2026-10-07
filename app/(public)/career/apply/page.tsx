'use client'

import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import InlineApplicationForm from '../InlineApplicationForm'

export default function ApplyPage() {
  const [activeTab, setActiveTab] = useState('inline')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
      <main className="w-4/5 max-[600px]:w-[90%] mx-auto py-24">
        {/* Header Section */}
        <section className="text-center mb-16">
          <h1 className="text-3xl  font-bold tracking-tight  mb-6">
            Apply for a Position
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to join our team? Choose your preferred application method
            below and we'll get back to you soon.
          </p>
        </section>

        {/* Application Forms */}
        <section className="max-w-4xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="inline" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Quick Application Form
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Fill out this streamlined form for a quick application
                    process
                  </p>
                </CardHeader>
                <CardContent>
                  <InlineApplicationForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Detailed Application Form
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Complete this comprehensive form with additional details and
                    file upload
                  </p>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Additional Information */}
        <section className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions about the application process or need
              assistance, please don't hesitate to contact our HR team.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

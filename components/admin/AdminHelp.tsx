'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { HelpCircle, BookOpen, MessageCircle, ExternalLink } from 'lucide-react'

interface AdminHelpProps {
  title?: string
  content?: string
  helpUrl?: string
}

export function AdminHelp({
  title = 'Need Help?',
  content = 'Get assistance with this admin feature',
  helpUrl,
}: AdminHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const helpContent =
    content ||
    `
    This admin panel helps you manage your application. Here are some tips:

    • Use the form fields to enter information
    • Click Save to store your changes
    • Use Preview to see how it looks
    • Check the status to see if it's active

    For more detailed help, check our documentation or contact support.
  `

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Get help with this admin feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-sm text-gray-700">
              {helpContent}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {helpUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(helpUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                View Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                // You can implement a contact form or support system here
                window.open(
                  'mailto:support@Visa4.com?subject=Admin Help Request',
                  '_blank'
                )
              }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>
              💡 <strong>Quick Tips:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Always save your changes before navigating away</li>
              <li>Use the preview feature to test your changes</li>
              <li>Check the status to ensure your content is active</li>
              <li>Contact support if you encounter any issues</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"


export default function AdminDashboard() {
  return (
    <div className="flex-1 bg-slate-200">
      {/* Main Content */}
      <div className="p-6">
        {/* Visa Bookings Card */}
        <div className="mb-6">
          <Card className="bg-white rounded-lg shadow-sm max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-pink-500 mb-1">53</div>
                  <div className="text-pink-500 font-medium">Visa Bookings</div>
                </div>
                <div className="bg-pink-500 text-white px-3 py-1 rounded text-sm font-bold">VISA</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bookings Section */}
          <Card className="bg-white rounded-lg shadow-sm">
            <div className="bg-slate-600 text-white px-6 py-3 rounded-t-lg">
              <h2 className="font-semibold">BOOKINGS</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        All Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cancelled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Visa</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">53</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Refunds Section */}
          <Card className="bg-white rounded-lg shadow-sm">
            <div className="bg-slate-600 text-white px-6 py-3 rounded-t-lg">
              <h2 className="font-semibold">REFUNDS</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        All Refunds
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opened Refund
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closed Refund
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Visa</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Amendment Section */}
        <div className="mb-6">
          <Card className="bg-white rounded-lg shadow-sm">
            <div className="bg-slate-600 text-white px-6 py-3 rounded-t-lg">
              <h2 className="font-semibold">AMENDMENT</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        All Amendment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Visa</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

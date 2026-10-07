"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Reply,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface Query {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  response?: string;
  responseDate?: string;
  tags?: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface QueryStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
}

export default function QueryPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<QueryStats>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [responseText, setResponseText] = useState('');

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/queries?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQueries(data.queries);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Failed to fetch queries');
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [filters, pagination.page]);

  const handleStatusChange = async (queryId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchQueries();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (queryId: string, newPriority: string) => {
    try {
      const response = await fetch('/api/admin/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          updates: { priority: newPriority }
        })
      });

      if (response.ok) {
        toast.success('Priority updated successfully');
        fetchQueries();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update priority');
      }
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const handleSendResponse = async () => {
    if (!selectedQuery || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const response = await fetch('/api/admin/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: selectedQuery._id,
          updates: { 
            response: responseText,
            status: 'resolved'
          }
        })
      });

      if (response.ok) {
        toast.success('Response sent successfully');
        setResponseText('');
        fetchQueries();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send response');
      }
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;

    try {
      const response = await fetch(`/api/admin/queries?id=${queryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Query deleted successfully');
        fetchQueries();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete query');
      }
    } catch (error) {
      toast.error('Failed to delete query');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Query Management</h1>
        <div className="flex gap-2">
          <Button onClick={fetchQueries} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search queries..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Queries ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading queries...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No queries found</div>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <div key={query._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{query.firstName} {query.lastName}</h3>
                        <Badge className={getStatusBadge(query.status)}>
                          {query.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getPriorityBadge(query.priority)}>
                          {getPriorityIcon(query.priority)}
                          <span className="ml-1">{query.priority}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {query.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {query.phone}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(query.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Subject:</strong> {query.subject}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {query.message}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedQuery(query)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Query Details</DialogTitle>
                          </DialogHeader>
                          {selectedQuery && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Name</label>
                                  <p>{selectedQuery.firstName} {selectedQuery.lastName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p>{selectedQuery.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Phone</label>
                                  <p>{selectedQuery.phone}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subject</label>
                                  <p>{selectedQuery.subject}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Message</label>
                                <p className="mt-1 p-3 bg-gray-50 rounded">{selectedQuery.message}</p>
                              </div>
                              {selectedQuery.response && (
                                <div>
                                  <label className="text-sm font-medium">Response</label>
                                  <p className="mt-1 p-3 bg-blue-50 rounded">{selectedQuery.response}</p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Select 
                                  value={selectedQuery.status} 
                                  onValueChange={(value) => handleStatusChange(selectedQuery._id, value)}
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select 
                                  value={selectedQuery.priority} 
                                  onValueChange={(value) => handlePriorityChange(selectedQuery._id, value)}
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {!selectedQuery.response && (
                                <div>
                                  <label className="text-sm font-medium">Send Response</label>
                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    className="mt-1"
                                  />
                                  <Button onClick={handleSendResponse} className="mt-2">
                                    <Reply className="h-4 w-4 mr-2" />
                                    Send Response
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteQuery(query._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Company {
  name: string;
  domain?: string;
  logo?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  jobTitle: string;
  jobCategory: string;
  noticePeriod: string;
  experience: string;
  currentCompany: string;
  currentCTC: string;
  expectedCTC: string;
  resumeUrl: string;
  position: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  jobTitle: '',
  jobCategory: '',
  noticePeriod: '',
  experience: '',
  currentCompany: '',
  currentCTC: '',
  expectedCTC: '',
  resumeUrl: '',
  position: 'Full-time',
};

export default function InlineApplicationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Fetch job categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Close company dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.company-dropdown-container')) {
        setCompanies([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for prefill events from job cards
  useEffect(() => {
    const handlePrefillJob = (event: CustomEvent) => {
      const { jobTitle, jobCategory } = event.detail;
      setFormData(prev => ({
        ...prev,
        jobTitle: jobTitle || prev.jobTitle,
        jobCategory: jobCategory || prev.jobCategory,
      }));
    };

    window.addEventListener('prefillJob', handlePrefillJob as EventListener);
    return () => {
      window.removeEventListener('prefillJob', handlePrefillJob as EventListener);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/career-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async (searchQuery: string = '') => {
    try {
      const response = await fetch(`/api/public/companies?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setError('Valid phone number is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.jobTitle.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!formData.jobCategory.trim()) {
      setError('Job category is required');
      return false;
    }
    if (!formData.experience.trim()) {
      setError('Experience is required');
      return false;
    }
    if (formData.resumeUrl && !isValidUrl(formData.resumeUrl)) {
      setError('Please enter a valid resume URL');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/career-categories/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Submission failed');
      }
      
      const data = await response.json();
      setSuccessId(data.id);
      setSuccess(true);
      setFormData(initialFormData);
    } catch (err: any) {
      setError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-800 mb-2">
                ✅ Application Submitted Successfully!
              </div>
              <p className="text-green-700 mb-4">
                Thank you for your interest in joining our team. We'll review your application and get back to you soon.
              </p>
              {successId && (
                <p className="text-sm text-green-600 mb-4">
                  Reference ID: <span className="font-mono font-semibold">{successId}</span>
                </p>
              )}
              <Button 
                onClick={() => setSuccess(false)} 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Submit Another Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Job Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">👤 Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">💼 Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="e.g., Software Developer"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Job Category *</label>
                  <select 
                    value={formData.jobCategory} 
                    onChange={(e) => handleInputChange('jobCategory', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={loading}
                  >
                    <option value="">Select job category</option>
                    {loading ? (
                      <option value="" disabled>Loading categories...</option>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name} {category.description && `- ${category.description}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No categories available</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Position Type *</label>
                  <select 
                    value={formData.position} 
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Notice Period *</label>
                  <input
                    type="text"
                    value={formData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                    placeholder="e.g., 30 days, Immediate"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Experience & Salary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🏢 Experience & Salary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Total Experience *</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 3.5 years"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Current Company</label>
                  <div className="relative company-dropdown-container">
                    <input
                      type="text"
                      value={formData.currentCompany}
                      onChange={(e) => {
                        handleInputChange('currentCompany', e.target.value);
                        // Search companies as user types
                        if (e.target.value.length > 2) {
                          fetchCompanies(e.target.value);
                        }
                      }}
                      placeholder="Type to search companies..."
                      className="w-full border rounded px-3 py-2"
                    />
                    {companies.length > 0 && formData.currentCompany && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {companies.slice(0, 5).map((company, index) => (
                          <div
                            key={`${company.name}-${company.domain}-${index}`}
                            onClick={() => {
                              handleInputChange('currentCompany', company.name);
                              setCompanies([]); // Close dropdown after selection
                            }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          >
                            {company.logo && (
                              <img src={company.logo} alt="" className="w-4 h-4" />
                            )}
                            <span>{company.name}</span>
                            {company.domain && (
                              <span className="text-xs text-gray-500">({company.domain})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Current CTC</label>
                  <input
                    type="text"
                    value={formData.currentCTC}
                    onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                    placeholder="e.g., 8 LPA"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Expected CTC</label>
                  <input
                    type="text"
                    value={formData.expectedCTC}
                    onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                    placeholder="e.g., 10 LPA"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📄 Resume</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Resume URL (Optional)</label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  placeholder="https://drive.google.com/file/... or https://dropbox.com/..."
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-sm text-gray-500">
                  Provide a public link to your resume (Google Drive, Dropbox, etc.)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                disabled={submitting}
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📤 Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

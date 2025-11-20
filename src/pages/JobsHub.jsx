import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ===========================
// API SERVICE FOR JOBS
// ===========================
const API_BASE_URL = 'http://localhost:8080/api/jobs';

const getCurrentUser = () => {
  // Replace with actual authentication logic
  return 'admin@example.com';
};

const jobService = {
  createJob: async (jobData) => {
    const response = await axios.post(
      `${API_BASE_URL}?createdBy=${getCurrentUser()}`,
      {
        jobTitle: jobData.jobTitle,
        jobDescription: jobData.jobDescription,
        jobStatus: jobData.jobStatus,
        clientName: jobData.clientName,
        vendorName: jobData.vendorName || null,
        workMode: jobData.workMode,
        location: jobData.location,
        billRate: jobData.billRate,
        jobType: jobData.jobType
      }
    );
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await axios.put(
      `${API_BASE_URL}/${id}?updatedBy=${getCurrentUser()}`,
      {
        id: id,
        jobTitle: jobData.jobTitle,
        jobDescription: jobData.jobDescription,
        jobStatus: jobData.jobStatus,
        clientName: jobData.clientName,
        vendorName: jobData.vendorName || null,
        workMode: jobData.workMode,
        location: jobData.location,
        billRate: jobData.billRate,
        jobType: jobData.jobType
      }
    );
    return response.data;
  },

  deleteJob: async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}?deletedBy=${getCurrentUser()}`);
  },

  getJob: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  getAllJobs: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  filterJobs: async (filters) => {
    const params = new URLSearchParams();
    if (filters.jobStatus) params.append('jobStatus', filters.jobStatus);
    if (filters.location) params.append('location', filters.location);
    if (filters.jobType) params.append('jobType', filters.jobType);

    const response = await axios.get(`${API_BASE_URL}/filter?${params.toString()}`);
    return response.data;
  }
};

// ===========================
// MAIN JOBS HUB COMPONENT
// ===========================
const JobsHub = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    jobStatus: '',
    location: '',
    jobType: ''
  });

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch all jobs from backend
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getAllJobs();
      setJobs(data);
      setFilteredJobs(data);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters using backend filter endpoint
  useEffect(() => {
    const applyFilters = async () => {
      if (hasActiveFilters()) {
        setLoading(true);
        try {
          const filtered = await jobService.filterJobs(filters);
          setFilteredJobs(filtered);
        } catch (err) {
          console.error('Filter error:', err);
          // Fallback to client-side filtering
          setFilteredJobs(clientSideFilter(jobs, filters));
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredJobs(jobs);
      }
    };

    applyFilters();
  }, [filters, jobs]);

  const hasActiveFilters = () => {
    return filters.jobStatus || filters.location || filters.jobType;
  };

  const clientSideFilter = (jobList, filterCriteria) => {
    let filtered = [...jobList];

    if (filterCriteria.jobStatus) {
      filtered = filtered.filter(job => job.jobStatus === filterCriteria.jobStatus);
    }

    if (filterCriteria.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filterCriteria.location.toLowerCase())
      );
    }

    if (filterCriteria.jobType) {
      filtered = filtered.filter(job => job.jobType === filterCriteria.jobType);
    }

    return filtered;
  };

  // Job handlers
  const handleAddJob = async (newJob) => {
    setLoading(true);
    setError(null);
    try {
      const createdJob = await jobService.createJob(newJob);
      setJobs(prev => [...prev, createdJob]);
      setShowAddModal(false);
      alert('Job created successfully!');
    } catch (err) {
      setError('Failed to create job. Please try again.');
      console.error('Create job error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (updatedJob) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await jobService.updateJob(updatedJob.id, updatedJob);
      setJobs(prev =>
        prev.map(job => job.id === updated.id ? updated : job)
      );
      setShowDetailModal(false);
      alert('Job updated successfully!');
    } catch (err) {
      setError('Failed to update job. Please try again.');
      console.error('Update job error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await jobService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setShowDetailModal(false);
      alert('Job deleted successfully!');
    } catch (err) {
      setError('Failed to delete job. Please try again.');
      console.error('Delete job error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Jobs Hub</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Job
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filter Panel */}
        <FilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          jobs={jobs} 
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleCardClick(job)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No jobs found matching your criteria.
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddJobModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddJob}
          />
        )}

        {showDetailModal && selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setShowDetailModal(false)}
            onUpdate={handleUpdateJob}
            onDelete={handleDeleteJob}
          />
        )}
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, setFilters, jobs }) => {
  const jobTypeOptions = ['Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship'];
  const allLocations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      jobStatus: '',
      location: '',
      jobType: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Job Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Status
          </label>
          <select
            value={filters.jobStatus}
            onChange={(e) => handleFilterChange('jobStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Locations</option>
            {allLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Job Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Types</option>
            {jobTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-6 border border-gray-200 hover:border-blue-400"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.jobTitle}</h3>
          <p className="text-sm text-gray-500">Job ID: {job.jobId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          job.jobStatus === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {job.jobStatus}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-3">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Client: </span>
          <span className="text-gray-600">{job.clientName}</span>
        </div>
        
        <div className="text-sm">
          <span className="font-medium text-gray-700">Location: </span>
          <span className="text-gray-600">{job.location}</span>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-700">Work Mode: </span>
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded">
            {job.workMode}
          </span>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-700">Job Type: </span>
          <span className="text-gray-600">{job.jobType}</span>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-700">Bill Rate: </span>
          <span className="text-green-600 font-semibold">{job.billRate}</span>
        </div>

        {job.postingDate && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Posted: {formatDate(job.postingDate)}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Job Modal Component (same as before, no changes needed)
const AddJobModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    jobStatus: 'Active',
    clientName: '',
    vendorName: '',
    workMode: '',
    location: '',
    billRate: '',
    jobType: ''
  });

  const [errors, setErrors] = useState({});

  const jobTypeOptions = ['Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship'];
  const workModeOptions = ['Onsite', 'Remote', 'Hybrid'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job description is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.billRate.trim()) newErrors.billRate = 'Bill rate is required';
    if (!formData.jobType) newErrors.jobType = 'Job type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.jobTitle ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior React Developer"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description (JD) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              rows="6"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all ${
                errors.jobDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter detailed job description, responsibilities, requirements..."
            />
            {errors.jobDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
            )}
          </div>

          {/* Job Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Active"
                  checked={formData.jobStatus === 'Active'}
                  onChange={(e) => handleInputChange('jobStatus', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Inactive"
                  checked={formData.jobStatus === 'Inactive'}
                  onChange={(e) => handleInputChange('jobStatus', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Client and Vendor Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.clientName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter client name"
              />
              {errors.clientName && (
                <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => handleInputChange('vendorName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter vendor name"
              />
            </div>
          </div>

          {/* Work Mode and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => handleInputChange('workMode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.workMode ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Work Mode</option>
                {workModeOptions.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
              {errors.workMode && (
                <p className="mt-1 text-sm text-red-600">{errors.workMode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City, State or Remote"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Bill Rate and Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Rate (CTC) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billRate}
                onChange={(e) => handleInputChange('billRate', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.billRate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., $80-100/hr or $120K-150K/year"
              />
              {errors.billRate && (
                <p className="mt-1 text-sm text-red-600">{errors.billRate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.jobType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Job Type</option>
                {jobTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-600">{errors.jobType}</p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Job Detail Modal Component (same structure as before)
const JobDetailModal = ({ job, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState({ ...job });

  const handleUpdate = () => {
    onUpdate(editedJob);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(job.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayJob = isEditing ? editedJob : job;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayJob.jobTitle}</h2>
              <p className="text-sm text-gray-500 mt-1">Job ID: {displayJob.jobId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                displayJob.jobStatus === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {displayJob.jobStatus}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Job Description
            </h3>
            {isEditing ? (
              <textarea
                value={editedJob.jobDescription}
                onChange={(e) => setEditedJob({ ...editedJob, jobDescription: e.target.value })}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{displayJob.jobDescription}</p>
            )}
          </div>

          {/* Job Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Client Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedJob.clientName}
                    onChange={(e) => setEditedJob({ ...editedJob, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayJob.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Vendor Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedJob.vendorName}
                    onChange={(e) => setEditedJob({ ...editedJob, vendorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayJob.vendorName || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Work Mode
                </label>
                <p className="text-gray-900">
                  <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {displayJob.workMode}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Location
                </label>
                <p className="text-gray-900">{displayJob.location}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Bill Rate (CTC)
                </label>
                <p className="text-green-600 font-semibold text-lg">{displayJob.billRate}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Job Type
                </label>
                <p className="text-gray-900">{displayJob.jobType}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Job Status
                </label>
                {isEditing ? (
                  <select
                    value={editedJob.jobStatus}
                    onChange={(e) => setEditedJob({ ...editedJob, jobStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{displayJob.jobStatus}</p>
                )}
              </div>

              {displayJob.postingDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Posting Date
                  </label>
                  <p className="text-gray-900">{formatDate(displayJob.postingDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Job
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit Job
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsHub;

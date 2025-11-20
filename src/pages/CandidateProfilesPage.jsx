import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ===========================
// API SERVICE
// ===========================
const API_BASE_URL = 'http://localhost:8080/api/profiles';

const getCurrentUser = () => {
  // Replace with actual authentication logic
  return 'admin@example.com';
};

const profileService = {
  createProfile: async (profileData) => {
    const response = await axios.post(
      `${API_BASE_URL}?createdBy=${getCurrentUser()}`,
      {
        candidateName: profileData.candidateName,
        email: profileData.email,
        visaStatus: profileData.visaStatus,
        phoneNumber: profileData.phoneNumber,
        activeInMarket: profileData.activeInMarket,
        technologyStack: profileData.technologyStack,
        resumeUrl: profileData.resumeUrl || null,
        verified: profileData.verified,
        visaDocuments: profileData.visaDocuments || [],
        travelHistory: profileData.travelHistory || [],
        location: profileData.location,
        appliedJobId: profileData.jobId || null,
        assignedToEmpId: profileData.assignedTo || null
      }
    );
    return response.data;
  },

  updateProfile: async (id, profileData) => {
    const response = await axios.put(
      `${API_BASE_URL}/${id}?updatedBy=${getCurrentUser()}`,
      {
        id: id,
        candidateName: profileData.candidateName,
        email: profileData.email,
        visaStatus: profileData.visaStatus,
        phoneNumber: profileData.phoneNumber,
        activeInMarket: profileData.activeInMarket,
        technologyStack: profileData.technologyStack,
        resumeUrl: profileData.resumeUrl || null,
        verified: profileData.verified,
        visaDocuments: profileData.visaDocuments || [],
        travelHistory: profileData.travelHistory || [],
        location: profileData.location,
        appliedJobId: profileData.appliedJobId || null,
        assignedToEmpId: profileData.assignedToEmpId || null
      }
    );
    return response.data;
  },

  deleteProfile: async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}?deletedBy=${getCurrentUser()}`);
  },

  getAllProfiles: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  filterProfiles: async (filters) => {
    const params = new URLSearchParams();
    if (filters.candidateName) params.append('candidateName', filters.candidateName);
    if (filters.visaStatus) params.append('visaStatus', filters.visaStatus);
    if (filters.activeStatus !== '') params.append('activeInMarket', filters.activeStatus === 'active');
    if (filters.technology) params.append('technology', filters.technology);
    if (filters.location) params.append('location', filters.location);

    const response = await axios.get(`${API_BASE_URL}/filter?${params.toString()}`);
    return response.data;
  }
};

// ===========================
// MAIN COMPONENT
// ===========================
const CandidateProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    candidateName: '',
    visaStatus: '',
    activeStatus: '',
    technologyStack: [],
    location: ''
  });

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Fetch all profiles from backend
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getAllProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (err) {
      setError('Failed to load profiles. Please try again.');
      console.error(err);
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
          const filtered = await profileService.filterProfiles(filters);
          setFilteredProfiles(filtered);
        } catch (err) {
          console.error('Filter error:', err);
          setFilteredProfiles(clientSideFilter(profiles, filters));
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredProfiles(profiles);
      }
    };

    applyFilters();
  }, [filters, profiles]);

  const hasActiveFilters = () => {
    return filters.candidateName || filters.visaStatus || 
           filters.activeStatus !== '' || filters.location ||
           filters.technologyStack.length > 0;
  };

  const clientSideFilter = (profileList, filterCriteria) => {
    let filtered = [...profileList];

    if (filterCriteria.candidateName) {
      filtered = filtered.filter(profile =>
        profile.candidateName.toLowerCase().includes(filterCriteria.candidateName.toLowerCase())
      );
    }

    if (filterCriteria.visaStatus) {
      filtered = filtered.filter(profile => profile.visaStatus === filterCriteria.visaStatus);
    }

    if (filterCriteria.activeStatus !== '') {
      filtered = filtered.filter(profile => 
        profile.activeInMarket === (filterCriteria.activeStatus === 'active')
      );
    }

    if (filterCriteria.technologyStack.length > 0) {
      filtered = filtered.filter(profile =>
        filterCriteria.technologyStack.some(tech =>
          profile.technologyStack.includes(tech)
        )
      );
    }

    if (filterCriteria.location) {
      filtered = filtered.filter(profile => profile.location === filterCriteria.location);
    }

    return filtered;
  };

  const handleAddProfile = async (newProfile) => {
    setLoading(true);
    setError(null);
    try {
      const createdProfile = await profileService.createProfile(newProfile);
      setProfiles(prev => [...prev, createdProfile]);
      setShowAddModal(false);
      alert('Profile created successfully!');
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await profileService.updateProfile(updatedProfile.id, updatedProfile);
      setProfiles(prev =>
        prev.map(profile => profile.id === updated.id ? updated : profile)
      );
      setShowDetailModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await profileService.deleteProfile(profileId);
      setProfiles(prev => prev.filter(profile => profile.id !== profileId));
      setShowDetailModal(false);
      alert('Profile deleted successfully!');
    } catch (err) {
      setError('Failed to delete profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Profiles</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Profile
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
          profiles={profiles} 
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => handleCardClick(profile)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No profiles found matching your criteria.
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddProfileModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddProfile}
          />
        )}

        {showDetailModal && selectedProfile && (
          <ProfileDetailModal
            profile={selectedProfile}
            onClose={() => setShowDetailModal(false)}
            onUpdate={handleUpdateProfile}
            onDelete={handleDeleteProfile}
          />
        )}
      </div>
    </div>
  );
};

// ===========================
// FILTER PANEL COMPONENT
// ===========================
const FilterPanel = ({ filters, setFilters, profiles }) => {
  const visaStatusOptions = ['H1B', 'Green Card', 'US Citizen', 'OPT', 'CPT', 'L1', 'TN'];
  const allTechnologies = [...new Set(profiles.flatMap(p => p.technologyStack || []))];
  const allLocations = [...new Set(profiles.map(p => p.location).filter(Boolean))];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleTechToggle = (tech) => {
    setFilters(prev => ({
      ...prev,
      technologyStack: prev.technologyStack.includes(tech)
        ? prev.technologyStack.filter(t => t !== tech)
        : [...prev.technologyStack, tech]
    }));
  };

  const clearFilters = () => {
    setFilters({
      candidateName: '',
      visaStatus: '',
      activeStatus: '',
      technologyStack: [],
      location: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name
          </label>
          <input
            type="text"
            placeholder="Enter candidate name..."
            value={filters.candidateName}
            onChange={(e) => handleFilterChange('candidateName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Visa Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visa Status
          </label>
          <select
            value={filters.visaStatus}
            onChange={(e) => handleFilterChange('visaStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All</option>
            {visaStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Active Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Status
          </label>
          <select
            value={filters.activeStatus}
            onChange={(e) => handleFilterChange('activeStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
            <option value="">All</option>
            {allLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
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

      {/* Technology Stack Filter */}
      {allTechnologies.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technology Stack
          </label>
          <div className="flex flex-wrap gap-2">
            {allTechnologies.map(tech => (
              <label key={tech} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.technologyStack.includes(tech)}
                  onChange={() => handleTechToggle(tech)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tech}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================
// PROFILE CARD COMPONENT
// ===========================
const ProfileCard = ({ profile, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-6 border border-gray-200 hover:border-blue-400"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{profile.candidateName}</h3>
        {profile.verified && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="space-y-3">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Email: </span>
          <span className="text-gray-600">{profile.email}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700">Visa Status: </span>
          <span className="text-gray-600">{profile.visaStatus}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700">Location: </span>
          <span className="text-gray-600">{profile.location}</span>
        </div>
        <div className="text-sm flex items-center gap-2">
          <span className="font-medium text-gray-700">Status: </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            profile.activeInMarket 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {profile.activeInMarket ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Technology Stack */}
        {profile.technologyStack && profile.technologyStack.length > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              {profile.technologyStack.map((tech, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// ADD PROFILE MODAL COMPONENT
// ===========================
const AddProfileModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phoneNumber: '',
    visaStatus: '',
    activeInMarket: true,
    technologyStack: [],
    resumeUrl: '',
    verified: false,
    visaDocuments: [],
    travelHistory: [],
    location: '',
    jobId: '',
    assignedTo: ''
  });

  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState({});

  const visaStatusOptions = ['H1B', 'Green Card', 'US Citizen', 'OPT', 'CPT', 'L1', 'TN'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologyStack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologyStack: [...prev.technologyStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologyStack: prev.technologyStack.filter(t => t !== tech)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.candidateName.trim()) newErrors.candidateName = 'Candidate name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.visaStatus) newErrors.visaStatus = 'Visa status is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Profile</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => handleInputChange('candidateName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.candidateName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.candidateName && (
                  <p className="mt-1 text-sm text-red-600">{errors.candidateName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
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
                  placeholder="City, State"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Professional Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technology Stack
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter technology and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologyStack.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active in Market
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('activeInMarket', !formData.activeInMarket)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.activeInMarket ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.activeInMarket ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">
                      {formData.activeInMarket ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visa & Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Visa & Documents
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.visaStatus}
                    onChange={(e) => handleInputChange('visaStatus', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.visaStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Visa Status</option>
                    {visaStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {errors.visaStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.visaStatus}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verified Status
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={formData.verified}
                      onChange={(e) => handleInputChange('verified', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="verified" className="text-sm text-gray-700">
                      Mark as Verified
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume URL
                </label>
                <input
                  type="text"
                  value={formData.resumeUrl}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter resume URL"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job ID
                </label>
                <input
                  type="text"
                  value={formData.jobId}
                  onChange={(e) => handleInputChange('jobId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter Job ID to map"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To (Employee)
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter employee ID"
                />
              </div>
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===========================
// PROFILE DETAIL MODAL COMPONENT
// ===========================
const ProfileDetailModal = ({ profile, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleUpdate = () => {
    onUpdate(editedProfile);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(profile.id);
  };

  const displayProfile = isEditing ? editedProfile : profile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{displayProfile.candidateName}</h2>
            {displayProfile.verified && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
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
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Candidate Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.candidateName}
                    onChange={(e) => setEditedProfile({ ...editedProfile, candidateName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.candidateName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Technology Stack
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayProfile.technologyStack?.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Active Status
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.activeInMarket}
                    onChange={(e) => setEditedProfile({ ...editedProfile, activeInMarket: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    displayProfile.activeInMarket 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {displayProfile.activeInMarket ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visa & Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Visa & Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Visa Status
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.visaStatus}
                    onChange={(e) => setEditedProfile({ ...editedProfile, visaStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.visaStatus}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Verified
                </label>
                <p className="text-gray-900">{displayProfile.verified ? 'Yes' : 'No'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Resume URL
                </label>
                {displayProfile.resumeUrl ? (
                  <a href={displayProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                    View Resume
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Job ID
                </label>
                <p className="text-gray-900">{displayProfile.appliedJobId || 'Not mapped'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Assigned To
                </label>
                <p className="text-gray-900">{displayProfile.assignedToEmpId || 'Not assigned'}</p>
              </div>
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
                Delete Profile
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilesPage;

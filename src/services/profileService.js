// src/services/profileService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/profiles';

// Get current user (you'll need to implement authentication)
const getCurrentUser = () => {
  // Replace with actual authentication logic
  return 'currentUser@example.com';
};

export const profileService = {
  // Create new profile
  createProfile: async (profileData) => {
    try {
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
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (id, profileData) => {
    try {
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
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Delete profile
  deleteProfile: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}?deletedBy=${getCurrentUser()}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Get single profile
  getProfile: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Get all profiles
  getAllProfiles: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  },

  // Filter profiles
  filterProfiles: async (filters) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.candidateName) params.append('candidateName', filters.candidateName);
      if (filters.visaStatus) params.append('visaStatus', filters.visaStatus);
      if (filters.activeStatus !== '') params.append('activeInMarket', filters.activeStatus === 'active');
      if (filters.technology) params.append('technology', filters.technology);
      if (filters.location) params.append('location', filters.location);

      const response = await axios.get(`${API_BASE_URL}/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering profiles:', error);
      throw error;
    }
  },

  // Assign profile to employee
  assignProfile: async (profileId, empId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/${profileId}/assign?empId=${empId}&assignedBy=${getCurrentUser()}`
      );
    } catch (error) {
      console.error('Error assigning profile:', error);
      throw error;
    }
  }
};

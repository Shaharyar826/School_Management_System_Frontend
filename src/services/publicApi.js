import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Get all public content for a school by subdomain
export const getAllPublicContent = async (subdomain) => {
  try {
    console.log('Fetching all public content...');
    if (!subdomain) {
      return { school: {}, events: [], testimonials: [], gallery: [], notices: [] };
    }
    const res = await axios.get(`${API_URL}/api/public/school/${subdomain}/content`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching all public content:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get school public info
export const getSchoolPublicInfo = async (subdomain) => {
  try {
    if (!subdomain) return null;
    const res = await axios.get(`${API_URL}/api/public/school/${subdomain}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching school info:', error);
    throw error;
  }
};

// Get landing page data (alias for getAllPublicContent)
export const getLandingPageData = async (subdomain) => {
  return getAllPublicContent(subdomain);
};

// Get gallery images
export const getGalleryImages = async (page = 1, limit = 12) => {
  try {
    const res = await axios.get(`${API_URL}/api/gallery?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};

// Get school settings (public)
export const getSchoolSettings = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/school-settings`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching school settings:', error);
    throw error;
  }
};

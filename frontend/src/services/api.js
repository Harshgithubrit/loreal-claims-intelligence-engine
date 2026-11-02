
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Claims APIs
export const getClaims = () => API.get('/claims');

export const getClaimById = (id) =>
  API.get(`/claims/${id}`);

export const createClaim = (data) =>
  API.post('/claims', data);

export const updateClaim = (id, data) =>
  API.patch(`/claims/${id}`, data);

export const submitClaim = (id) =>
  API.patch(`/claims/${id}/submit`);

// Clinical evidence APIs
export const getClinicalEvidence = (id) =>
  API.get(`/claims/${id}/evidence`);

export const addClinicalEvidence = (id, data) =>
  API.post(`/claims/${id}/evidence`, data);

// Assessment APIs
export const runAssessment = (id) =>
  API.post(`/claims/${id}/assess`);

export const getAssessmentHistory = (id) =>
  API.get(`/claims/${id}/assessments`);

export default API;

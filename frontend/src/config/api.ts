/**
 * API Configuration
 * 
 * This file centralizes all API URL configuration.
 * In production, set VITE_API_BASE_URL environment variable.
 */

// Get API base URL from environment or use default
export const API_BASE_URL = 
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 
  (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

// Helper function to build API URLs
export const apiUrl = (endpoint: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${base}/${path}`;
};

// Common endpoints - all return full URL strings
export const API_ENDPOINTS = {
  // Auth
  login: () => apiUrl('auth/login/'),
  logout: () => apiUrl('auth/logout/'),
  register: () => apiUrl('auth/register/'),
  passwordReset: () => apiUrl('auth/password-reset/'),
  token: () => apiUrl('auth/token/'),
  
  // Cases
  cases: () => apiUrl('cases/'),
  caseDetail: (id: number | string) => apiUrl(`cases/${id}/`),
  
  // Deadlines
  deadlines: () => apiUrl('deadlines/'),
  deadlineDetail: (id: number | string) => apiUrl(`deadlines/${id}/`),
  
  // Judges
  judges: () => apiUrl('judges/'),
  judgeDetail: (id: number | string) => apiUrl(`judges/${id}/`),
  
  // Admin - Users
  adminUsers: () => apiUrl('admin/users/'),
  adminUserDetail: (id: number | string) => apiUrl(`admin/users/${id}/`),
  
  // Admin - Organizations
  adminOrganizations: () => apiUrl('admin/organizations/'),
  adminOrganizationDetail: (id: number | string) => apiUrl(`admin/organizations/${id}/`),
  
  // Admin - Subscriptions
  adminSubscriptions: () => apiUrl('admin/subscriptions/'),
  adminSubscriptionDetail: (id: number | string) => apiUrl(`admin/subscriptions/${id}/`),
  
  // Admin - Billing Records
  adminBillingRecords: () => apiUrl('admin/billing-records/'),
  adminBillingRecordDetail: (id: number | string) => apiUrl(`admin/billing-records/${id}/`),
  
  // Admin - Access Grants
  adminAccessGrants: () => apiUrl('admin/access-grants/'),
  adminAccessGrantDetail: (id: number | string) => apiUrl(`admin/access-grants/${id}/`),
  
  // Billing
  billingDashboard: () => apiUrl('billing/dashboard/'),
};


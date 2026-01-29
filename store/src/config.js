// ===========================================
// CENTRALIZED CONFIGURATION
// ===========================================
// This is the SINGLE SOURCE OF TRUTH for all config values.
// NEVER hardcode URLs anywhere else in the codebase!
// ===========================================

// API URL - Railway backend
// In development: Set VITE_API_URL in .env file
// In production: Falls back to Railway URL
export const API_URL = (import.meta.env.VITE_API_URL || 'https://jari-ecom-v2-production.up.railway.app').replace(/\/$/, '');

// Store URL - Netlify frontend  
// In development: localhost
// In production: Falls back to Netlify URL
export const STORE_URL = (import.meta.env.VITE_STORE_URL || 'https://jarisolutionsecom.store').replace(/\/$/, '');

// Dashboard URL
export const DASHBOARD_URL = (import.meta.env.VITE_DASHBOARD_URL || 'https://jari-dashboard.netlify.app').replace(/\/$/, '');

// Main domains (for custom domain detection - skip these)
export const MAIN_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'jariecommstore.netlify.app',
  'jarisolutionsecom.store',
  'jari-store.netlify.app'
];

// ===========================================
// DEBUG: Log config in development
// ===========================================
if (import.meta.env.DEV) {
  console.log('📋 Config loaded:', { API_URL, STORE_URL, DASHBOARD_URL });
}

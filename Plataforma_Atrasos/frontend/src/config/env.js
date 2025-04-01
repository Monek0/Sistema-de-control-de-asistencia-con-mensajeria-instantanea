/**
 * Environment configuration utility
 * Provides a centralized way to access environment variables with fallbacks
 */

// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

// Other environment variables can be added here
// This centralizes all environment variable access

export default {
  API_URL,
  isProduction,
  isDevelopment,
  isTest
}; 
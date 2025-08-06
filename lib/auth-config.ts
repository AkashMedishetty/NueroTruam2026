// Auto-detect URLs for Vercel deployment
export function getAuthUrl(): string {
  // If NEXTAUTH_URL is explicitly set, use it
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // For Vercel deployments, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // For local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Fallback (this shouldn't happen in production)
  return 'https://neurotrauma2026.vercel.app';
}

// Auto-detect APP_URL (same logic as NEXTAUTH_URL)
export function getAppUrl(): string {
  // If APP_URL is explicitly set, use it
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  // Use the same auto-detection logic
  return getAuthUrl();
}

// Helper to get the base URL for any purpose
export function getBaseUrl(): string {
  return getAppUrl();
}

// Export for use in API routes and components
export const APP_URL = getAppUrl();
export const NEXTAUTH_URL = getAuthUrl();
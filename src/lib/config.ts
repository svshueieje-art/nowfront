// ========================================
// Application Configuration
// ========================================

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'Buna Investors Group',
  maxUploadSize: Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024, // 5MB
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  currency: 'ETB',
  timezone: 'Africa/Addis_Ababa',
} as const;

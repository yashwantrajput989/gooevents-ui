// INGO Frontend Configuration

const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction 
  ? 'https://api.gooevents.in/api' 
  : 'http://localhost:5000/api';

export const IMAGE_BASE_URL = isProduction 
  ? 'https://api.gooevents.in' 
  : 'http://localhost:5000';

// Helper to format image URLs
export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000'; // Default fallback
  if (typeof url !== 'string') return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000';

  // Normalize backslashes (Windows) to forward slashes (web paths)
  let cleanUrl = url.replace(/\\/g, '/');

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:image')) {
    return cleanUrl;
  }

  // Ensure path starts with a leading slash
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  return `${IMAGE_BASE_URL}${cleanUrl}`;
};

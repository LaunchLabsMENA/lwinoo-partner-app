export const API_BASE_URL = 'https://lwinoo-staging.techbanq.net';
/** Where the profile photo, cover and verification documents are uploaded (`POST /api/files`). */
export const UPLOAD_BASE_URL = 'https://moisture-granola-underwent.ngrok-free.dev';
export const REQUEST_TIMEOUT_MS = 15000;
export const UPLOAD_TIMEOUT_MS = 60000;
/** How long launch waits for fresh account data before using the saved copy. */
export const BOOT_TIMEOUT_MS = 6000;

/** ngrok's free tier answers with a warning page instead of the API unless this header is sent. */
export const hostHeaders = (url: string | null | undefined): Record<string, string> | undefined =>
  url && /\.ngrok(-free)?\.(app|dev|io)/.test(url)
    ? { 'ngrok-skip-browser-warning': 'true' }
    : undefined;

/** An <Image> source for a file URL, with any headers its host needs. */
export const fileSource = (url: string | null | undefined) => {
  const uri = fileUrl(url);
  return uri ? { uri, headers: hostHeaders(uri) } : null;
};

/** File URLs from the API are relative (`/api/files/<id>`); local picks are already absolute. */
export const fileUrl = (url: string | null | undefined): string | null => {
  if (!url) {
    return null;
  }
  return /^[a-z]+:/i.test(url) ? url : `${API_BASE_URL}${url}`;
};

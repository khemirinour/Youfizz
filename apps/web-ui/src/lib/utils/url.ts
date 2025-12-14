/**
 * Get the base site URL from environment variable or fallback to current origin
 * @returns The base URL of the site
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or current origin
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200';
}

/**
 * Generate the full URL for an article page
 * @param articleId - The article ID
 * @returns The full URL to the article page
 */
export function getArticleUrl(articleId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/article/${articleId}`;
}

/**
 * Convert a relative image URL to an absolute URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The absolute image URL
 */
export function getAbsoluteImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // If already absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, make it absolute
  // Check if it's a MinIO URL (starts with /youfizz-articles/)
  if (imageUrl.startsWith('/')) {
    // For MinIO URLs, we need to construct the full URL
    // Assuming MinIO is served at http://localhost:9000
    const minioBaseUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
    return `${minioBaseUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's relative to base URL
  const baseUrl = getBaseUrl();
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}


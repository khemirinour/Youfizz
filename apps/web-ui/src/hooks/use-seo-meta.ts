import { useEffect } from 'react';
import { getArticleUrl, getAbsoluteImageUrl, getBaseUrl } from '@/lib/utils/url';

export interface SeoMetaData {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

/**
 * Custom hook to dynamically update Open Graph and Twitter meta tags
 * for social media sharing (Facebook, Twitter, etc.)
 */
export function useSeoMeta(data: SeoMetaData | null) {
  useEffect(() => {
    if (!data) return;

    const {
      title,
      description,
      image,
      url,
      type = 'website',
      siteName = 'YouFizz',
    } = data;

    // Get absolute URLs
    const absoluteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const absoluteImage = image ? getAbsoluteImageUrl(image) : undefined;

    // Meta tags to update
    const metaTags: Array<{ property?: string; name?: string; content: string }> = [
      // Open Graph tags
      { property: 'og:title', content: title },
      { property: 'og:type', content: type },
      { property: 'og:url', content: absoluteUrl },
      { property: 'og:site_name', content: siteName },
      // Twitter tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
    ];

    // Add description if provided
    if (description) {
      metaTags.push(
        { property: 'og:description', content: description },
        { name: 'twitter:description', content: description }
      );
    } else {
      // Use title as fallback for description
      metaTags.push(
        { property: 'og:description', content: title },
        { name: 'twitter:description', content: title }
      );
    }

    // Add image if provided
    if (absoluteImage) {
      metaTags.push(
        { property: 'og:image', content: absoluteImage },
        { name: 'twitter:image', content: absoluteImage }
      );
    }

    // Update or create meta tags
    metaTags.forEach(({ property, name, content }) => {
      const selector = property
        ? `meta[property="${property}"]`
        : `meta[name="${name}"]`;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', property);
        } else if (name) {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Update page title
    if (title) {
      document.title = title;
    }

    // Cleanup function to remove meta tags when component unmounts or data changes
    return () => {
      // Note: We don't remove meta tags on cleanup to avoid flickering
      // They will be updated on the next render
    };
  }, [data]);
}


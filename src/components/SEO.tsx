import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  structuredSchemaType?: 'JobPosting' | 'Event' | 'WebApplication';
  schemaData?: any;
  noindex?: boolean;
}

/**
 * SEO component to manage meta tags and structured data dynamically in the browser DOM.
 */
export const SEO: React.FC<SEOProps> = ({ 
  title = "YuvaHub | Find Student Hackathons, Scholarships & Mentorships", 
  description = "Discovery platform for Indian students. Find hackathons, scholarships, and mentorship opportunities to boost your career. Real-time updates and AI matching.",
  image = "https://yuvahub.xyz/og-image.jpg",
  url = "",
  structuredSchemaType = "WebApplication",
  schemaData = null,
  noindex = false
}) => {
  useEffect(() => {
    // Dynamic document title
    document.title = title;

    // Helper to safely set/update any head meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, attributeValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update the link canonical tag
    const setCanonicalTag = (hrefValue: string) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', hrefValue);
    };

    const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : "https://yuvahub.xyz");

    // Update standard description
    setMetaTag('name', 'description', description);
    
    // Update robots index instructions
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Update OpenGraph details for rich social cards
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', finalUrl);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);

    // Update Twitter details
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:url', finalUrl);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Update Canonical URL
    setCanonicalTag(finalUrl);

    // Schema Markup Construction
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YuvaHub",
      "url": "https://yuvahub.xyz",
      "description": "India's leading discovery platform for student opportunities, hackathons, and scholarships.",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "image": image
    };

    const finalSchema = schemaData ? {
      "@context": "https://schema.org",
      ...schemaData
    } : baseSchema;

    // Inject JSON-LD Script Tag dynamically inside the head
    let scriptTag = document.getElementById('jsonld-seo-schema') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-seo-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(finalSchema);
  }, [title, description, image, url, structuredSchemaType, schemaData, noindex]);

  return null;
};

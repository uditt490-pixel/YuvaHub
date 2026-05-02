import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * SEO component to manage meta tags and structured data dynamically.
 */
export const SEO: React.FC<SEOProps> = ({ 
  title = "YuvaHub | Find Student Hackathons, Scholarships & Mentorships", 
  description = "Discovery platform for Indian students. Find hackathons, scholarships, and mentorship opportunities to boost your career. Real-time updates and AI matching.",
  image = "https://yuvahub.xyz/og-image.jpg",
  url = "https://yuvahub.xyz"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YuvaHub",
    "url": url,
    "description": description,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "author": {
      "@type": "Organization",
      "name": "YuvaHub Team"
    },
    "image": image
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
};

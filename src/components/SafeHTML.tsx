import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * A component that safely renders sanitized HTML content
 * This component uses DOMPurify to sanitize HTML before rendering
 * and implements strict tag and attribute whitelisting
 */
const SafeHTML = ({ html, className = '' }: SafeHTMLProps) => {
  // Sanitize HTML in a memoized function to avoid re-sanitizing on every render
  const sanitizedHTML = useMemo(() => {
    // SECURITY: Sanitize the HTML with DOMPurify before rendering
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h3', 'strong', 'li', 'p', 'ul', 'ol', 'em', 'b', 'i', 'span'
      ],
      ALLOWED_ATTR: ['class', 'style']
    });
  }, [html]);

  // We're using a wrapper to ensure the component is self-contained
  // and the dangerouslySetInnerHTML usage is isolated
  return (
    <div className={className}>
      {/* SECURITY: Content is sanitized by DOMPurify before rendering */}
      <span data-sanitized="true" dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
    </div>
  );
};

export default SafeHTML; 
// components/SchemaMarkup.jsx
import { useEffect } from 'react';
import { getSchema, getHomepageSchema, getBlogSchema, getServiceSchema } from '../utils/schemaGenerator';

const SchemaMarkup = ({ 
  type,       // "agency", "blog", "service", etc.
  data = {},  // dynamic data
  multiple = false, // agar multiple schemas chahiye
  schemas = []     // array of schemas
}) => {
  useEffect(() => {
    let schemaArray = [];

    if (multiple && schemas.length > 0) {
      // Multiple schemas add karein
      schemaArray = schemas;
    } else if (type === "homepage") {
      // Homepage ke liye pre-defined
      schemaArray = getHomepageSchema();
    } else if (type === "blog" && data) {
      // Blog ke liye
      schemaArray = getBlogSchema(data);
    } else if (type === "service" && data) {
      // Service ke liye
      schemaArray = getServiceSchema(data);
    } else if (type) {
      // Single schema
      const schema = getSchema(type, data);
      if (schema) schemaArray = [schema];
    }

    if (schemaArray.length === 0) return;

    // Purane schemas remove karein
    const existingScripts = document.querySelectorAll(`script[data-schema]`);
    existingScripts.forEach(script => script.remove());

    // Naye schemas add karein
    schemaArray.forEach((schema, index) => {
      if (!schema) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', type || `schema-${index}`);
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll(`script[data-schema]`);
      scripts.forEach(script => script.remove());
    };
  }, [type, data, multiple, schemas]);

  return null; // Yeh component kuch render nahi karta
};

export default SchemaMarkup;
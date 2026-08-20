import { useEffect } from 'react';
import {
  getHomepageSchema,
  getAboutSchema,
  getServicesListingSchema,
  getServiceSchema,
  getBlogListingSchema,
  getBlogSchema,
  getPortfolioListingSchema,
  getPortfolioSchema,
  getContactSchema,
  getTemplatesSchema,
  getCategorySchema,
  getProductSchema,
  getSchema
} from '../utils/schemaGenerator';

const SchemaMarkup = ({
  type,           // "homepage", "blog", "service", "about", etc.
  data = {},
  multiple = false,
  schemas = []
}) => {
  useEffect(() => {
    let schemasToInject = [];

    // 1. Agar multiple schemas manually pass kiye gaye hain
    if (multiple && Array.isArray(schemas) && schemas.length > 0) {
      schemasToInject = schemas;
    }
    // 2. Pre-built full schemas (yeh already { @context, @graph } return karte hain)
    else if (type === "homepage") {
      schemasToInject = [getHomepageSchema()];
    } else if (type === "about") {
      schemasToInject = [getAboutSchema()];
    } else if (type === "servicesListing") {
      schemasToInject = [getServicesListingSchema()];
    } else if (type === "service" && data) {
      schemasToInject = [getServiceSchema(data)];
    } else if (type === "blogListing") {
      schemasToInject = [getBlogListingSchema()];
    } else if (type === "blog" && data) {
      schemasToInject = [getBlogSchema(data)];
    } else if (type === "portfolioListing") {
      schemasToInject = [getPortfolioListingSchema()];
    } else if (type === "portfolio" && data) {
      schemasToInject = [getPortfolioSchema(data)];
    } else if (type === "contact") {
      schemasToInject = [getContactSchema()];
    } else if (type === "templates") {
      schemasToInject = [getTemplatesSchema()];
    } else if (type === "category" && data) {
      schemasToInject = [getCategorySchema(data)];
    } else if (type === "product" && data) {
      schemasToInject = [getProductSchema(data)];
    }
    // 3. Single schema (getSchema se)
    else if (type) {
      const schema = getSchema(type, data);
      if (schema) {
        // Single node ko bhi full context ke sath wrap kar dete hain
        schemasToInject = [{
          "@context": "https://schema.org",
          "@graph": [schema]
        }];
      }
    }

    if (schemasToInject.length === 0) return;

    // Purane schema scripts hatao
    document.querySelectorAll('script[data-schema]').forEach(script => script.remove());

    // Naye schemas inject karo
    schemasToInject.forEach((schema, index) => {
      if (!schema) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', type || `schema-${index}`);
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('script[data-schema]').forEach(script => script.remove());
    };
  }, [type, data, multiple, schemas]);

  return null;
};

export default SchemaMarkup;
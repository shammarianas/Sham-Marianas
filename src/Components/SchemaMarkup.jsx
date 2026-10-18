import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  getHomepageSchema,
  getAboutSchema,
  getServicesListingSchema,
  getServiceSchema,
  getBlogListingSchema,
  getBlogCategorySchema,
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
  const location = useLocation();
  let schemasToInject = [];
  const schemaData = type === "service"
    ? {
        ...data,
        url: data.url || `https://www.shammarianas.com${location.pathname}`,
        serviceType: data.serviceType || data.title?.split("|")[0].trim() || ""
      }
    : data;

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
      schemasToInject = [getServiceSchema(schemaData)];
  } else if (type === "blogListing") {
      schemasToInject = [getBlogListingSchema(data)];
  } else if (type === "blogCategory") {
      schemasToInject = [getBlogCategorySchema(data)];
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
      const schema = getSchema(type, schemaData);
      if (schema) {
        // Single node ko bhi full context ke sath wrap kar dete hain
        schemasToInject = [{
          "@context": "https://schema.org",
          "@graph": [schema]
        }];
      }
  }

  if (schemasToInject.length === 0) return null;

  return (
    <Helmet>
      {schemasToInject.map((schema, index) => (
        schema && (
          <script key={`${type || 'schema'}-${index}`} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        )
      ))}
    </Helmet>
  );
};

export default SchemaMarkup;

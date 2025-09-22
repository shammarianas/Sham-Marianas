// Simplified implementation of class-variance-authority
export function cva(baseClasses, config = {}) {
  return function(props = {}) {
    let classes = baseClasses || '';
    
    if (config.variants) {
      Object.entries(config.variants).forEach(([variantKey, variantValues]) => {
        const value = props[variantKey];
        if (value && variantValues[value]) {
          classes += ' ' + variantValues[value];
        }
      });
    }
    
    if (config.defaultVariants) {
      Object.entries(config.defaultVariants).forEach(([key, defaultValue]) => {
        if (props[key] === undefined && config.variants?.[key]?.[defaultValue]) {
          classes += ' ' + config.variants[key][defaultValue];
        }
      });
    }
    
    return classes.trim();
  };
}

// Type helper (simplified)
export function VariantProps() {
  return {};
}

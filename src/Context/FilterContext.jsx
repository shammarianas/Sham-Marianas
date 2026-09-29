import { createContext, useContext, useState, useMemo, useCallback } from "react";

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    categories: [],
    aiGenerated: [],
    resolution: [],
    frameRate: [],
    properties: [],
    applicationsSupported: [],
  });

  // ✅ FIXED: useCallback کے ساتھ memoize کریں
  const updateFilters = useCallback((filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  }, []); // ✅ Empty dependency array

  // ✅ FIXED: clearFilters function بھی شامل کریں اگر needed ہو
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      aiGenerated: [],
      resolution: [],
      frameRate: [],
      properties: [],
      applicationsSupported: [],
    });
  }, []);

  // ✅ FIXED: Context value کو properly memoize کریں
  const value = useMemo(() => ({
    filters,
    updateFilters,
    clearFilters
  }), [filters, updateFilters, clearFilters]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
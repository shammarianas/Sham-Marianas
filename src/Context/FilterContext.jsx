import React, { createContext, useContext, useState, useMemo } from "react";

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

  const updateFilters = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const value = useMemo(() => ({ filters, updateFilters }), [filters]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

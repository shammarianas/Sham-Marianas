import React, { useState } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const ExportButton = ({ 
  data, 
  filename = 'export',
  exportConfig,
  configType, // 'reports', 'subscriptions', 'users', 'payments'
  customColumns, // For dynamic column creation
  variant = 'secondary',
  className = '',
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
  buttonText = 'Export Data',
  loadingText = 'Exporting...',
  options = {}
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert(options.emptyMessage || "No data available to export");
      return;
    }

    try {
      setExportLoading(true);
      
      // Callback before export starts
      if (onExportStart) onExportStart();
      
      // Determine which config to use
      let finalConfig;
      
      if (exportConfig) {
        // Use provided config
        finalConfig = exportConfig;
      } else if (configType && exportConfigs[configType]) {
        // Use pre-defined config type
        finalConfig = exportConfigs[configType];
      } else if (customColumns) {
        // Create config from custom columns
        finalConfig = createExportConfig(customColumns);
      } else {
        // Default fallback - export all object properties
        if (data.length > 0) {
          const sampleItem = data[0];
          finalConfig = {
            columns: Object.keys(sampleItem).map(key => ({
              header: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              accessor: (item) => {
                const value = item[key];
                if (value === null || value === undefined) return 'N/A';
                if (typeof value === 'object') return JSON.stringify(value);
                return String(value);
              }
            }))
          };
        } else {
          alert("No data available to export");
          return;
        }
      }
      
      // Perform export
      const success = exportToCSV(data, filename, finalConfig.columns, options);
      
      // Callback after export completes
      if (onExportComplete) onExportComplete(success);
      
    } catch (error) {
      console.error('Export failed:', error);
      if (onExportError) onExportError(error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <button 
      className={`action-button ${variant} ${className} ${exportLoading ? 'loading' : ''}`}
      onClick={handleExport}
      disabled={disabled || exportLoading || !data || data.length === 0}
      title={disabled ? 'No data to export' : `Export ${data?.length || 0} records`}
    >
      {exportLoading ? (
        <>
          <FiRefreshCw className="button-icon spinning" /> 
          {loadingText}
        </>
      ) : (
        <>
          <FiDownload className="button-icon" /> 
          {buttonText}
        </>
      )}
    </button>
  );
};

export default ExportButton;
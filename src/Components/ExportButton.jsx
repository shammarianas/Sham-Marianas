import { useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { exportToCSV, exportToExcel, exportToJSON } from "../utils/exportUtils";

const ExportButton = ({
  data,
  filename = "export",
  columns, // <-- new prop for column config
  variant = "secondary",
  className = "",
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
  buttonText = "Export Data",
  loadingText = "Exporting...",
  options = {},
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async (format = "csv") => {
    if (!data || data.length === 0) {
      alert(options.emptyMessage || "No data available to export");
      return;
    }

    if (!columns || columns.length === 0) {
      alert("No column configuration provided for export");
      return;
    }

    try {
      setExportLoading(true);
      if (onExportStart) onExportStart();

      // Format data according to columns config
      const formattedData = data.map((item) =>
        columns.reduce((acc, col) => {
          acc[col.header] = col.accessor(item);
          return acc;
        }, {})
      );

      const timestamp = new Date().toISOString().split("T")[0];
      const exportFilename = `${filename}_${timestamp}.${
        format === "excel" ? "xlsx" : format === "json" ? "json" : "csv"
      }`;

      // Export
      if (format === "json") {
        exportToJSON(formattedData, exportFilename);
      } else if (format === "excel") {
        exportToExcel(formattedData, exportFilename);
      } else {
        exportToCSV(formattedData, exportFilename);
      }

      if (onExportComplete) onExportComplete(true);
    } catch (error) {
      console.error("Export failed:", error);
      if (onExportError) onExportError(error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <button
      className={`action-button ${variant} ${className} ${
        exportLoading ? "loading" : ""
      }`}
      onClick={() => handleExport()}
      disabled={disabled || exportLoading || !data || data.length === 0}
      title={
        disabled ? "No data to export" : `Export ${data?.length || 0} records`
      }
       aria-label="Export Data"
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

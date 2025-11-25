import { FiDownload } from "react-icons/fi";

// Smart header name generator
const generateHeaderName = (key) => {
  const headerMap = {
    // Common field mappings
    id: 'ID',
    userName: 'User Name',
    userEmail: 'User Email',
    email: 'Email',
    name: 'Name',
    fullName: 'Full Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    plan: 'Plan',
    status: 'Status',
    price: 'Price',
    amount: 'Amount',
    totalSpent: 'Total Spent',
    billingCycle: 'Billing Cycle',
    nextBillingDate: 'Next Billing Date',
    startDate: 'Start Date',
    createdAt: 'Created Date',
    updatedAt: 'Updated Date',
    resolvedAt: 'Resolved Date',
    paymentMethod: 'Payment Method',
    transactionId: 'Transaction ID',
    description: 'Description',
    subject: 'Subject',
    issueType: 'Issue Type',
    category: 'Category',
    type: 'Type',
    location: 'Location',
    downloads: 'Downloads',
    joinDate: 'Join Date',
    lastLogin: 'Last Login',
    features: 'Features',
    
    // Payment specific
    paymentStatus: 'Payment Status',
    paymentDate: 'Payment Date',
    invoiceId: 'Invoice ID',
    
    // Subscription specific
    subscriptionId: 'Subscription ID',
    subscriptionStatus: 'Subscription Status',
    
    // User specific
    userStatus: 'User Status',
    role: 'Role',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country'
  };

  // If we have a mapped name, use it
  if (headerMap[key]) {
    return headerMap[key];
  }

  // Otherwise generate from key
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/(^|\s)\S/g, l => l.toUpperCase())
    .trim();
};

// Smart value formatter
const formatValueForExport = (value, key) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle dates
  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
    return formatDateForExport(value);
  }

  // Handle prices/amounts
  if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('spent')) {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    // Firestore timestamp
    if (value.toDate) {
      return formatDateForExport(value);
    }
    // Regular object
    return JSON.stringify(value);
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
};

// Generic CSV Export Function
export const exportToCSV = (data, filename, columns = null, options = {}) => {
  try {
    if (!data || data.length === 0) {
      alert(options.emptyMessage || "No data available to export");
      return false;
    }

    let finalColumns = columns;

    // If no columns provided, generate them automatically from data
    if (!finalColumns && data.length > 0) {
      const sampleItem = data[0];
      finalColumns = Object.keys(sampleItem).map(key => ({
        header: generateHeaderName(key),
        accessor: (item) => formatValueForExport(item[key], key)
      }));
    }

    // Prepare headers
    const headers = finalColumns.map(col => col.header);
    
    // Prepare CSV data
    const csvData = data.map((item, index) => {
      return finalColumns.map(col => {
        let value = col.accessor(item, index);
        
        // Handle special CSV formatting
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`; // Escape quotes for CSV
        }
        
        return value;
      });
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`✅ Exported ${data.length} records successfully`);
    console.log('📊 Headers:', headers);
    return true;
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    alert(options.errorMessage || 'Failed to export data. Please try again.');
    return false;
  }
};

// Date formatting utility for export
export const formatDateForExport = (timestamp, options = {}) => {
  if (!timestamp) return options.defaultValue || 'N/A';
  
  try {
    let date;
    if (timestamp?.toDate) {
      // Firestore timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Date object
      date = timestamp;
    } else {
      // String timestamp
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return options.defaultValue || 'N/A';
    
    const formatOptions = {
      year: 'numeric',
      month: options.monthFormat || 'short',
      day: 'numeric',
      ...options.dateOptions
    };

    if (options.includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    return options.defaultValue || 'N/A';
  }
};

// Common column types for reusability
export const columnTypes = {
  email: (header = 'Email') => ({
    header,
    accessor: (item) => item.email || item.userEmail || item.contactEmail || 'N/A'
  }),
  
  name: (header = 'Name') => ({
    header,
    accessor: (item) => item.name || item.userName || item.fullName || 'N/A'
  }),
  
  date: (header = 'Date', field = 'createdAt', options = {}) => ({
    header,
    accessor: (item) => formatDateForExport(item[field], options)
  }),
  
  status: (header = 'Status', field = 'status') => ({
    header,
    accessor: (item) => {
      const status = item[field];
      const statusMap = {
        active: 'Active',
        pending: 'Pending',
        expired: 'Expired',
        canceled: 'Canceled',
        resolved: 'Resolved',
        'in-progress': 'In Progress'
      };
      return statusMap[status] || status || 'Unknown';
    }
  }),
  
  currency: (header = 'Amount', field = 'price', currency = 'USD') => ({
    header,
    accessor: (item) => {
      const amount = item[field];
      if (amount == null) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    }
  }),
  
  text: (header, field, defaultValue = 'N/A') => ({
    header,
    accessor: (item) => item[field] || defaultValue
  })
};

// Pre-configured export configs for different data types
export const exportConfigs = {
  // For user reports
  reports: {
    columns: [
      columnTypes.email('User Email'),
      columnTypes.text('User ID', 'userId'),
      {
        header: 'Category',
        accessor: (report) => {
          const categoryMap = {
            technical: 'Technical Issue',
            billing: 'Billing Issue', 
            general: 'General Inquiry'
          };
          return categoryMap[report.issueType] || report.issueType || 'N/A';
        }
      },
      columnTypes.text('Subject', 'subject', 'No Subject'),
      columnTypes.text('Description', 'description', 'No Description'),
      columnTypes.status('Status'),
      columnTypes.date('Created Date', 'createdAt', { includeTime: true }),
      columnTypes.date('Updated Date', 'updatedAt', { includeTime: true }),
      columnTypes.date('Resolved Date', 'resolvedAt', { includeTime: true }),
      {
        header: 'Resolution Time (Days)',
        accessor: (report) => {
          if (report.resolvedAt && report.createdAt) {
            const created = report.createdAt.toDate();
            const resolved = report.resolvedAt.toDate?.() || new Date();
            return ((resolved - created) / (1000 * 60 * 60 * 24)).toFixed(1);
          }
          return 'N/A';
        }
      }
    ]
  },

  // For subscriptions
  subscriptions: {
    columns: [
      columnTypes.name('User Name'),
      columnTypes.email('User Email'),
      columnTypes.text('Plan', 'plan'),
      columnTypes.status('Status', 'status'),
      columnTypes.currency('Price', 'price'),
      columnTypes.text('Billing Cycle', 'billingCycle'),
      columnTypes.date('Start Date', 'startDate'),
      columnTypes.date('Next Billing', 'nextBillingDate'),
      columnTypes.currency('Total Spent', 'totalSpent'),
      columnTypes.text('Payment Method', 'paymentMethod'),
      columnTypes.text('Location', 'location')
    ]
  },

  // For users
  users: {
    columns: [
      columnTypes.name('Full Name'),
      columnTypes.email('Email'),
      columnTypes.text('User ID', 'userId'),
      columnTypes.date('Join Date', 'joinDate'),
      columnTypes.date('Last Login', 'lastLogin'),
      columnTypes.status('Status', 'status'),
      columnTypes.text('Location', 'location'),
      columnTypes.currency('Total Spent', 'totalSpent')
    ]
  },

  // For payments
  payments: {
    columns: [
      columnTypes.name('Customer Name'),
      columnTypes.email('Customer Email'),
      columnTypes.currency('Amount', 'amount'),
      columnTypes.status('Status', 'paymentStatus'),
      columnTypes.date('Payment Date', 'paymentDate', { includeTime: true }),
      columnTypes.text('Payment Method', 'paymentMethod'),
      columnTypes.text('Transaction ID', 'transactionId')
    ]
  }
};

// Dynamic config creator - YEH ADD KARO
export const createExportConfig = (columnDefinitions) => {
  return {
    columns: columnDefinitions.map(col => {
      if (typeof col === 'string') {
        // Simple field name
        return columnTypes.text(col, col);
      } else if (typeof col === 'object' && col.type) {
        // Pre-defined type with customization
        return columnTypes[col.type](col.header, col.field, col.options);
      } else {
        // Custom column definition
        return col;
      }
    })
  };
};

// Reports specific export configuration (existing)
export const reportsExportConfig = {
  columns: [
    {
      header: 'User Email',
      accessor: (report) => report.email || 'N/A'
    },
    {
      header: 'User ID',
      accessor: (report) => report.userId || 'N/A'
    },
    {
      header: 'Category',
      accessor: (report) => {
        const categoryMap = {
          technical: 'Technical Issue',
          billing: 'Billing Issue', 
          general: 'General Inquiry'
        };
        return categoryMap[report.issueType] || report.issueType || 'N/A';
      }
    },
    {
      header: 'Subject',
      accessor: (report) => report.subject || 'No Subject'
    },
    {
      header: 'Description',
      accessor: (report) => report.description || 'No Description'
    },
    {
      header: 'Status',
      accessor: (report) => {
        const statusMap = {
          pending: 'Pending',
          'in-progress': 'In Progress',
          resolved: 'Resolved'
        };
        return statusMap[report.status] || report.status || 'Pending';
      }
    },
    {
      header: 'Created Date',
      accessor: (report) => formatDateForExport(report.createdAt)
    },
    {
      header: 'Updated Date',
      accessor: (report) => report.updatedAt ? formatDateForExport(report.updatedAt) : 'N/A'
    },
    {
      header: 'Resolved Date',
      accessor: (report) => report.resolvedAt ? formatDateForExport(report.resolvedAt) : 'N/A'
    },
    {
      header: 'Resolution Time (Days)',
      accessor: (report) => {
        if (report.resolvedAt && report.createdAt) {
          const created = report.createdAt.toDate();
          const resolved = report.resolvedAt.toDate?.() || new Date();
          return ((resolved - created) / (1000 * 60 * 60 * 24)).toFixed(1);
        }
        return 'N/A';
      }
    }
  ]
};
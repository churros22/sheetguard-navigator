
/**
 * Application-wide configuration settings
 */

// Google Sheets API configuration
export const googleSheetsConfig = {
  // Replace with your Google API key
  apiKey: 'REPLACE_WITH_YOUR_API_KEY',
  
  // Spreadsheet configurations for different sections of the app
  sheets: {
    // Dashboard data sheet (tasks, progress, etc.)
    dashboard: {
      spreadsheetId: 'REPLACE_WITH_DASHBOARD_SPREADSHEET_ID',
      range: 'dashboard!A1:Z1000'
    },
    
    // Documents library sheet
    documents: {
      spreadsheetId: 'REPLACE_WITH_DOCUMENTS_SPREADSHEET_ID',
      range: 'documents!A1:Z1000'
    },
    
    // Tableaux (tables/charts) sheet
    tableaux: {
      spreadsheetId: 'REPLACE_WITH_TABLEAUX_SPREADSHEET_ID',
      range: 'tableaux!A1:Z1000'
    },
    
    // Diagrams sheet
    diagrammes: {
      spreadsheetId: 'REPLACE_WITH_DIAGRAMMES_SPREADSHEET_ID',
      range: 'diagrammes!A1:Z1000'
    }
  }
};

// Application settings
export const appSettings = {
  appName: 'CBE#4 Process Validation',
  
  // Deployment settings for GitHub Pages
  deployment: {
    // Base path for GitHub Pages deployment
    // Set this to the name of your GitHub repository
    basePath: '/sheetguard-navigator',
    
    // Flag to indicate if the app is running in production
    isProduction: process.env.NODE_ENV === 'production'
  },
  
  // UI/UX Settings
  ui: {
    // Animation duration in milliseconds
    animationDuration: 300,
    
    // Default theme (light or dark)
    defaultTheme: 'light'
  }
};

/**
 * Gets base URL for the application - handles GitHub Pages path prefixing
 * @returns The base URL for the application
 */
export const getBaseUrl = (): string => {
  if (appSettings.deployment.isProduction) {
    return appSettings.deployment.basePath;
  }
  return '';
};

/**
 * INSTRUCTIONS:
 * 
 * 1. Replace 'REPLACE_WITH_YOUR_API_KEY' with your Google Sheets API key
 * 2. Replace the spreadsheetId values with your actual Google Spreadsheet IDs
 * 3. Update the range values if your data is in different ranges
 * 4. Modify the basePath to match your GitHub repository name
 */

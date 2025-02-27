
# CBE#4-Process Validation Application

A modern React application for managing process validation data, documents, and diagrams.

## Features

- Secure authentication with password protection
- Interactive dashboard with CRUD operations
- Document library with filtering and search
- Diagrammes viewer with categorization
- Data visualization with charts and tables
- Responsive design that works on all devices
- Dark/light mode toggle

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher)
- npm (v6.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cbe4-process-validation.git
   cd cbe4-process-validation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser to:
   ```
   http://localhost:5173
   ```

## Configuration

### Google Sheets API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable the "Google Sheets API"
5. Go to "APIs & Services" > "Credentials"
6. Create an API key (restrict it to Google Sheets API only for security)
7. Copy the API key

### Configuring the Application

1. Open `src/configs/appConfig.ts`
2. Replace `REPLACE_WITH_YOUR_API_KEY` with your Google Sheets API key
3. Update the spreadsheet IDs and ranges as needed:

```javascript
export const googleSheetsConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  
  sheets: {
    dashboard: {
      spreadsheetId: 'YOUR_DASHBOARD_SPREADSHEET_ID',
      range: 'dashboard!A1:Z1000'
    },
    documents: {
      spreadsheetId: 'YOUR_DOCUMENTS_SPREADSHEET_ID',
      range: 'documents!A1:Z1000'
    },
    tableaux: {
      spreadsheetId: 'YOUR_TABLEAUX_SPREADSHEET_ID',
      range: 'tableaux!A1:Z1000'
    },
    diagrammes: {
      spreadsheetId: 'YOUR_DIAGRAMMES_SPREADSHEET_ID',
      range: 'diagrammes!A1:Z1000'
    }
  }
};
```

### Google Sheets Structure

Each sheet should have the following columns:

#### Dashboard Sheet
- id
- name
- status
- progress
- assignee

#### Documents Sheet
- id
- name
- category
- link
- type (google-doc, pdf)

#### Tableaux Sheet
- id
- name
- category
- link
- type (google-sheet)

#### Diagrammes Sheet
- id
- name
- category
- link
- type (html, pdf, google-doc)

## Deployment to GitHub Pages

1. Update the `appSettings.deployment.basePath` in `src/configs/appConfig.ts` with your GitHub repository name:

```javascript
deployment: {
  basePath: '/your-repo-name',
  isProduction: process.env.NODE_ENV === 'production'
}
```

2. Deploy to GitHub Pages:

```
npm run deploy
```

## Customization

### Changing the Login Password

1. Open `src/utils/authUtils.ts`
2. Update the `CORRECT_PASSWORD` constant:

```javascript
const CORRECT_PASSWORD = 'your-new-password';
```

### Adding Custom Assets

1. Place your custom logos in the `public` directory
2. Update the logo reference in `src/pages/LoginPage.tsx`:

```javascript
<img src="/your-logo.svg" alt="Company Logo" className="h-8" />
```

### Changing Colors and Theme

1. Modify the CSS variables in `src/index.css` to change the color scheme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* Update other colors as needed */
}
```

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/utils/` - Utility functions and helpers
- `src/configs/` - Application configuration files
- `src/hooks/` - Custom React hooks
- `src/lib/` - Shared library code
- `public/` - Static assets and images

## License

This project is licensed under the MIT License - see the LICENSE file for details.

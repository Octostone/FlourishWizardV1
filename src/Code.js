// Main entry points and core functionality

// Version History Comment Block
// v0.1.0 - Initial server-side implementation
// Future versions will be added here, keeping last 5 versions

// Global configuration
const CONFIG = {
  TEMPLATE_FILE_ID: '1vaW7egSNhsLoWVvG2VpqnUwdd_shiZ6fq0kpaj3vNbk', // Template spreadsheet ID
  ADMIN_PASSWORD: 'flourish2024', // This should be stored more securely in production
  ACCOUNT_MANAGERS: ['John Doe', 'Jane Smith'], // This will be managed through admin interface
  GEOS: ['US', 'CA', 'AU', 'UK'],
  FIELD_RESTRICTIONS_ENABLED: true,
  SHEET_NAMES: {
    CONFIG: 'Config',
    CLIENT_BASICS: 'Client Basics',
    CLIENT_DETAILS: 'Client Details',
    APP_DETAILS: 'App Details',
    EVENTS: 'Events',
    CAMPAIGN: 'Campaign',
    OFFERS: 'Offers',
    IMAGES: 'Images'
  }
};

// Logging utility
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data));
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Flourish Wizard')
    .addItem('Start Wizard', 'openWebApp')
    .addToUi();
}

function openWebApp() {
  // Get the web app URL
  const webAppUrl = ScriptApp.getService().getUrl();
  
  // Open the URL in a new window/tab
  const html = HtmlService.createHtmlOutput(
    '<script>window.open("' + webAppUrl + '", "_blank");</script>'
  )
  .setWidth(1)
  .setHeight(1);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Opening Flourish Wizard...');
}

// Main web app entry point
function doGet(e) {
  log('Web app accessed', e.parameter);
  
  // Create the landing page template
  const template = HtmlService.createTemplateFromFile('Landing');
  
  // Check if this is a new session
  const userProps = PropertiesService.getUserProperties();
  const state = userProps.getProperty('wizardState');
  
  if (state) {
    const stateData = JSON.parse(state);
    if (!stateData.isNewSession) {
      // Clear previous session data on fresh load
      userProps.deleteProperty('wizardState');
      template.data = null;
    } else {
      template.data = stateData;
    }
  } else {
    template.data = null;
  }
  
  return template
    .evaluate()
    .setTitle('Flourish Wizard')
    .setFaviconUrl('https://www.google.com/favicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Data management functions
function getAccountManagers() {
  try {
    log('Fetching account managers from CONFIG:', CONFIG.ACCOUNT_MANAGERS);
    return CONFIG.ACCOUNT_MANAGERS;
  } catch (error) {
    log('Error fetching account managers:', error);
    return ['Error loading account managers'];
  }
}

function getGeos() {
  log('Fetching Geos');
  return CONFIG.GEOS;
}

function getFieldRestrictions() {
  log('Fetching field restrictions status');
  return CONFIG.FIELD_RESTRICTIONS_ENABLED;
}

// Template management functions
function createTemplateFromMaster(outputName, folderId) {
  try {
    // Get the template file
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_FILE_ID);
    if (!templateFile) {
      throw new Error('Template file not found');
    }

    // Get the destination folder
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw new Error('Invalid folder ID or insufficient permissions');
    }

    // Create a copy of the template
    const newFile = templateFile.makeCopy(outputName, folder);
    const spreadsheet = SpreadsheetApp.open(newFile);
    
    // Clear any existing data in the sheets (except headers)
    const sheets = spreadsheet.getSheets();
    sheets.forEach(sheet => {
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow > 1) { // Preserve header row
        sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      }
    });

    return {
      fileId: newFile.getId(),
      url: newFile.getUrl()
    };
  } catch (error) {
    log('Error creating template copy:', error);
    throw error;
  }
}

function processLandingPage(formData) {
  try {
    log('Processing landing page data:', formData);
    
    // Validate inputs
    const errors = validateLandingData(formData);
    if (Object.keys(errors).length > 0) {
      log('Validation errors:', errors);
      return {
        success: false,
        errors: errors
      };
    }

    // Extract folder ID from URL
    const folderId = extractFolderIdFromUrl(formData.driveFolder);
    if (!folderId) {
      return {
        success: false,
        errors: {
          driveFolder: 'Invalid folder URL. Please provide a valid Google Drive folder URL.'
        }
      };
    }

    // Create a copy of the template
    const templateCopy = createTemplateFromMaster(formData.outputName, folderId);

    // Store the initial state with template information
    const state = {
      currentPage: 'ClientBasics',
      accountManager: formData.accountManager,
      outputName: formData.outputName,
      folderUrl: formData.driveFolder,
      templateFileId: templateCopy.fileId,
      templateUrl: templateCopy.url,
      isNewSession: true, // Mark this as an active session
      timestamp: new Date().toISOString()
    };

    log('Setting state for ClientBasics:', state);
    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(state));

    // Create and return the next page
    const template = HtmlService.createTemplateFromFile('ClientBasics');
    template.data = state;
    const content = template.evaluate().getContent();
    log('Returning ClientBasics content with state');
    
    return {
      success: true,
      content: content
    };
  } catch (error) {
    log('Error in processLandingPage:', error);
    return {
      success: false,
      errors: {
        general: error.message || 'An unexpected error occurred. Please try again.'
      }
    };
  }
}

function extractFolderIdFromUrl(url) {
  try {
    // Handle both folder URLs and direct IDs
    if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      return url; // Direct ID provided
    }
    
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch (error) {
    log('Error extracting folder ID:', error);
    return null;
  }
}

function validateLandingData(data) {
  const errors = {};
  
  if (!data.accountManager) {
    errors.accountManager = 'Please select an account manager';
  }
  
  if (!data.outputName) {
    errors.outputName = 'Please enter an output file name';
  } else if (!/^[a-zA-Z0-9-_\s]+$/.test(data.outputName)) {
    errors.outputName = 'File name contains invalid characters';
  }
  
  if (!data.driveFolder) {
    errors.driveFolder = 'Please specify a Drive folder';
  }
  
  return errors;
}

function processClientBasics(data) {
  try {
    log('Processing client basics data:', data);
    
    // Get existing state
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    
    // Update state with new data while preserving existing data
    const updatedState = {
      ...state,
      currentPage: 'ClientDetails',
      clientBasics: {
        commonName: data.commonName,
        billingName: data.billingName,
        accountManager: data.accountManager
      }
    };
    
    // Store updated state
    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(updatedState));
    
    // Create and return the next page
    const template = HtmlService.createTemplateFromFile('ClientDetails');
    template.data = updatedState;
    template.getScriptUrl = getScriptUrl;
    return {
      success: true,
      content: template.evaluate().getContent()
    };
  } catch (error) {
    log('Error in processClientBasics:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

function validateClientBasics(data) {
  const errors = {};
  
  if (!data.clientName) {
    errors.clientName = 'Please enter the client name';
  }
  
  if (!data.clientId) {
    errors.clientId = 'Please enter the client ID';
  } else if (!/^[a-zA-Z0-9-_]+$/.test(data.clientId)) {
    errors.clientId = 'Client ID contains invalid characters';
  }
  
  if (!data.geo) {
    errors.geo = 'Please select a geo';
  } else if (!['US', 'CA', 'AU', 'UK'].includes(data.geo)) {
    errors.geo = 'Invalid geo selected';
  }
  
  return errors;
}

function getSavedClientBasics() {
  try {
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    return state.clientBasics || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function navigateBack(currentPage) {
  const pageMap = {
    'ClientBasics': '?page=Landing',
    'ClientDetails': '?page=ClientBasics',
    'AppDetails': '?page=ClientDetails',
    'Events': '?page=AppDetails',
    'Campaign': '?page=Events',
    'Offers': '?page=Campaign',
    'Images': '?page=Offers'
  };
  
  return ScriptApp.getService().getUrl() + (pageMap[currentPage] || '');
}

// Helper function to include HTML files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Helper function to check if user is authenticated
function checkAuth() {
  const userEmail = PropertiesService.getUserProperties().getProperty('userEmail');
  return {
    isAuthenticated: Boolean(userEmail),
    userEmail: userEmail
  };
}

function clearAllCaches() {
  try {
    // Clear all user properties
    PropertiesService.getUserProperties().deleteAllProperties();
    
    // Clear all script properties
    PropertiesService.getScriptProperties().deleteAllProperties();
    
    // Clear all cache if using cache service
    CacheService.getUserCache().removeAll();
    CacheService.getScriptCache().removeAll();
    
    return {
      success: true,
      message: 'All caches cleared successfully'
    };
  } catch (error) {
    console.error('Error clearing caches:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function processClientDetails(formData) {
  try {
    console.log('Processing client details data:', formData);
    
    // Validate inputs
    const errors = validateClientDetails(formData);
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      return {
        success: false,
        errors: errors
      };
    }

    // Get existing state
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    
    // Update state with new data
    state.currentPage = 'AppDetails';
    state.clientDetails = formData;
    
    // Store updated state
    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(state));
    console.log('Updated state stored:', state);

    // Return the URL for the next page
    const nextUrl = ScriptApp.getService().getUrl() + '?page=AppDetails';
    console.log('Next URL:', nextUrl);
    
    return {
      success: true,
      nextUrl: nextUrl
    };
  } catch (error) {
    console.error('Error in processClientDetails:', error);
    return {
      success: false,
      errors: {
        general: error.message || 'An unexpected error occurred. Please try again.'
      }
    };
  }
}

function validateClientDetails(data) {
  const errors = {};
  
  if (!data.clientUrl) {
    errors.clientUrl = 'Please enter the client URL';
  } else {
    try {
      new URL(data.clientUrl);
    } catch (e) {
      errors.clientUrl = 'Please enter a valid URL';
    }
  }
  
  if (!data.clientDescription) {
    errors.clientDescription = 'Please enter a client description';
  } else if (data.clientDescription.length < 10) {
    errors.clientDescription = 'Description should be at least 10 characters long';
  }
  
  if (!data.clientContact) {
    errors.clientContact = 'Please enter a primary contact name';
  }
  
  if (!data.contactEmail) {
    errors.contactEmail = 'Please enter a contact email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }
  
  return errors;
}

function getSavedClientDetails() {
  try {
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    return state.clientDetails || null;
  } catch (error) {
    console.error('Error getting saved client details:', error);
    return null;
  }
}

// Navigate to different sections
function navigateToSection(section, data) {
  try {
    log('Navigating to section', { section, data });
    
    // Validate required fields
    if (!data.accountManager || !data.outputName || !data.folderUrl) {
      return {
        success: false,
        error: 'Please fill in all required fields'
      };
    }

    // Store the initial data in user properties
    const state = {
      currentPage: section,
      accountManager: data.accountManager,
      outputName: data.outputName,
      folderUrl: data.folderUrl,
      timestamp: new Date().toISOString()
    };

    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(state));
    
    // Return the appropriate page template based on section
    let template;
    switch (section) {
      case 'newClient':
        template = HtmlService.createTemplateFromFile('ClientBasics');
        template.data = state;
        template.getScriptUrl = getScriptUrl;
        return template
          .evaluate()
          .getContent();
      case 'newApp':
        template = HtmlService.createTemplateFromFile('AppDetails');
        template.data = state;
        template.getScriptUrl = getScriptUrl;
        return template
          .evaluate()
          .getContent();
      case 'newCampaign':
        template = HtmlService.createTemplateFromFile('Campaign');
        template.data = state;
        template.getScriptUrl = getScriptUrl;
        return template
          .evaluate()
          .getContent();
      case 'newOffers':
        template = HtmlService.createTemplateFromFile('Offers');
        template.data = state;
        template.getScriptUrl = getScriptUrl;
        return template
          .evaluate()
          .getContent();
      case 'updateImages':
        template = HtmlService.createTemplateFromFile('Images');
        template.data = state;
        template.getScriptUrl = getScriptUrl;
        return template
          .evaluate()
          .getContent();
      default:
        throw new Error('Invalid section');
    }
  } catch (error) {
    log('Error in navigateToSection', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Show admin login
function showAdminLogin() {
  log('Showing admin login');
  return HtmlService.createTemplateFromFile('AdminLogin')
    .evaluate()
    .getContent();
}

// Get admin page
function getAdminPage() {
  log('Getting admin page');
  return HtmlService.createTemplateFromFile('Admin')
    .evaluate()
    .getContent();
}

// Validate admin password
function validateAdminPassword(password) {
  log('Validating admin password');
  return password === CONFIG.ADMIN_PASSWORD;
}

// Toggle field restrictions
function toggleFieldRestrictions(enabled) {
  log('Toggling field restrictions', { enabled });
  CONFIG.FIELD_RESTRICTIONS_ENABLED = enabled;
  return CONFIG.FIELD_RESTRICTIONS_ENABLED;
}

// Update account managers list
function updateAccountManagers(managers) {
  log('Updating account managers', { managers });
  CONFIG.ACCOUNT_MANAGERS = managers;
  return CONFIG.ACCOUNT_MANAGERS;
}

// Update Geos list
function updateGeos(geos) {
  log('Updating Geos', { geos });
  CONFIG.GEOS = geos;
  return CONFIG.GEOS;
}

// Add account manager
function addAccountManager(name) {
  log('Adding account manager', { name });
  if (!CONFIG.ACCOUNT_MANAGERS.includes(name)) {
    CONFIG.ACCOUNT_MANAGERS.push(name);
    CONFIG.ACCOUNT_MANAGERS.sort();
  }
  return CONFIG.ACCOUNT_MANAGERS;
}

// Remove account manager
function removeAccountManager(name) {
  log('Removing account manager', { name });
  CONFIG.ACCOUNT_MANAGERS = CONFIG.ACCOUNT_MANAGERS.filter(m => m !== name);
  return CONFIG.ACCOUNT_MANAGERS;
}

// Add Geo
function addGeo(geo) {
  log('Adding Geo', { geo });
  if (!CONFIG.GEOS.includes(geo)) {
    CONFIG.GEOS.push(geo);
    CONFIG.GEOS.sort();
  }
  return CONFIG.GEOS;
}

// Remove Geo
function removeGeo(geo) {
  log('Removing Geo', { geo });
  CONFIG.GEOS = CONFIG.GEOS.filter(g => g !== geo);
  return CONFIG.GEOS;
}

// Helper function to get script URL
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function processAppDetails(data) {
  try {
    log('Processing app details data:', data);
    
    // Validate inputs
    const errors = validateAppDetails(data);
    if (Object.keys(errors).length > 0) {
      log('Validation errors:', errors);
      return {
        success: false,
        errors: errors
      };
    }

    // Get existing state
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    
    // Update state with new data
    state.currentPage = 'Events';
    state.appDetails = data;
    
    // Store updated state
    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(state));
    log('Updated state stored:', state);

    // Create and return the next page
    const template = HtmlService.createTemplateFromFile('Events');
    template.data = state;
    template.getScriptUrl = getScriptUrl;
    return {
      success: true,
      content: template.evaluate().getContent()
    };
  } catch (error) {
    log('Error in processAppDetails:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

function validateAppDetails(data) {
  const errors = {};
  
  if (!data.appName) {
    errors.appName = 'Please enter the app name';
  }
  
  if (!data.appId) {
    errors.appId = 'Please enter the app ID';
  }
  
  if (!data.appCategory) {
    errors.appCategory = 'Please select an app category';
  }
  
  if (!data.appDescription) {
    errors.appDescription = 'Please enter an app description';
  } else if (data.appDescription.length < 10) {
    errors.appDescription = 'Description should be at least 10 characters long';
  }
  
  return errors;
}

function getSavedAppDetails() {
  try {
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    return state.appDetails || null;
  } catch (error) {
    log('Error getting saved app details:', error);
    return null;
  }
}

function processEvents(data) {
  try {
    log('Processing events data:', data);
    
    // Validate inputs
    const errors = validateEvents(data);
    if (Object.keys(errors).length > 0) {
      log('Validation errors:', errors);
      return {
        success: false,
        errors: errors
      };
    }

    // Get existing state
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    
    // Update state with new data
    state.currentPage = 'Campaign';
    state.events = data.events;
    
    // Store updated state
    PropertiesService.getUserProperties().setProperty('wizardState', JSON.stringify(state));
    log('Updated state stored:', state);

    // Create and return the next page
    const template = HtmlService.createTemplateFromFile('Campaign');
    template.data = state;
    template.getScriptUrl = getScriptUrl;
    return {
      success: true,
      content: template.evaluate().getContent()
    };
  } catch (error) {
    log('Error in processEvents:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

function validateEvents(data) {
  const errors = {};
  
  if (!Array.isArray(data.events) || data.events.length === 0) {
    errors.events = 'At least one event is required';
    return errors;
  }
  
  data.events.forEach((event, index) => {
    if (!event.name) {
      errors[`eventName_${index}`] = 'Please enter event name';
    }
    
    if (!event.type) {
      errors[`eventType_${index}`] = 'Please select event type';
    }
    
    if (!event.value || isNaN(event.value)) {
      errors[`eventValue_${index}`] = 'Please enter a valid numeric value';
    }
  });
  
  return errors;
}

function getSavedEvents() {
  try {
    const state = JSON.parse(PropertiesService.getUserProperties().getProperty('wizardState') || '{}');
    return state.events || null;
  } catch (error) {
    log('Error getting saved events:', error);
    return null;
  }
}

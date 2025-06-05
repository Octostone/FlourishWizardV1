// Google Sheets API configuration
const SPREADSHEET_ID = '1c17SelQ1ynty7o5xxxfOYK1P92VyeGoKyeuyZAoC8Om6R2k2exfG0JG9';
const SHEET_NAMES = {
  CLIENT_INFO: 'ClientInfo',
  CLIENT_DETAILS: 'ClientDetails',
  APP: 'App',
  EVENTS: 'Events',
  CAMPAIGN: 'Campaign',
  OFFERS: 'Offers',
  IMAGES: 'Images'
};

// Function to initialize Google Sheets API
export const initGoogleSheets = async () => {
  try {
    // Load the Google Sheets API
    await window.gapi.client.load('sheets', 'v4');
    return true;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    return false;
  }
};

// Function to write data to a specific sheet
export const writeToSheet = async (sheetName, data) => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [data]
      }
    });
    return response;
  } catch (error) {
    console.error(`Error writing to ${sheetName}:`, error);
    throw error;
  }
};

// Function to read data from a specific sheet
export const readFromSheet = async (sheetName) => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`
    });
    return response.result.values;
  } catch (error) {
    console.error(`Error reading from ${sheetName}:`, error);
    throw error;
  }
};

// Function to update specific cells in a sheet
export const updateSheetCells = async (sheetName, range, values) => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      }
    });
    return response;
  } catch (error) {
    console.error(`Error updating cells in ${sheetName}:`, error);
    throw error;
  }
};

// Function to get dropdown options from specific sheets
export const getDropdownOptions = async (sheetName) => {
  try {
    const values = await readFromSheet(sheetName);
    if (!values || values.length === 0) return [];
    
    // Assuming the first column contains the options
    return values.map(row => row[0]).filter(Boolean);
  } catch (error) {
    console.error(`Error getting dropdown options from ${sheetName}:`, error);
    return [];
  }
};

export { SHEET_NAMES }; 
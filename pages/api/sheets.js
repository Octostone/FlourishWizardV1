import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { sheetId, tabName, rowData, rowIndex } = req.body;
  if (!sheetId || !tabName || !rowData || !Array.isArray(rowData)) {
    return res.status(400).json({ error: 'Missing required fields: sheetId, tabName, rowData[]' });
  }
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    let response;
    let writtenRowIndex = null;
    if (typeof rowIndex === 'number') {
      // Update a specific row (overwrite)
      const range = `${tabName}!A${rowIndex + 1}`;
      response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] }
      });
      writtenRowIndex = rowIndex;
    } else {
      // Append a new row
      response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] }
      });
      // Extract row index from response (e.g., 'ClientInfo!A2')
      if (response.data && response.data.updates && response.data.updates.updatedRange) {
        const match = response.data.updates.updatedRange.match(/!(?:[A-Z]+)(\d+)/);
        if (match) writtenRowIndex = Number(match[1]) - 1;
      }
    }
    return res.status(200).json({ success: true, result: response.data, rowIndex: writtenRowIndex });
  } catch (error) {
    console.error('Google Sheets API error:', error, error.stack);
    return res.status(500).json({ error: error.message || 'Google Sheets API error', stack: error.stack });
  }
} 
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { sheetId, tabName, rowData, rowIndex, rows } = req.body;
  if (!sheetId || !tabName || (!rowData && !rows)) {
    return res.status(400).json({ error: 'Missing required fields: sheetId, tabName, rowData[] or rows[]' });
  }
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    let response;
    let writtenRowIndex = null;

    if (Array.isArray(rows)) {
      // Multi-row overwrite: clear all rows except header, then write new rows
      // 1. Get the number of rows in the sheet
      const getResp = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!A:Z`
      });
      const numRows = getResp.data.values ? getResp.data.values.length : 0;
      if (numRows > 1) {
        // 2. Clear all rows except header
        await sheets.spreadsheets.values.clear({
          spreadsheetId: sheetId,
          range: `${tabName}!A2:Z${numRows}`
        });
      }
      // 3. Write new rows (starting at row 2)
      response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tabName}!A2`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: rows }
      });
      return res.status(200).json({ success: true, result: response.data });
    }

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
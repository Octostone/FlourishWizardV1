import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { outputName, folderId } = req.body;
  if (!outputName || !folderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    // Template ID (hardcoded for now)
    const TEMPLATE_ID = '1vaW7egSNhsLoWVvG2VpqnUwdd_shiZ6fq0kpaj3vNbk';

    // Copy the template
    const copyResponse = await drive.files.copy({
      fileId: TEMPLATE_ID,
      requestBody: {
        name: outputName,
        parents: [folderId]
      }
    });

    const newSheetId = copyResponse.data.id;
    return res.status(200).json({ sheetId: newSheetId });
  } catch (error) {
    console.error('Google Drive API error:', error);
    return res.status(500).json({ error: error.message || 'Google Drive API error' });
  }
} 
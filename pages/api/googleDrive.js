import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        console.error('Invalid JSON received:', body);
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

async function handleTemplateCopy(req, res) {
  const { outputName, folderId } = req.body;
  console.log('handleTemplateCopy called with:', req.body);
  if (!outputName || !folderId) {
    console.error('Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields', details: req.body });
  }
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });
    const TEMPLATE_ID = '1vaW7egSNhsLoWVvG2VpqnUwdd_shiZ6fq0kpaj3vNbk';
    console.log('About to call drive.files.copy');
    // const copyResponse = await Promise.race([
    //   drive.files.copy({
    //     fileId: TEMPLATE_ID,
    //     requestBody: {
    //       name: outputName,
    //       parents: [folderId]
    //     }
    //   }),
    //   new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 30000)) // 30 second timeout
    // ]);
    // console.log('Finished drive.files.copy');
    // const newSheetId = copyResponse.data.id;
    // console.log('Template copied, newSheetId:', newSheetId);
    // Dummy response for testing
    const copyResponse = { data: { id: 'dummy-id' } };
    console.log('Dummy response used, id:', copyResponse.data.id);
    res.status(200).json({ sheetId: copyResponse.data.id });
  } catch (error) {
    console.error('Google Drive API error:', error, error.stack);
    res.status(500).json({ error: error.message || 'Google Drive API error', stack: error.stack });
  }
}

async function handleFileUpload(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'File upload error' });
    }
    const { folderId } = fields;
    const file = files.file;
    if (!folderId || !file) {
      console.error('Missing folderId or file:', fields, files);
      return res.status(400).json({ error: 'Missing folderId or file', details: { fields, files } });
    }
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/drive']
      });
      const drive = google.drive({ version: 'v3', auth });
      const fileMetadata = {
        name: file.originalFilename,
        parents: [folderId]
      };
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath)
      };
      const uploadResponse = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, webViewLink, thumbnailLink'
      });
      res.status(200).json(uploadResponse.data);
    } catch (error) {
      console.error('Google Drive upload error:', error, error.stack);
      res.status(500).json({ error: error.message || 'Google Drive upload error', stack: error.stack });
    }
  });
}

async function handleDelete(req, res) {
  const { fileId } = req.body;
  if (!fileId) {
    console.error('Missing fileId:', req.body);
    return res.status(400).json({ error: 'Missing fileId', details: req.body });
  }
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.delete({ fileId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Google Drive delete error:', error, error.stack);
    res.status(500).json({ error: error.message || 'Google Drive delete error', stack: error.stack });
  }
}

export default async function handler(req, res) {
  console.log('API route hit');
  try {
    console.log('API route called:', req.method, req.url);
    if (req.method === 'GET' && req.query.test === '1') {
      console.log('Test endpoint hit');
      return res.status(200).json({ ok: true, message: 'API route is working' });
    }
    if (req.method === 'POST') {
      console.log('POST request received');
      // Handle file upload (multipart/form-data)
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        console.log('Handling file upload');
        return await handleFileUpload(req, res);
      }
      // Parse JSON body manually
      let body;
      try {
        body = await parseJsonBody(req);
        console.log('Parsed JSON body:', body);
      } catch (e) {
        console.error('Invalid JSON error:', e);
        return res.status(400).json({ error: 'Invalid JSON', details: e.message });
      }
      if (!body || typeof body !== 'object') {
        console.error('Missing or invalid request body:', body);
        return res.status(400).json({ error: 'Missing or invalid request body', details: body });
      }
      req.body = body;
      // TEST RESPONSE after parsing
      console.log('Test response after parsing body');
      if (body.test === '1') {
        return res.status(200).json({ test: 'API route is working after parsing' });
      }
      if (body.action === 'delete') {
        console.log('Handling delete action');
        return await handleDelete(req, res);
      }
      // Default: template copy
      console.log('Handling template copy');
      return await handleTemplateCopy(req, res);
    } else {
      console.error('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API route error:', error, error.stack);
    try {
      return res.status(500).json({ error: error.message || 'Unexpected API error', stack: error.stack });
    } catch {
      // If res.status().json() fails, send a plain JSON string
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Unexpected API error' }));
    }
  }
} 
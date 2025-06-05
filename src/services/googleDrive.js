import { google } from 'googleapis';

// Initialize Google Drive API
const initGoogleDrive = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  return google.drive({ version: 'v3', auth });
};

// Create a folder in Google Drive
export const createFolder = async (folderName, parentFolderId) => {
  try {
    const drive = await initGoogleDrive();
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });

    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Upload a file to Google Drive
export const uploadFile = async (file, folderId) => {
  if (!folderId) {
    throw new Error('Folder ID is required for file upload');
  }

  try {
    const drive = await initGoogleDrive();
    const fileMetadata = {
      name: file.name,
      parents: [folderId]
    };

    const media = {
      mimeType: file.type,
      body: file
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (fileId) => {
  try {
    const drive = await initGoogleDrive();
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, webViewLink, thumbnailLink'
    });

    return response.data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

// Delete a file from Google Drive
export const deleteFile = async (fileId) => {
  try {
    const drive = await initGoogleDrive();
    await drive.files.delete({
      fileId: fileId
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Copy template to user's folder
export const copyTemplate = async (templateId, folderId, newName) => {
  try {
    const drive = await initGoogleDrive();
    const response = await drive.files.copy({
      fileId: templateId,
      resource: {
        name: newName,
        parents: [folderId]
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error copying template:', error);
    throw error;
  }
}; 
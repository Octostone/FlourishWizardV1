// Google Drive API configuration
const FOLDER_ID = 'YOUR_FOLDER_ID'; // Replace with your Google Drive folder ID

// Function to initialize Google Drive API
export const initGoogleDrive = async () => {
  try {
    // Load the Google Drive API
    await window.gapi.client.load('drive', 'v3');
    return true;
  } catch (error) {
    console.error('Error initializing Google Drive:', error);
    return false;
  }
};

// Function to create a folder in Google Drive
export const createFolder = async (folderName) => {
  try {
    const response = await window.gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [FOLDER_ID]
      },
      fields: 'id'
    });
    return response.result.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Function to upload a file to Google Drive
export const uploadFile = async (file, folderId) => {
  try {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${window.gapi.auth.getToken().access_token}`
      },
      body: form
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to get file metadata
export const getFileMetadata = async (fileId) => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id, name, webViewLink, thumbnailLink'
    });
    return response.result;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

// Function to delete a file from Google Drive
export const deleteFile = async (fileId) => {
  try {
    await window.gapi.client.drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 
import { useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useWizard } from '../../context/WizardContext';
import { uploadFile, deleteFile, getFileMetadata } from '../../services/googleDrive';

export default function Images() {
  const { formData, addImage, removeImage } = useWizard();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!formData.folderId) {
      setError('No folder selected. Please go back to the first step and select a folder.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to Google Drive
        const uploadResult = await uploadFile(file, formData.folderId);
        
        // Get file metadata
        const metadata = await getFileMetadata(uploadResult.id);
        
        // Add image to state
        addImage({
          id: metadata.id,
          name: metadata.name,
          url: metadata.thumbnailLink || metadata.webViewLink,
          driveUrl: metadata.webViewLink
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index, imageId) => {
    try {
      await deleteFile(imageId);
      removeImage(index);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete image. Please try again.');
    }
  };

  if (!formData.folderId) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="warning">
            Please go back to the first step and select a Google Drive folder before uploading images.
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center'
            }}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="image-upload"
              disabled={uploading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </Button>
            </label>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Drag and drop images here or click to select files
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Uploaded Images
        </Typography>
        <Grid container spacing={2}>
          {formData.images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" noWrap>
                    {image.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      href={image.driveUrl}
                      target="_blank"
                      aria-label="view in drive"
                    >
                      <CloudUploadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(index, image.id)}
                      aria-label="delete image"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
} 
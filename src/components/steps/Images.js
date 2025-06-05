import { useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  IconButton,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useWizard } from '../../context/WizardContext';

export default function Images() {
  const { formData, addImage, removeImage } = useWizard();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Here you would typically upload to Google Drive
        // For now, we'll just add the file info to our state
        addImage({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

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
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
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
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeImage(index)}
                    aria-label="delete image"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
} 
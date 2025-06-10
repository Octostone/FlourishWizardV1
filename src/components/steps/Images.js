import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText
} from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const geoOptions = ['US', 'CA', 'UK', 'AU', 'Other'];

export default function Images() {
  const { 
    formData, 
    updateFormData, 
    activeStep, 
    setActiveStep,
    getSharedField,
    updateSharedField 
  } = useWizard();
  
  const [fields, setFields] = useState({
    flourishClientName: getSharedField('flourishClientName'),
    geo: getSharedField('geo'),
    iconImage: null,
    carouselImage: null,
    iconImageUrl: '',
    carouselImageUrl: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const iconInputRef = useRef();
  const carouselInputRef = useRef();

  // Initialize fields from context
  useEffect(() => {
    setFields(prev => ({
      ...prev,
      flourishClientName: getSharedField('flourishClientName'),
      geo: getSharedField('geo'),
      iconImageUrl: formData.iconImageUrl || '',
      carouselImageUrl: formData.carouselImageUrl || ''
    }));
  }, [getSharedField, formData.iconImageUrl, formData.carouselImageUrl]);

  // On unmount, persist to context
  useEffect(() => {
    return () => {
      updateFormData('images', {
        iconImageUrl: fields.iconImageUrl,
        carouselImageUrl: fields.carouselImageUrl
      });
      updateSharedField('geo', fields.geo);
    };
  }, [fields, updateFormData, updateSharedField]);

  const validate = () => {
    let valid = true;
    let newErrors = {};
    
    if (!fields.flourishClientName) {
      newErrors.flourishClientName = 'Required';
      valid = false;
    }
    if (!fields.geo) {
      newErrors.geo = 'Required';
      valid = false;
    }
    if (!fields.iconImage && !fields.iconImageUrl) {
      newErrors.iconImage = 'Icon image is required';
      valid = false;
    }
    if (!fields.carouselImage && !fields.carouselImageUrl) {
      newErrors.carouselImage = 'Carousel image is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (type) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: 'Only JPEG or PNG allowed' }));
      return;
    }
    if (file.size > 100 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File must be < 100kB' }));
      return;
    }
    
    setErrors(prev => ({ ...prev, [type]: undefined }));
    handleChange(type, file);
    
    // For preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange(`${type}Url`, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: Upload images to backend or Google Drive if needed
      updateFormData('images', {
        iconImageUrl: fields.iconImageUrl,
        carouselImageUrl: fields.carouselImageUrl
      });
      updateSharedField('geo', fields.geo);
      setActiveStep(activeStep + 1);
    } catch (err) {
      setErrors({ general: err.message || 'Failed to upload images.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    updateFormData('images', {
      iconImageUrl: fields.iconImageUrl,
      carouselImageUrl: fields.carouselImageUrl
    });
    updateSharedField('geo', fields.geo);
    setActiveStep(activeStep - 1);
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        Images
      </Typography>
      <Box sx={{ width: '66%', mx: 'auto', mt: 3 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Flourish Client Name"
            value={fields.flourishClientName}
            onChange={e => handleChange('flourishClientName', e.target.value)}
            error={!!errors.flourishClientName}
            helperText={errors.flourishClientName}
            required
            fullWidth
          />
          <FormControl fullWidth error={!!errors.geo}>
            <InputLabel>Geo</InputLabel>
            <Select
              value={fields.geo}
              label="Geo"
              onChange={e => handleChange('geo', e.target.value)}
              required
            >
              {geoOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {errors.geo && <FormHelperText>{errors.geo}</FormHelperText>}
          </FormControl>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Icon Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
            >
              Upload Icon Image (JPEG/PNG, &lt;100kB)
              <input
                type="file"
                accept="image/jpeg,image/png"
                hidden
                ref={iconInputRef}
                onChange={handleFileChange('iconImage')}
              />
            </Button>
            {fields.iconImageUrl && (
              <Box mt={1}>
                <img
                  src={fields.iconImageUrl}
                  alt="Icon Preview"
                  style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: '1px solid #ccc' }}
                />
              </Box>
            )}
            {errors.iconImage && (
              <Typography color="error" variant="body2">{errors.iconImage}</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Carousel Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
            >
              Upload Carousel Image (JPEG/PNG, &lt;100kB)
              <input
                type="file"
                accept="image/jpeg,image/png"
                hidden
                ref={carouselInputRef}
                onChange={handleFileChange('carouselImage')}
              />
            </Button>
            {fields.carouselImageUrl && (
              <Box mt={1}>
                <img
                  src={fields.carouselImageUrl}
                  alt="Carousel Preview"
                  style={{ maxWidth: 200, maxHeight: 100, borderRadius: 8, border: '1px solid #ccc' }}
                />
              </Box>
            )}
            {errors.carouselImage && (
              <Typography color="error" variant="body2">{errors.carouselImage}</Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="center" gap={3} mt={5}>
          <Button variant="outlined" onClick={handleBack} sx={{ px: 4, py: 1 }}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext} sx={{ px: 4, py: 1 }} disabled={loading}>
            Next
          </Button>
        </Box>
      </Box>
    </form>
  );
} 
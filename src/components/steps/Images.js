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
  const { formData, updateFormData, activeStep, setActiveStep } = useWizard();
  const [fields, setFields] = useState({
    flourishClientName: '',
    appName: '',
    geo: '',
    icon: null,
    iconUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Inherit Flourish Client Name from context if available
  useEffect(() => {
    setFields(prev => ({
      ...prev,
      flourishClientName: formData.clientBasics?.flourishClientName || '',
      appName: formData.appInformation?.appName || '',
      geo: formData.images?.geo || '',
      iconUrl: formData.images?.iconUrl || ''
    }));
  }, [formData.clientBasics, formData.appInformation, formData.images]);

  // On unmount, persist to context
  useEffect(() => {
    return () => {
      updateFormData('images', fields);
    };
  }, [fields, updateFormData]);

  const validate = () => {
    let valid = true;
    let newErrors = {};
    if (!fields.flourishClientName) {
      newErrors.flourishClientName = 'Required';
      valid = false;
    }
    if (!fields.appName) {
      newErrors.appName = 'Required';
      valid = false;
    }
    if (!fields.geo) {
      newErrors.geo = 'Required';
      valid = false;
    }
    if (!fields.icon && !fields.iconUrl) {
      newErrors.icon = 'Icon is required';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors(prev => ({ ...prev, icon: 'Only JPEG or PNG allowed' }));
      return;
    }
    if (file.size > 100 * 1024) {
      setErrors(prev => ({ ...prev, icon: 'File must be < 100kB' }));
      return;
    }
    setErrors(prev => ({ ...prev, icon: undefined }));
    handleChange('icon', file);
    // For preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange('iconUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: Upload icon to backend or Google Drive if needed
      updateFormData('images', fields);
      setActiveStep(activeStep + 1);
    } catch (err) {
      setErrors({ icon: err.message || 'Failed to upload icon.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    updateFormData('images', fields);
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
          <TextField
            label="App Name"
            value={fields.appName}
            onChange={e => handleChange('appName', e.target.value)}
            error={!!errors.appName}
            helperText={errors.appName}
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
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
            >
              Upload Icon (JPEG/PNG, &lt;100kB)
              <input
                type="file"
                accept="image/jpeg,image/png"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Button>
            {fields.iconUrl && (
              <Box mt={1}>
                <img
                  src={fields.iconUrl}
                  alt="Icon Preview"
                  style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: '1px solid #ccc' }}
                />
              </Box>
            )}
            {errors.icon && (
              <Typography color="error" variant="body2">{errors.icon}</Typography>
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
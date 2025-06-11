import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const osOptions = ['Android', 'iOS'];
const category1Options = ['Cat', 'Dog', 'Bird'];
const category2Options = ['Cat', 'Dog', 'Bird'];
const category3Options = ['Cat', 'Dog', 'Bird'];

const initialState = {
  clientName: '',
  appName: '',
  os: '',
  storeUrl: '',
  reAttributionDays: '',
  category1: '',
  category2: '',
  category3: ''
};

export default function AppInformation() {
  const { formData, updateFormData, activeStep, setActiveStep, appInfoRowIndex, setAppInfoRowIndex } = useWizard();
  const [fields, setFields] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-populate fields from shared context
  useEffect(() => {
    setFields(prev => ({
      ...prev,
      flourishClientName: formData.flourishClientName || '',
      appName: formData.appName || ''
    }));
  }, [formData.flourishClientName, formData.appName]);

  // Validation logic
  const validate = () => {
    const newErrors = {};
    // Client Name
    if (!fields.clientName) {
      newErrors.clientName = 'Required';
    } else if (!fields.clientName.endsWith('_flourish') || /[A-Z]/.test(fields.clientName)) {
      newErrors.clientName = 'Must end with _flourish and contain no capital letters';
    }
    // App Name
    if (!fields.appName) newErrors.appName = 'Required';
    // OS
    if (!fields.os) newErrors.os = 'Required';
    // Store URL
    if (!fields.storeUrl) {
      newErrors.storeUrl = 'Required';
    } else if (!fields.storeUrl.startsWith('https://play.google.com/store/')) {
      newErrors.storeUrl = 'Please check URL';
    }
    // Re-attribution days
    if (!fields.reAttributionDays) {
      newErrors.reAttributionDays = 'Required';
    } else if (!/^\d+$/.test(fields.reAttributionDays)) {
      newErrors.reAttributionDays = 'Numbers only';
    }
    // Category 1
    if (!fields.category1) newErrors.category1 = 'Required';
    // Category 2
    if (!fields.category2) newErrors.category2 = 'Required';
    // Category 3
    if (!fields.category3) newErrors.category3 = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleChange = (field, value) => {
    if (field === 'clientName') {
      setFields((prev) => ({ ...prev, [field]: value.toLowerCase() }));
    } else if (field === 'reAttributionDays') {
      setFields((prev) => ({ ...prev, [field]: value.replace(/[^\d]/g, '') }));
    } else {
      setFields((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle Next
  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // First update the shared fields
      updateFormData('flourishClientName', fields.flourishClientName);
      updateFormData('appName', fields.appName);

      // Then write to the sheet
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'AppInfo',
          rowData: [
            fields.flourishClientName,
            fields.appName,
            fields.os,
            fields.storeUrl,
            fields.reAttributionDays,
            fields.category1,
            fields.category2,
            fields.category3
          ],
          rowIndex: appInfoRowIndex
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      
      if (appInfoRowIndex == null && typeof result.rowIndex === 'number') {
        setAppInfoRowIndex(result.rowIndex);
      }

      // Update the form data
      updateFormData('appInfo', {
        flourishClientName: fields.flourishClientName,
        appName: fields.appName,
        os: fields.os,
        storeUrl: fields.storeUrl,
        reAttributionDays: fields.reAttributionDays,
        category1: fields.category1,
        category2: fields.category2,
        category3: fields.category3
      });

      // Finally, navigate to the next step
      setActiveStep(activeStep + 1);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to write to sheet.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Back
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Box sx={{ width: '66%', mx: 'auto', mt: 4 }}>
        <Typography component="h2" variant="h5" align="center" gutterBottom>
          App Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          <TextField
            label="Which client is associated to this app?"
            value={fields.clientName}
            onChange={e => handleChange('clientName', e.target.value)}
            error={!!errors.clientName}
            helperText={errors.clientName}
            fullWidth
            sx={errors.clientName ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            label="App Name"
            value={fields.appName}
            onChange={e => handleChange('appName', e.target.value)}
            error={!!errors.appName}
            helperText={errors.appName}
            fullWidth
          />

          <TextField
            select
            label="OS"
            value={fields.os}
            onChange={e => handleChange('os', e.target.value)}
            error={!!errors.os}
            helperText={errors.os}
            fullWidth
          >
            {osOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Google Play Store or Apple App Store URL"
            value={fields.storeUrl}
            onChange={e => handleChange('storeUrl', e.target.value)}
            error={!!errors.storeUrl}
            helperText={errors.storeUrl}
            fullWidth
            sx={errors.storeUrl ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            label="Client's Attribution Window in Days"
            value={fields.reAttributionDays}
            onChange={e => handleChange('reAttributionDays', e.target.value)}
            error={!!errors.reAttributionDays}
            helperText={errors.reAttributionDays}
            fullWidth
            sx={errors.reAttributionDays ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            select
            label="Category 1"
            value={fields.category1}
            onChange={e => handleChange('category1', e.target.value)}
            error={!!errors.category1}
            helperText={errors.category1}
            fullWidth
          >
            {category1Options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category 2"
            value={fields.category2}
            onChange={e => handleChange('category2', e.target.value)}
            error={!!errors.category2}
            helperText={errors.category2}
            fullWidth
          >
            {category2Options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category 3"
            value={fields.category3}
            onChange={e => handleChange('category3', e.target.value)}
            error={!!errors.category3}
            helperText={errors.category3}
            fullWidth
          >
            {category3Options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          {errors.form && (
            <Typography color="error" align="center">{errors.form}</Typography>
          )}

          <Box display="flex" justifyContent="center" gap={3} mt={4}>
            <Button variant="outlined" onClick={handleBack} sx={{ px: 4, py: 1 }}>
              Back
            </Button>
            <Button variant="contained" onClick={handleNext} sx={{ px: 4, py: 1 }} disabled={loading}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </form>
  );
} 
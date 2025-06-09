import { useState } from 'react';
import { Grid, TextField, Button, MenuItem, Typography, Box } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const appCategories = [
  '-- Select --',
  'Games',
  'Productivity',
  'Entertainment',
  'Social',
  'Utilities',
  'Education',
  'Business',
  'Lifestyle'
];

export default function AppInformation() {
  const { formData, updateFormData, activeStep, setActiveStep } = useWizard();
  const [fields, setFields] = useState({
    appName: formData['App Name'] || '',
    appId: formData['App ID'] || '',
    appCategory: formData['App Category'] || '',
    appDescription: formData['App Description'] || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fields.appName) {
      setError('Please enter the app name.');
      return false;
    }
    if (!fields.appId) {
      setError('Please enter the app ID.');
      return false;
    }
    if (!fields.appCategory || fields.appCategory === '-- Select --') {
      setError('Please select an app category.');
      return false;
    }
    if (!fields.appDescription) {
      setError('Please enter the app description.');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Write to Google Sheet via API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'AppInfo',
          rowData: [
            fields.appName,
            fields.appId,
            fields.appCategory,
            fields.appDescription
          ]
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      updateFormData('appInfo', {
        'App Name': fields.appName,
        'App ID': fields.appId,
        'App Category': fields.appCategory,
        'App Description': fields.appDescription
      });
      setActiveStep(activeStep + 1);
    } catch (err) {
      setError(err.message || 'Failed to write to sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        App Information
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Please fill in all of the following app details.
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="App Name"
            name="appName"
            value={fields.appName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="App ID"
            name="appId"
            value={fields.appId}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="App Category"
            name="appCategory"
            value={fields.appCategory}
            onChange={handleChange}
            required
          >
            {appCategories.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="App Description"
            name="appDescription"
            value={fields.appDescription}
            onChange={handleChange}
            required
            multiline
            rows={4}
          />
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography color="error" align="center">{error}</Typography>
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={3} mt={4}>
            <Button variant="outlined" onClick={handleBack} sx={{ px: 4, py: 1 }}>
              Back
            </Button>
            <Button variant="contained" onClick={handleNext} sx={{ px: 4, py: 1 }} disabled={loading}>
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
} 
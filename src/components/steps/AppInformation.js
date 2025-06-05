import { Grid, TextField } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

export default function AppInformation() {
  const { formData, updateFormData } = useWizard();
  const { appName, appBundleId, appStoreUrl, playStoreUrl, appDescription } = formData;

  const handleChange = (field) => (event) => {
    updateFormData('appInfo', { [field]: event.target.value });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="App Name"
          value={appName}
          onChange={handleChange('appName')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="App Bundle ID"
          value={appBundleId}
          onChange={handleChange('appBundleId')}
          required
          helperText="e.g., com.company.appname"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="App Store URL"
          value={appStoreUrl}
          onChange={handleChange('appStoreUrl')}
          required
          helperText="iOS App Store URL"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Play Store URL"
          value={playStoreUrl}
          onChange={handleChange('playStoreUrl')}
          required
          helperText="Google Play Store URL"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="App Description"
          value={appDescription}
          onChange={handleChange('appDescription')}
          required
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
} 
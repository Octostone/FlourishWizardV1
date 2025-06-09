import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const geoOptions = ['US', 'CA', 'AU', 'UK'];
const pricingModelOptions = ['CPI', 'Hybrid', 'CPA'];
const carouselSpotlightOptions = ['Carousel', 'Spotlight'];

const initialState = {
  accountManager: '',
  flourishClientName: '',
  appName: '',
  geo: '',
  clientCampaignName: '',
  monthlyBudget: '',
  dailyBudget: '',
  pricingModel: '',
  carouselSpotlight: '',
  clickUrl: '',
  enableSpiral: false,
  D7: '',
  D14: '',
  D30: '',
  D60: '',
  D90: '',
  D180: ''
};

export default function Campaign() {
  const { formData, updateFormData, activeStep, setActiveStep, campaignRowIndex, setCampaignRowIndex, dropdowns } = useWizard();
  const [fields, setFields] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-populate account manager and flourish client name if available
  useEffect(() => {
    setFields((prev) => ({
      ...prev,
      accountManager: formData.accountManager || '',
      flourishClientName: formData.flourishClientName || ''
    }));
  }, [formData.accountManager, formData.flourishClientName]);

  // Validation logic
  const validate = () => {
    const newErrors = {};
    // Account Manager
    if (!fields.accountManager) newErrors.accountManager = 'Required';
    // Flourish Client Name
    if (!fields.flourishClientName) {
      newErrors.flourishClientName = 'Required';
    } else if (!fields.flourishClientName.endsWith('_flourish') || /[A-Z]/.test(fields.flourishClientName)) {
      newErrors.flourishClientName = 'Must end with _flourish and contain no capital letters';
    }
    // App Name
    if (!fields.appName) newErrors.appName = 'Required';
    // Geo
    if (!fields.geo) newErrors.geo = 'Required';
    // Client Supplied Campaign Name
    if (!fields.clientCampaignName) {
      newErrors.clientCampaignName = 'Required';
    } else if (/\s/.test(fields.clientCampaignName)) {
      newErrors.clientCampaignName = 'No spaces allowed';
    } else if (/\n/.test(fields.clientCampaignName)) {
      newErrors.clientCampaignName = 'No line breaks allowed';
    }
    // Monthly Budget
    if (!fields.monthlyBudget) {
      newErrors.monthlyBudget = 'Required';
    } else if (!/^\d{1,}$/.test(fields.monthlyBudget.replace(/,/g, ''))) {
      newErrors.monthlyBudget = 'Numbers only';
    } else if (/\./.test(fields.monthlyBudget)) {
      newErrors.monthlyBudget = 'No decimals allowed';
    }
    // Daily Budget
    if (!fields.dailyBudget) {
      newErrors.dailyBudget = 'Required';
    } else if (!/^\d{1,}$/.test(fields.dailyBudget.replace(/,/g, ''))) {
      newErrors.dailyBudget = 'Numbers only';
    } else if (/\./.test(fields.dailyBudget)) {
      newErrors.dailyBudget = 'No decimals allowed';
    }
    // Pricing Model
    if (!fields.pricingModel) newErrors.pricingModel = 'Required';
    // Carousel/Spotlight
    if (!fields.carouselSpotlight) newErrors.carouselSpotlight = 'Required';
    // Click URL
    if (!fields.clickUrl) newErrors.clickUrl = 'Required';
    // D7, D14, D30, D60, D90, D180
    ['D7', 'D14', 'D30', 'D60', 'D90', 'D180'].forEach((key) => {
      if (!fields[key]) {
        newErrors[key] = 'Required';
      } else if (!/^\d+(\.\d{0,2})?$/.test(fields[key])) {
        newErrors[key] = 'Only two decimal places allowed';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleChange = (field, value) => {
    // Format budgets with commas
    if (field === 'monthlyBudget' || field === 'dailyBudget') {
      // Remove non-digits and commas, then format
      let clean = value.replace(/[^\d]/g, '');
      if (clean) {
        clean = parseInt(clean, 10).toLocaleString();
      }
      setFields((prev) => ({ ...prev, [field]: clean }));
    } else if ([
      'D7', 'D14', 'D30', 'D60', 'D90', 'D180'
    ].includes(field)) {
      // Allow only numbers and up to two decimals
      let clean = value.replace(/[^\d.]/g, '');
      if (clean.split('.').length > 2) clean = clean.replace(/\.+$/, '');
      setFields((prev) => ({ ...prev, [field]: clean }));
    } else if (field === 'flourishClientName') {
      setFields((prev) => ({ ...prev, [field]: value.toLowerCase() }));
    } else {
      setFields((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle checkbox
  const handleCheckbox = (e) => {
    setFields((prev) => ({ ...prev, enableSpiral: e.target.checked }));
  };

  // Handle Next
  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'Campaign',
          rowData: [
            fields.accountManager,
            fields.flourishClientName,
            fields.appName,
            fields.geo,
            fields.clientCampaignName,
            fields.monthlyBudget,
            fields.dailyBudget,
            fields.pricingModel,
            fields.carouselSpotlight,
            fields.clickUrl,
            fields.enableSpiral ? 'true' : 'false',
            fields.D7,
            fields.D14,
            fields.D30,
            fields.D60,
            fields.D90,
            fields.D180
          ],
          rowIndex: campaignRowIndex
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      if (campaignRowIndex == null && typeof result.rowIndex === 'number') {
        setCampaignRowIndex(result.rowIndex);
      }
      updateFormData('campaign', fields);
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

  // Account manager dropdown options (from context or fallback)
  const accountManagerOptions = dropdowns?.accountManagers || [
    'Manager 1', 'Manager 2', 'Manager 3'
  ];

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Box sx={{ width: '66%', mx: 'auto', mt: 4 }}>
        <Typography component="h2" variant="h5" align="center" gutterBottom>
          Add New Campaign
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          <TextField
            select
            label="Account Manager"
            value={fields.accountManager}
            onChange={e => handleChange('accountManager', e.target.value)}
            error={!!errors.accountManager}
            helperText={errors.accountManager}
            fullWidth
          >
            {accountManagerOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Flourish Client Name"
            value={fields.flourishClientName}
            onChange={e => handleChange('flourishClientName', e.target.value)}
            error={!!errors.flourishClientName}
            helperText={errors.flourishClientName}
            fullWidth
            sx={errors.flourishClientName ? { border: '2px solid red', borderRadius: 1 } : {}}
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
            label="Geo for Campaign"
            value={fields.geo}
            onChange={e => handleChange('geo', e.target.value)}
            error={!!errors.geo}
            helperText={errors.geo}
            fullWidth
          >
            {geoOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Client Supplied Campaign Name"
            value={fields.clientCampaignName}
            onChange={e => handleChange('clientCampaignName', e.target.value)}
            error={!!errors.clientCampaignName}
            helperText={errors.clientCampaignName}
            fullWidth
            sx={errors.clientCampaignName ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            label="Monthly Budget"
            value={fields.monthlyBudget}
            onChange={e => handleChange('monthlyBudget', e.target.value)}
            error={!!errors.monthlyBudget}
            helperText={errors.monthlyBudget}
            fullWidth
            sx={errors.monthlyBudget ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            label="Daily Budget"
            value={fields.dailyBudget}
            onChange={e => handleChange('dailyBudget', e.target.value)}
            error={!!errors.dailyBudget}
            helperText={errors.dailyBudget}
            fullWidth
            sx={errors.dailyBudget ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

          <TextField
            select
            label="CPI, Hybrid, or CPA"
            value={fields.pricingModel}
            onChange={e => handleChange('pricingModel', e.target.value)}
            error={!!errors.pricingModel}
            helperText={errors.pricingModel}
            fullWidth
          >
            {pricingModelOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Carousel or Spotlight"
            value={fields.carouselSpotlight}
            onChange={e => handleChange('carouselSpotlight', e.target.value)}
            error={!!errors.carouselSpotlight}
            helperText={errors.carouselSpotlight}
            fullWidth
          >
            {carouselSpotlightOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Click URL"
            value={fields.clickUrl}
            onChange={e => handleChange('clickUrl', e.target.value)}
            error={!!errors.clickUrl}
            helperText={errors.clickUrl}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={fields.enableSpiral}
                onChange={handleCheckbox}
                color="primary"
              />
            }
            label="ROAS Targets"
          />

          <TextField
            label="D7"
            value={fields.D7}
            onChange={e => handleChange('D7', e.target.value)}
            error={!!errors.D7}
            helperText={errors.D7}
            fullWidth
            sx={errors.D7 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />
          <TextField
            label="D14"
            value={fields.D14}
            onChange={e => handleChange('D14', e.target.value)}
            error={!!errors.D14}
            helperText={errors.D14}
            fullWidth
            sx={errors.D14 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />
          <TextField
            label="D30"
            value={fields.D30}
            onChange={e => handleChange('D30', e.target.value)}
            error={!!errors.D30}
            helperText={errors.D30}
            fullWidth
            sx={errors.D30 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />
          <TextField
            label="D60"
            value={fields.D60}
            onChange={e => handleChange('D60', e.target.value)}
            error={!!errors.D60}
            helperText={errors.D60}
            fullWidth
            sx={errors.D60 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />
          <TextField
            label="D90"
            value={fields.D90}
            onChange={e => handleChange('D90', e.target.value)}
            error={!!errors.D90}
            helperText={errors.D90}
            fullWidth
            sx={errors.D90 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />
          <TextField
            label="D180"
            value={fields.D180}
            onChange={e => handleChange('D180', e.target.value)}
            error={!!errors.D180}
            helperText={errors.D180}
            fullWidth
            sx={errors.D180 ? { border: '2px solid red', borderRadius: 1 } : {}}
          />

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
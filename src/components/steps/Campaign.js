import { Grid, TextField } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

export default function Campaign() {
  const { formData, updateFormData } = useWizard();
  const { campaignName, campaignStartDate, campaignEndDate, campaignBudget } = formData;

  const handleChange = (field) => (event) => {
    updateFormData('campaign', { [field]: event.target.value });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Campaign Name"
          value={campaignName}
          onChange={handleChange('campaignName')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={campaignStartDate}
          onChange={handleChange('campaignStartDate')}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date"
          type="date"
          value={campaignEndDate}
          onChange={handleChange('campaignEndDate')}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Campaign Budget"
          type="number"
          value={campaignBudget}
          onChange={handleChange('campaignBudget')}
          required
          InputProps={{
            startAdornment: '$',
          }}
        />
      </Grid>
    </Grid>
  );
} 
import { Grid, TextField } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

export default function ClientDetails() {
  const { formData, updateFormData } = useWizard();
  const { clientName, clientEmail, clientPhone, clientWebsite } = formData;

  const handleChange = (field) => (event) => {
    updateFormData('clientDetails', { [field]: event.target.value });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Name"
          value={clientName}
          onChange={handleChange('clientName')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Email"
          type="email"
          value={clientEmail}
          onChange={handleChange('clientEmail')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Phone"
          value={clientPhone}
          onChange={handleChange('clientPhone')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Website"
          value={clientWebsite}
          onChange={handleChange('clientWebsite')}
          required
        />
      </Grid>
    </Grid>
  );
} 
import { useState } from 'react';
import { Grid, TextField, Button, MenuItem, Typography, Box } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const accountManagers = [
  '-- Select --',
  'User 1',
  'User 2',
  'User 3'
];

export default function ClientBasics() {
  const { formData, updateFormData, activeStep, setActiveStep, clientBasicsRowIndex, setClientBasicsRowIndex } = useWizard();
  const [fields, setFields] = useState({
    clientName: formData.clientName || '',
    billingName: formData.billingName || '',
    accountManager: formData.accountManager || '',
    flourishClientName: formData.flourishClientName || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fields.clientName) {
      setError('Please enter the client common name or DBA name.');
      return false;
    }
    if (!fields.billingName) {
      setError('Please enter the client billing name.');
      return false;
    }
    if (!fields.accountManager || fields.accountManager === '-- Select --') {
      setError('Please select an account manager.');
      return false;
    }
    if (!fields.flourishClientName) {
      setError('Please enter the Flourish client name.');
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
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'ClientInfo',
          rowData: [
            fields.clientName,
            fields.billingName,
            fields.accountManager,
            fields.flourishClientName
          ],
          rowIndex: clientBasicsRowIndex
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      if (clientBasicsRowIndex == null && typeof result.rowIndex === 'number') {
        setClientBasicsRowIndex(result.rowIndex);
      }
      updateFormData('clientBasics', {
        clientName: fields.clientName,
        billingName: fields.billingName,
        accountManager: fields.accountManager,
        flourishClientName: fields.flourishClientName
      });
      updateFormData('accountManager', fields.accountManager);
      updateFormData('flourishClientName', fields.flourishClientName);
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
        Client Basics
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Please fill in all of the following fields to create a new client entry.
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Client Common Name or DBA Name"
            name="clientName"
            value={fields.clientName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Client Billing Name"
            name="billingName"
            value={fields.billingName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Flourish Client Name"
            name="flourishClientName"
            value={fields.flourishClientName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Account Manager"
            name="accountManager"
            value={fields.accountManager}
            onChange={handleChange}
            required
          >
            {accountManagers.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
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
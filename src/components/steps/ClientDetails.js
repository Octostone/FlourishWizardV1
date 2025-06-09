import { useState } from 'react';
import { Grid, TextField, Button, MenuItem, Typography, Box } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

const mmpOptions = [
  'Adjust',
  'Appsflyer'
];
const netGrossOptions = ['Net', 'Gross'];
const baseCmOptions = ['Base', 'CM'];

export default function ClientDetails() {
  const { formData, updateFormData, activeStep, setActiveStep, clientDetailsRowIndex, setClientDetailsRowIndex } = useWizard();
  const [fields, setFields] = useState({
    mmp: formData['MMP'] || '',
    netGross: formData['Net/Gross'] || '',
    grossDeduction: formData['Gross Deduction'] || '',
    baseCm: formData['Base/CM'] || '',
    flourishClientName: formData['Flourish Client Name'] || '',
    clientDBAName: formData['Client DBA Name'] || '',
    billingName: formData['Billing Name'] || '',
    accountManager: formData['Account Manager'] || ''
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newError = {};
    if (!fields.mmp) newError.mmp = 'Please select an MMP.';
    if (!fields.netGross) newError.netGross = 'Please select Net or Gross.';
    if (!fields.grossDeduction || !/^[0-9]+$/.test(fields.grossDeduction)) newError.grossDeduction = 'Number values only. Do not put a % sign.';
    if (!fields.baseCm) newError.baseCm = 'Please select Base or CM.';
    if (!fields.flourishClientName) {
      newError.flourishClientName = 'Please enter a name.';
    } else if (!fields.flourishClientName.endsWith('_flourish') || /[A-Z]/.test(fields.flourishClientName)) {
      newError.flourishClientName = 'name must end in _flourish, no capitalization';
    }
    setError(newError);
    return Object.keys(newError).length === 0;
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
          tabName: 'ClientDetails',
          rowData: [
            fields.mmp,
            fields.netGross,
            fields.grossDeduction,
            fields.baseCm,
            fields.flourishClientName
          ],
          rowIndex: clientDetailsRowIndex
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      if (clientDetailsRowIndex == null && typeof result.rowIndex === 'number') {
        setClientDetailsRowIndex(result.rowIndex);
      }
      updateFormData('clientDetails', {
        'MMP': fields.mmp,
        'Net/Gross': fields.netGross,
        'Gross Deduction': fields.grossDeduction,
        'Base/CM': fields.baseCm,
        'Flourish Client Name': fields.flourishClientName
      });
      setActiveStep(activeStep + 1);
    } catch (err) {
      setError({ general: err.message || 'Failed to write to sheet.' });
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
        Client Details
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Please fill in all of the following client details.
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="MMP used by client"
            name="mmp"
            value={fields.mmp}
            onChange={handleChange}
            required
            error={!!error.mmp}
            helperText={error.mmp}
          >
            {mmpOptions.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Is client passing us net or gross values?"
            name="netGross"
            value={fields.netGross}
            onChange={handleChange}
            required
            error={!!error.netGross}
            helperText={error.netGross}
          >
            {netGrossOptions.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Gross Deduction"
            name="grossDeduction"
            value={fields.grossDeduction}
            onChange={handleChange}
            required
            placeholder="Number values only. Do not put a % sign"
            error={!!error.grossDeduction}
            helperText={error.grossDeduction}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Is client passing base or CM values?"
            name="baseCm"
            value={fields.baseCm}
            onChange={handleChange}
            required
            error={!!error.baseCm}
            helperText={error.baseCm}
          >
            {baseCmOptions.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Flourish Client Name"
            name="flourishClientName"
            value={fields.flourishClientName}
            onChange={handleChange}
            required
            error={!!error.flourishClientName}
            helperText={error.flourishClientName}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: error.flourishClientName ? 'red' : undefined
                }
              }
            }}
          />
        </Grid>
        {error.general && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography color="error" align="center">{error.general}</Typography>
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
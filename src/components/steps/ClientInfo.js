import { useState } from 'react';
import { Grid, TextField, Button, Alert, MenuItem, Box } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

// Placeholder account managers; will be editable via admin in the future
const accountManagers = [
  '-- Select --',
  'User 1',
  'User 2',
  'User 3'
];

// Google Sheet template ID
const TEMPLATE_ID = '1vaW7egSNhsLoWVvG2VpqnUwdd_shiZ6fq0kpaj3vNbk';

// Map button to step index
const stepMap = {
  newClient: 1, // Client Basics
  newApp: 1,    // Client Basics
  newCampaign: 1, // Client Basics
  newOffers: 1, // Client Basics
  updateImages: 7 // Images (now step 7)
};

export default function LandingPage() {
  const { formData, updateFormData, setSheetId, setActiveStep } = useWizard();
  const [fields, setFields] = useState({
    accountManager: formData.accountManager || '',
    outputName: formData.outputName || '',
    folderUrl: formData.folderUrl || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to extract folder ID from URL
  const extractFolderId = (url) => {
    if (!url) return '';
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  // Validate required fields
  const validate = () => {
    if (!fields.accountManager || fields.accountManager === '-- Select --') {
      setError('Please select an account manager.');
      return false;
    }
    if (!fields.outputName) {
      setError('Please enter an output file name.');
      return false;
    }
    if (!fields.folderUrl) {
      setError('Please enter a Google Drive folder URL.');
      return false;
    }
    if (!extractFolderId(fields.folderUrl)) {
      setError('Invalid Google Drive folder URL.');
      return false;
    }
    setError('');
    return true;
  };

  // Call the API route to copy the template sheet
  const copyTemplateSheet = async (outputName, folderId) => {
    let response;
    try {
      response = await fetch('/api/googleDrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outputName, folderId })
      });
    } catch (err) {
      throw new Error('Network error. Please try again.');
    }
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error('Server returned non-JSON:', err);
      throw new Error('Server error: Invalid response.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Failed to copy template');
    }
    return data.sheetId;
  };

  // Handler for navigation buttons
  const handleNavigate = async (target) => {
    if (!validate()) return;
    setLoading(true);
    try {
      const folderId = extractFolderId(fields.folderUrl);
      // Copy the template and get the new sheet ID
      const newSheetId = await copyTemplateSheet(fields.outputName, folderId);
      // Store all info in context
      updateFormData('clientInfo', {
        ...fields,
        folderId,
        sheetId: newSheetId
      });
      // Store the new sheet ID for use in all steps
      if (setSheetId) setSheetId(newSheetId);
      // Progress to the correct step
      if (setActiveStep) setActiveStep(stepMap[target]);
    } catch (err) {
      setError(err.message || 'Failed to create sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Account Manager"
            name="accountManager"
            value={fields.accountManager}
            onChange={e => setFields(f => ({ ...f, accountManager: e.target.value }))}
            required
          >
            {accountManagers.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name your output Excel file (this will become the Google Sheet name)"
            name="outputName"
            value={fields.outputName}
            onChange={e => setFields(f => ({ ...f, outputName: e.target.value }))}
            placeholder="e.g., Client_App_Date"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Paste Google Drive folder URL to save the file"
            name="folderUrl"
            value={fields.folderUrl}
            onChange={e => setFields(f => ({ ...f, folderUrl: e.target.value }))}
            placeholder="e.g., https://drive.google.com/drive/folders/AI..."
            required
          />
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Button
              className="btn-action"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => handleNavigate('newClient')}
            >
              Add New Client, App, Campaign and Offers
            </Button>
            <Button
              className="btn-action"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => handleNavigate('newApp')}
            >
              Add an App, Campaign and Offers
            </Button>
            <Button
              className="btn-action"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => handleNavigate('newCampaign')}
            >
              Add a Campaign and Offers
            </Button>
            <Button
              className="btn-action"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => handleNavigate('newOffers')}
            >
              Add Offers to an existing Campaign
            </Button>
            <Button
              className="btn-action"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => handleNavigate('updateImages')}
            >
              Update Images only
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box position="fixed" bottom={20} left={20}>
            <Button
              variant="outlined"
              onClick={() => alert('Admin Access coming soon!')}
            >
              Admin Access
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
} 
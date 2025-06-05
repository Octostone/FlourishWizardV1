import { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Stepper, 
  Step, 
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useWizard } from '../src/context/WizardContext';
import ClientDetails from '../src/components/steps/ClientDetails';
import AppInformation from '../src/components/steps/AppInformation';
import Events from '../src/components/steps/Events';
import Campaign from '../src/components/steps/Campaign';
import Offers from '../src/components/steps/Offers';
import Images from '../src/components/steps/Images';
import { writeToSheet, SHEET_NAMES } from '../src/services/googleSheets';

const steps = [
  'Client Information',
  'Client Details',
  'App Information',
  'Events',
  'Campaign',
  'Offers',
  'Images'
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  width: '80%',
  margin: '0 auto'
}));

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const { formData, updateFormData } = useWizard();
  const { accountManager, outputName, folderUrl } = formData;

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // On the last step, save all data to Google Sheets
      try {
        await writeToSheet(SHEET_NAMES.CLIENT_INFO, [
          accountManager,
          outputName,
          folderUrl
        ]);
        // Add more sheet writes for other data...
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Account Manager"
                value={accountManager}
                onChange={(e) => updateFormData('clientInfo', { accountManager: e.target.value })}
                required
              >
                <MenuItem value="">Select Account Manager</MenuItem>
                <MenuItem value="John Doe">John Doe</MenuItem>
                <MenuItem value="Jane Smith">Jane Smith</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Output File Name"
                value={outputName}
                onChange={(e) => updateFormData('clientInfo', { outputName: e.target.value })}
                placeholder="e.g., Client_App_Date"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Output Folder Location"
                value={folderUrl}
                onChange={(e) => updateFormData('clientInfo', { folderUrl: e.target.value })}
                placeholder="e.g., /path/to/folder"
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return <ClientDetails />;
      case 2:
        return <AppInformation />;
      case 3:
        return <Events />;
      case 4:
        return <Campaign />;
      case 5:
        return <Offers />;
      case 6:
        return <Images />;
      default:
        return <Typography>Step {step + 1} content coming soon...</Typography>;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Flourish Wizard
        </Typography>
        
        <StyledPaper elevation={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </StyledPaper>
      </Box>
    </Container>
  );
} 
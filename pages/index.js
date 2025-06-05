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
import ClientInfo from '../src/components/steps/ClientInfo';
import ClientDetails from '../src/components/steps/ClientDetails';
import AppInformation from '../src/components/steps/AppInformation';
import Events from '../src/components/steps/Events';
import Campaign from '../src/components/steps/Campaign';
import Offers from '../src/components/steps/Offers';
import Images from '../src/components/steps/Images';
import { writeToSheet, SHEET_NAMES } from '../src/services/googleSheets';

const steps = [
  'Client Info',
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
  padding: theme.spacing(2),
  [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3),
  },
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
        return <ClientInfo />;
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
    <Container component="main" maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Flourish Wizard
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <>
          {activeStep === steps.length ? (
            <>
              <Typography variant="h5" gutterBottom>
                Thank you for your submission.
              </Typography>
              <Typography variant="subtitle1">
                Your form has been submitted successfully.
              </Typography>
            </>
          ) : (
            <>
              {renderStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </>
      </StyledPaper>
    </Container>
  );
} 
import { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { WizardProvider, useWizard } from '../src/context/WizardContext';
import LandingPage from '../src/components/steps/ClientInfo';
import ClientBasics from '../src/components/steps/ClientBasics';
import ClientDetails from '../src/components/steps/ClientDetails';
import AppInformation from '../src/components/steps/AppInformation';
import Events from '../src/components/steps/Events';
import Campaign from '../src/components/steps/Campaign';
import Offers from '../src/components/steps/Offers';
import Images from '../src/components/steps/Images';
import Finish from '../src/components/steps/Finish';

const steps = [
  'Client Basics',
  'Client Details',
  'App Information',
  'Events',
  'Campaign',
  'Offers',
  'Images',
  'Finish'
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

function WizardContent() {
  const { formData, activeStep, setActiveStep } = useWizard();

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <LandingPage />;
      case 1:
        return <ClientBasics />;
      case 2:
        return <ClientDetails />;
      case 3:
        return <AppInformation />;
      case 4:
        return <Events />;
      case 5:
        return <Campaign />;
      case 6:
        return <Offers />;
      case 7:
        return <Images />;
      case 8:
        return <Finish />;
      default:
        throw new Error('Unknown step');
    }
  };

  // For Events page, use a wider container
  const isEventsStep = activeStep === 4;

  return (
    <Container component="main" maxWidth={isEventsStep ? false : "md"} sx={isEventsStep ? { width: '100%' } : {}}>
      <StyledPaper elevation={3} sx={isEventsStep ? { width: '90%', mx: 'auto' } : {}}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Flourish Wizard
        </Typography>
        {activeStep > 0 && (
          <Stepper activeStep={activeStep - 1} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        {renderStepContent(activeStep)}
      </StyledPaper>
    </Container>
  );
}

export default function Home() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
} 
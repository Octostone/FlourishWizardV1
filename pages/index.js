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
  const [accountManager, setAccountManager] = useState('');
  const [outputName, setOutputName] = useState('');
  const [folderUrl, setFolderUrl] = useState('');

  const handleNext = () => {
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
                onChange={(e) => setAccountManager(e.target.value)}
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
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="e.g., Client_App_Date"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Output Folder Location"
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                placeholder="e.g., /path/to/folder"
                required
              />
            </Grid>
          </Grid>
        );
      // Add more cases for other steps
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
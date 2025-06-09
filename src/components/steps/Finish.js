import { Box, Typography, Button } from '@mui/material';
import { useWizard } from '../../context/WizardContext';

export default function Finish() {
  const { setActiveStep, resetWizard, activeStep } = useWizard();

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleFinish = () => {
    resetWizard();
    setActiveStep(0); // Go back to landing page
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        All Done!
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        You have completed the wizard. Click below to finish and start a new entry.
      </Typography>
      <Box display="flex" justifyContent="center" gap={3} mt={5}>
        <Button variant="outlined" onClick={handleBack} sx={{ px: 4, py: 1 }}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={handleFinish} sx={{ px: 4, py: 1 }}>
          Finish and Submit
        </Button>
      </Box>
    </Box>
  );
} 
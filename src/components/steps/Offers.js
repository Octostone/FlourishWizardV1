import { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useWizard } from '../../context/WizardContext';

export default function Offers() {
  const { formData, addOffer, removeOffer } = useWizard();
  const [newOffer, setNewOffer] = useState({
    offerName: '',
    offerType: '',
    offerValue: '',
    offerDescription: ''
  });

  const handleChange = (index, field) => (event) => {
    const updatedOffers = [...formData.offers];
    updatedOffers[index] = {
      ...updatedOffers[index],
      [field]: event.target.value
    };
    addOffer(updatedOffers[index]);
  };

  const handleNewOfferChange = (field) => (event) => {
    setNewOffer({
      ...newOffer,
      [field]: event.target.value
    });
  };

  const handleAddOffer = () => {
    if (newOffer.offerName && newOffer.offerType) {
      addOffer(newOffer);
      setNewOffer({
        offerName: '',
        offerType: '',
        offerValue: '',
        offerDescription: ''
      });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Add New Offer
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Offer Name"
                value={newOffer.offerName}
                onChange={handleNewOfferChange('offerName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Offer Type"
                value={newOffer.offerType}
                onChange={handleNewOfferChange('offerType')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Offer Value"
                value={newOffer.offerValue}
                onChange={handleNewOfferChange('offerValue')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddOffer}
                fullWidth
                sx={{ height: '56px' }}
              >
                Add Offer
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Offer Description"
                value={newOffer.offerDescription}
                onChange={handleNewOfferChange('offerDescription')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Offer List
        </Typography>
        {formData.offers.map((offer, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Offer Name"
                  value={offer.offerName}
                  onChange={handleChange(index, 'offerName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Offer Type"
                  value={offer.offerType}
                  onChange={handleChange(index, 'offerType')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Offer Value"
                  value={offer.offerValue}
                  onChange={handleChange(index, 'offerValue')}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" justifyContent="flex-end">
                  <IconButton
                    color="error"
                    onClick={() => removeOffer(index)}
                    aria-label="delete offer"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Offer Description"
                  value={offer.offerDescription}
                  onChange={handleChange(index, 'offerDescription')}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Grid>
    </Grid>
  );
} 
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

export default function Events() {
  const { formData, addEvent, removeEvent } = useWizard();
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    eventType: '',
    eventValue: '',
    isIAP: false
  });

  const handleChange = (index, field) => (event) => {
    const updatedEvents = [...formData.events];
    updatedEvents[index] = {
      ...updatedEvents[index],
      [field]: event.target.value
    };
    addEvent(updatedEvents[index]);
  };

  const handleNewEventChange = (field) => (event) => {
    setNewEvent({
      ...newEvent,
      [field]: event.target.value
    });
  };

  const handleAddEvent = () => {
    if (newEvent.eventName && newEvent.eventType) {
      addEvent(newEvent);
      setNewEvent({
        eventName: '',
        eventType: '',
        eventValue: '',
        isIAP: false
      });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Add New Event
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Event Name"
                value={newEvent.eventName}
                onChange={handleNewEventChange('eventName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Event Type"
                value={newEvent.eventType}
                onChange={handleNewEventChange('eventType')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Event Value"
                value={newEvent.eventValue}
                onChange={handleNewEventChange('eventValue')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddEvent}
                fullWidth
                sx={{ height: '56px' }}
              >
                Add Event
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Event List
        </Typography>
        {formData.events.map((event, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={event.eventName}
                  onChange={handleChange(index, 'eventName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Event Type"
                  value={event.eventType}
                  onChange={handleChange(index, 'eventType')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Event Value"
                  value={event.eventValue}
                  onChange={handleChange(index, 'eventValue')}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" justifyContent="flex-end">
                  <IconButton
                    color="error"
                    onClick={() => removeEvent(index)}
                    aria-label="delete event"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Grid>
    </Grid>
  );
} 
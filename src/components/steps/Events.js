import { useState, useEffect, useRef } from 'react';
import {
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  Box,
  MenuItem
} from '@mui/material';
import { DragHandle as DragHandleIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWizard } from '../../context/WizardContext';

const eventTypeOptions = ['GOAL', 'INITIAL', 'AD', 'PURCHASE'];
const pubReveSourceOptions = ['In Event Name', 'In Postback'];

const initialRow = {
  position: '',
  name: '',
  postbackEventName: '',
  estimatedCR: '',
  estimatedTTC: '',
  expiration: '',
  eventType: '',
  pubReveSource: ''
};

export default function Events() {
  const { formData, updateFormData, activeStep, setActiveStep } = useWizard();
  const [rows, setRows] = useState([{ ...initialRow, id: 'row-0' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const rowsRef = useRef(rows);

  // Always initialize rows from formData.events if available
  useEffect(() => {
    if (Array.isArray(formData.events) && formData.events.length > 0) {
      setRows(
        formData.events.map((row, idx) => ({ ...row, id: row.id || `row-${idx}` }))
      );
    } else {
      setRows([{ ...initialRow, id: 'row-0' }]);
    }
  }, [formData.events]);

  // Keep rowsRef in sync
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // On unmount, always update context with latest rows
  useEffect(() => {
    return () => {
      updateFormData('events', rowsRef.current);
    };
  }, []);

  const validate = () => {
    for (const row of rows) {
      if (!row.position || !/^\d{1,3}$/.test(row.position)) {
        setError('Position must be 1-3 digits');
        return false;
      }
      if (!row.name || row.name.length > 35) {
        setError('Name must be provided and less than 35 characters');
        return false;
      }
      if (!row.postbackEventName || row.postbackEventName.length > 25) {
        setError('Postback Event Name must be provided and less than 25 characters');
        return false;
      }
      if (!row.estimatedCR || !/^\d{1,3}$/.test(row.estimatedCR)) {
        setError('Estimated CR must be 1-3 digits');
        return false;
      }
      if (!row.estimatedTTC || !/^\d{1,5}$/.test(row.estimatedTTC)) {
        setError('Estimated TTC must be 1-5 digits');
        return false;
      }
      if (!row.expiration || row.expiration.length > 7) {
        setError('Expiration must be provided and less than 7 characters');
        return false;
      }
      if (!row.eventType) {
        setError('Event Type must be selected');
        return false;
      }
      if (!row.pubReveSource) {
        setError('Pub Reve Source must be selected');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleChange = (rowIndex, field, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { ...initialRow, id: `row-${rows.length}` }]);
  };

  const deleteRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(rows);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRows(items);
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      updateFormData('events', rows); // Save before navigation
      // Write to Google Sheet via API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'Events',
          rows: rows.map(row => [
            row.position,
            row.name,
            row.postbackEventName,
            row.estimatedCR,
            row.estimatedTTC,
            row.expiration,
            row.eventType,
            row.pubReveSource
          ])
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      setActiveStep(activeStep + 1);
    } catch (err) {
      setError(err.message || 'Failed to write to sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    updateFormData('events', rows); // Save before navigation
    setActiveStep(activeStep - 1);
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        Events
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Please configure the events for tracking.
      </Typography>

      <Box sx={{ width: '85%', mx: 'auto' }}>
        {/* Column Headers as flex */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, px: 2 }}>
          <Box sx={{ width: '80px', fontWeight: 600 }}>Position</Box>
          <Box sx={{ width: '200px', fontWeight: 600 }}>Name</Box>
          <Box sx={{ width: '180px', fontWeight: 600 }}>Postback Event Name</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>Estimated CR %</Box>
          <Box sx={{ width: '120px', fontWeight: 600 }}>Estimated TTC</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>Expiration</Box>
          <Box sx={{ width: '120px', fontWeight: 600 }}>Event Type</Box>
          <Box sx={{ width: '150px', fontWeight: 600 }}>Pub Reve Source</Box>
          <Box sx={{ width: '40px' }}></Box>
        </Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="events">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {rows.map((row, index) => (
                  <Draggable key={row.id} draggableId={row.id} index={index}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1
                        }}
                      >
                        <Box {...provided.dragHandleProps}>
                          <DragHandleIcon />
                        </Box>
                        <TextField
                          size="small"
                          value={row.position}
                          onChange={(e) => handleChange(index, 'position', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          sx={{ width: '80px' }}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                        <TextField
                          size="small"
                          value={row.name}
                          onChange={(e) => handleChange(index, 'name', e.target.value.slice(0, 35))}
                          sx={{ width: '200px' }}
                        />
                        <TextField
                          size="small"
                          value={row.postbackEventName}
                          onChange={(e) => handleChange(index, 'postbackEventName', e.target.value.slice(0, 25))}
                          sx={{ width: '180px' }}
                        />
                        <TextField
                          size="small"
                          value={row.estimatedCR}
                          onChange={(e) => handleChange(index, 'estimatedCR', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          sx={{ width: '100px' }}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                        <TextField
                          size="small"
                          value={row.estimatedTTC}
                          onChange={(e) => handleChange(index, 'estimatedTTC', e.target.value.replace(/\D/g, '').slice(0, 5))}
                          sx={{ width: '120px' }}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                        <TextField
                          size="small"
                          value={row.expiration}
                          onChange={(e) => handleChange(index, 'expiration', e.target.value.slice(0, 7))}
                          sx={{ width: '100px' }}
                        />
                        <TextField
                          select
                          size="small"
                          value={row.eventType}
                          onChange={(e) => handleChange(index, 'eventType', e.target.value)}
                          sx={{ width: '120px' }}
                        >
                          {eventTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          size="small"
                          value={row.pubReveSource}
                          onChange={(e) => handleChange(index, 'pubReveSource', e.target.value)}
                          sx={{ width: '150px' }}
                        >
                          {pubReveSourceOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton
                          color="error"
                          onClick={() => deleteRow(index)}
                          disabled={rows.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            startIcon={<AddIcon />}
            onClick={addRow}
            variant="outlined"
          >
            Add Event
          </Button>
        </Box>
        {error && (
          <Box mt={2}>
            <Typography color="error" align="center">{error}</Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="center" gap={3} mt={4}>
          <Button variant="outlined" onClick={handleBack} sx={{ px: 4, py: 1 }}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext} sx={{ px: 4, py: 1 }} disabled={loading}>
            Next
          </Button>
        </Box>
      </Box>
    </form>
  );
} 
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem
} from '@mui/material';
import { DragHandle as DragHandleIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWizard } from '../../context/WizardContext';

const initialRow = {
  offerName: '',
  offerType: '',
  offerValue: '',
  offerDescription: '',
  id: ''
};

const offerTypeOptions = ['Discount', 'Bonus', 'Free Trial', 'Other'];

export default function Offers() {
  const { formData, updateFormData, activeStep, setActiveStep } = useWizard();
  const [rows, setRows] = useState([{ ...initialRow, id: 'row-0' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const rowsRef = useRef(rows);

  // Always initialize rows from formData.offers if available
  useEffect(() => {
    if (Array.isArray(formData.offers) && formData.offers.length > 0) {
      setRows(
        formData.offers.map((row, idx) => ({ ...row, id: row.id || `row-${idx}` }))
      );
    } else {
      setRows([{ ...initialRow, id: 'row-0' }]);
    }
  }, [formData.offers]);

  // Keep rowsRef in sync
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // On unmount, always update context with latest rows
  useEffect(() => {
    return () => {
      updateFormData('offers', rowsRef.current);
    };
  }, []);

  const validate = () => {
    for (const row of rows) {
      if (!row.offerName) {
        setError('Offer Name is required');
        return false;
      }
      if (!row.offerType) {
        setError('Offer Type is required');
        return false;
      }
      if (!row.offerValue) {
        setError('Offer Value is required');
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
      updateFormData('offers', rows);
      // Write to Google Sheet via API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'Offers',
          rows: rows.map(row => [
            row.offerName,
            row.offerType,
            row.offerValue,
            row.offerDescription
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
    updateFormData('offers', rows);
    setActiveStep(activeStep - 1);
  };

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()}>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        Offers
      </Typography>
      <Typography align="center" sx={{ mb: 3 }}>
        Please add and configure offers for this campaign.
      </Typography>
      <Box sx={{ width: '80%', mx: 'auto' }}>
        {/* Column Headers as flex */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, px: 2 }}>
          <Box sx={{ width: '200px', fontWeight: 600 }}>Offer Name</Box>
          <Box sx={{ width: '150px', fontWeight: 600 }}>Offer Type</Box>
          <Box sx={{ width: '120px', fontWeight: 600 }}>Offer Value</Box>
          <Box sx={{ width: '300px', fontWeight: 600 }}>Offer Description</Box>
          <Box sx={{ width: '40px' }}></Box>
        </Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="offers">
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
                          value={row.offerName}
                          onChange={(e) => handleChange(index, 'offerName', e.target.value)}
                          sx={{ width: '200px' }}
                        />
                        <TextField
                          select
                          size="small"
                          value={row.offerType}
                          onChange={(e) => handleChange(index, 'offerType', e.target.value)}
                          sx={{ width: '150px' }}
                        >
                          {offerTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          size="small"
                          value={row.offerValue}
                          onChange={(e) => handleChange(index, 'offerValue', e.target.value)}
                          sx={{ width: '120px' }}
                        />
                        <TextField
                          size="small"
                          value={row.offerDescription}
                          onChange={(e) => handleChange(index, 'offerDescription', e.target.value)}
                          sx={{ width: '300px' }}
                        />
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
            Add Offer
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
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText
} from '@mui/material';
import { DragHandle as DragHandleIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWizard } from '../../context/WizardContext';

const geoOptions = ['US', 'CA', 'UK', 'AU', 'Other'];
const genderOptions = ['MALE', 'FEMALE', 'ANY'];

const initialRow = {
  geo: '',
  gender: '',
  minAge: '',
  maxAge: '',
  minOS: '',
  maxOS: '',
  cpi: '',
  cpiOverride: '',
  dailyBudget: '',
  dailyCap: '',
  clientOfferName: '',
  id: ''
};

export default function Offers() {
  const { formData, updateFormData, activeStep, setActiveStep, getSharedField, updateSharedField } = useWizard();
  const [rows, setRows] = useState([{ ...initialRow, id: 'row-0' }]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const rowsRef = useRef(rows);

  // Initialize rows from formData.offers if available
  useEffect(() => {
    if (Array.isArray(formData.offers) && formData.offers.length > 0) {
      setRows(
        formData.offers.map((row, idx) => ({ ...row, id: row.id || `row-${idx}` }))
      );
    } else {
      // Initialize with Geo from shared field if available
      setRows([{ ...initialRow, geo: getSharedField('geo'), id: 'row-0' }]);
    }
  }, [formData.offers, getSharedField]);

  // Keep rowsRef in sync
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // On unmount, persist to context
  useEffect(() => {
    return () => {
      updateFormData('offers', rowsRef.current);
    };
  }, []);

  const validate = () => {
    let valid = true;
    let newErrors = {};

    rows.forEach((row, rowIndex) => {
      const rowErrors = {};

      // Required fields
      if (!row.geo) rowErrors.geo = 'Required';
      if (!row.gender) rowErrors.gender = 'Required';
      if (!row.clientOfferName) rowErrors.clientOfferName = 'Required';
      if (row.clientOfferName && /\s/.test(row.clientOfferName)) {
        rowErrors.clientOfferName = 'No spaces allowed';
      }

      // Age validation
      if (row.minAge && !/^\d+$/.test(row.minAge)) {
        rowErrors.minAge = 'Numbers only';
      }
      if (row.maxAge && !/^\d+$/.test(row.maxAge)) {
        rowErrors.maxAge = 'Numbers only';
      }
      if (row.minAge && row.maxAge && parseInt(row.minAge) >= parseInt(row.maxAge)) {
        rowErrors.maxAge = 'Must be greater than Min Age';
      }

      // OS validation
      if (row.minOS && !/^\d+$/.test(row.minOS)) {
        rowErrors.minOS = 'Numbers only';
      }
      if (row.maxOS && !/^\d+$/.test(row.maxOS)) {
        rowErrors.maxOS = 'Numbers only';
      }
      if (row.minOS && row.maxOS && parseInt(row.minOS) >= parseInt(row.maxOS)) {
        rowErrors.maxOS = 'Must be greater than Min OS';
      }

      // CPI validation
      if (row.cpi && !/^\d*\.?\d{0,2}$/.test(row.cpi)) {
        rowErrors.cpi = 'Numbers only, max 2 decimals';
      }
      if (row.cpiOverride && !/^\d*\.?\d{0,2}$/.test(row.cpiOverride)) {
        rowErrors.cpiOverride = 'Numbers only, max 2 decimals';
      }

      // Daily Budget validation
      if (row.dailyBudget) {
        const budget = parseFloat(row.dailyBudget.replace(/,/g, ''));
        if (isNaN(budget) || budget > 99999.99) {
          rowErrors.dailyBudget = 'Max value is 99,999.99';
        }
      }

      // Daily Cap validation
      if (row.dailyCap) {
        const cap = parseInt(row.dailyCap.replace(/,/g, ''));
        if (isNaN(cap) || cap > 9999) {
          rowErrors.dailyCap = 'Max value is 9,999';
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[rowIndex] = rowErrors;
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (rowIndex, field, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    setRows(newRows);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumber = (value) => {
    if (!value) return '';
    const num = parseInt(value.replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  };

  const addRow = () => {
    setRows([...rows, { ...initialRow, geo: getSharedField('geo'), id: `row-${rows.length}` }]);
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
      // Write to Google Sheet via API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: formData.sheetId,
          tabName: 'Offers',
          rows: rows.map(row => [
            row.geo,
            row.gender,
            row.minAge,
            row.maxAge,
            row.minOS,
            row.maxOS,
            row.cpi,
            row.cpiOverride,
            row.dailyBudget,
            row.dailyCap,
            row.clientOfferName
          ])
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to write to sheet');
      updateFormData('offers', rows);
      setActiveStep(activeStep + 1);
    } catch (err) {
      setErrors({ general: err.message || 'Failed to write to sheet.' });
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
        {/* Column Headers */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, px: 2 }}>
          <Box sx={{ width: '100px', fontWeight: 600 }}>Geo</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>Gender</Box>
          <Box sx={{ width: '80px', fontWeight: 600 }}>Min Age</Box>
          <Box sx={{ width: '80px', fontWeight: 600 }}>Max Age</Box>
          <Box sx={{ width: '80px', fontWeight: 600 }}>Min OS</Box>
          <Box sx={{ width: '80px', fontWeight: 600 }}>Max OS</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>CPI</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>CPI Override</Box>
          <Box sx={{ width: '120px', fontWeight: 600 }}>Daily Budget</Box>
          <Box sx={{ width: '100px', fontWeight: 600 }}>Daily Cap</Box>
          <Box sx={{ width: '200px', fontWeight: 600 }}>Client Offer Name</Box>
          <Box sx={{ width: '40px' }}></Box>
        </Box>

        {rows.map((row, index) => (
          <Box
            key={row.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <FormControl sx={{ width: '100px' }} error={!!errors[index]?.geo}>
              <Select
                value={row.geo}
                onChange={(e) => handleChange(index, 'geo', e.target.value)}
                size="small"
              >
                {geoOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {errors[index]?.geo && <FormHelperText>{errors[index].geo}</FormHelperText>}
            </FormControl>

            <FormControl sx={{ width: '100px' }} error={!!errors[index]?.gender}>
              <Select
                value={row.gender}
                onChange={(e) => handleChange(index, 'gender', e.target.value)}
                size="small"
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {errors[index]?.gender && <FormHelperText>{errors[index].gender}</FormHelperText>}
            </FormControl>

            <TextField
              size="small"
              value={row.minAge}
              onChange={(e) => handleChange(index, 'minAge', e.target.value.replace(/[^\d]/g, ''))}
              error={!!errors[index]?.minAge}
              helperText={errors[index]?.minAge}
              sx={{ width: '80px' }}
            />

            <TextField
              size="small"
              value={row.maxAge}
              onChange={(e) => handleChange(index, 'maxAge', e.target.value.replace(/[^\d]/g, ''))}
              error={!!errors[index]?.maxAge}
              helperText={errors[index]?.maxAge}
              sx={{ width: '80px' }}
            />

            <TextField
              size="small"
              value={row.minOS}
              onChange={(e) => handleChange(index, 'minOS', e.target.value.replace(/[^\d]/g, ''))}
              error={!!errors[index]?.minOS}
              helperText={errors[index]?.minOS}
              sx={{ width: '80px' }}
            />

            <TextField
              size="small"
              value={row.maxOS}
              onChange={(e) => handleChange(index, 'maxOS', e.target.value.replace(/[^\d]/g, ''))}
              error={!!errors[index]?.maxOS}
              helperText={errors[index]?.maxOS}
              sx={{ width: '80px' }}
            />

            <TextField
              size="small"
              value={row.cpi}
              onChange={(e) => handleChange(index, 'cpi', e.target.value.replace(/[^\d.]/g, ''))}
              error={!!errors[index]?.cpi}
              helperText={errors[index]?.cpi}
              sx={{ width: '100px' }}
            />

            <TextField
              size="small"
              value={row.cpiOverride}
              onChange={(e) => handleChange(index, 'cpiOverride', e.target.value.replace(/[^\d.]/g, ''))}
              error={!!errors[index]?.cpiOverride}
              helperText={errors[index]?.cpiOverride}
              sx={{ width: '100px' }}
            />

            <TextField
              size="small"
              value={row.dailyBudget}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                handleChange(index, 'dailyBudget', formatCurrency(value));
              }}
              error={!!errors[index]?.dailyBudget}
              helperText={errors[index]?.dailyBudget}
              sx={{ width: '120px' }}
            />

            <TextField
              size="small"
              value={row.dailyCap}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                handleChange(index, 'dailyCap', formatNumber(value));
              }}
              error={!!errors[index]?.dailyCap}
              helperText={errors[index]?.dailyCap}
              sx={{ width: '100px' }}
            />

            <TextField
              size="small"
              value={row.clientOfferName}
              onChange={(e) => handleChange(index, 'clientOfferName', e.target.value.replace(/\s/g, ''))}
              error={!!errors[index]?.clientOfferName}
              helperText={errors[index]?.clientOfferName}
              sx={{ width: '200px' }}
            />

            <IconButton
              color="error"
              onClick={() => deleteRow(index)}
              disabled={rows.length === 1}
              sx={{ mt: 0.5 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            startIcon={<AddIcon />}
            onClick={addRow}
            variant="outlined"
          >
            Add Offer
          </Button>
        </Box>

        {errors.general && (
          <Box mt={2}>
            <Typography color="error" align="center">{errors.general}</Typography>
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
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DoctorAdminPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [formData, setFormData] = useState({});

  const tables = [
    { name: 'patients', fields: ['name', 'email', 'phone', 'age', 'gender', 'address'] },
    { name: 'prescriptions', fields: ['patientId', 'doctorId', 'date', 'diagnosis', 'medicines', 'instructions'] },
    { name: 'pains', fields: ['name', 'description', 'severity'] },
    { name: 'treatments', fields: ['name', 'description', 'duration', 'cost'] },
    { name: 'doctors', fields: ['name', 'email', 'phone', 'specialization', 'experience', 'qualification'] }
  ];

  const handleTableClick = (table) => {
    setSelectedTable(table.name);
    const initialFormData = {};
    table.fields.forEach(field => {
      initialFormData[field] = '';
    });
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTable('');
    setFormData({});
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, selectedTable), formData);
      alert(`Successfully added to ${selectedTable}`);
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error adding document: ' + error.message);
    }
  };

  const getCurrentFields = () => {
    const table = tables.find(t => t.name === selectedTable);
    return table ? table.fields : [];
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Admin Table Editor
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Click on a table name to add new records
        </Typography>
        
        <List>
          {tables.map((table) => (
            <ListItem
              key={table.name}
              button
              onClick={() => handleTableClick(table)}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {table.name}
                  </Typography>
                }
                secondary={`Fields: ${table.fields.join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textTransform: 'capitalize' }}>
          Add New {selectedTable} Record
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {getCurrentFields().map((field) => (
                <Grid item xs={12} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorAdminPage;

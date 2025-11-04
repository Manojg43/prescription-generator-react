import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const DoctorAdminPage = () => {
  const [treatment, setTreatment] = useState('');
  const [pain, setPain] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dose, setDose] = useState('');

  const [treatments, setTreatments] = useState([]);
  const [pains, setPains] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doses, setDoses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const treatmentsSnapshot = await getDocs(collection(db, 'treatments'));
      setTreatments(treatmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const painsSnapshot = await getDocs(collection(db, 'pains'));
      setPains(painsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const medicinesSnapshot = await getDocs(collection(db, 'medicines'));
      setMedicines(medicinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const dosesSnapshot = await getDocs(collection(db, 'doses'));
      setDoses(dosesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addTreatment = async () => {
    if (treatment.trim()) {
      try {
        await addDoc(collection(db, 'treatments'), { name: treatment });
        setTreatment('');
        fetchData();
      } catch (error) {
        console.error('Error adding treatment:', error);
      }
    }
  };

  const addPain = async () => {
    if (pain.trim()) {
      try {
        await addDoc(collection(db, 'pains'), { name: pain });
        setPain('');
        fetchData();
      } catch (error) {
        console.error('Error adding pain:', error);
      }
    }
  };

  const addMedicine = async () => {
    if (medicine.trim()) {
      try {
        await addDoc(collection(db, 'medicines'), { name: medicine });
        setMedicine('');
        fetchData();
      } catch (error) {
        console.error('Error adding medicine:', error);
      }
    }
  };

  const addDose = async () => {
    if (dose.trim()) {
      try {
        await addDoc(collection(db, 'doses'), { name: dose });
        setDose('');
        fetchData();
      } catch (error) {
        console.error('Error adding dose:', error);
      }
    }
  };

  const deleteItem = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const renderList = (title, items, collectionName) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {items.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteItem(collectionName, item.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" color="primary">
        Doctor / Admin Configuration
      </Typography>
      
      <Grid container spacing={3}>
        {/* Treatments Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Treatments
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTreatment()}
              />
              <Button variant="contained" onClick={addTreatment}>
                Add
              </Button>
            </Box>
            {renderList('Available Treatments', treatments, 'treatments')}
          </Paper>
        </Grid>

        {/* Pains Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Pains
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Pain"
                value={pain}
                onChange={(e) => setPain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPain()}
              />
              <Button variant="contained" onClick={addPain}>
                Add
              </Button>
            </Box>
            {renderList('Available Pains', pains, 'pains')}
          </Paper>
        </Grid>

        {/* Medicines Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Medicines
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Medicine"
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMedicine()}
              />
              <Button variant="contained" onClick={addMedicine}>
                Add
              </Button>
            </Box>
            {renderList('Available Medicines', medicines, 'medicines')}
          </Paper>
        </Grid>

        {/* Doses Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Doses
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Dose"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDose()}
              />
              <Button variant="contained" onClick={addDose}>
                Add
              </Button>
            </Box>
            {renderList('Available Doses', doses, 'doses')}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorAdminPage;

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import jsPDF from 'jspdf';
// Material UI imports
import { AppBar, Toolbar, Typography, Container, Paper, Table, TableHead, TableBody, TableRow, TableCell, TextField, Button, IconButton, Box, Avatar, MenuItem, Select, InputLabel, FormControl, CircularProgress, Card, CardContent, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Grid, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

const hospitalLogo = null; // Replace with your logo import if available
const DOCTOR_NAME = 'Dr. Ambadas Gajul, BAMS';
const HOSPITAL_ADDRESS = '1123, New Paccha Pet, Solapur';

function App() {
  // STATE INITIALIZATION
  const [searchPatient, setSearchPatient] = useState('');
  const [patientData, setPatientData] = useState({ name: '', contact: '', address: '', pain: '', treatment: '' });
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([{ name: '', dose: '' }]);
  const [savedMedicines, setSavedMedicines] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // FUNCTION DEFINITIONS
  useEffect(() => {
    getAllPatients();
    getAllMedicines();
  }, []);

  const getAllPatients = async () => {
    setLoadingPatients(true);
    try {
      const snapshot = await getDocs(collection(db, 'patients'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(list);
    } catch (err) {
      setPatients([]);
    }
    setLoadingPatients(false);
  };

  const getAllMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'medicines'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedMedicines(list);
    } catch (err) {
      setSavedMedicines([]);
    }
  };

  const searchPatientByName = () => {
    if (!searchPatient) {
      getAllPatients();
      return;
    }
    const filtered = patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()));
    setPatients(filtered);
  };

  const savePatient = async () => {
    if (!patientData.name) return;
    try {
      await addDoc(collection(db, 'patients'), patientData);
      setPatientData({ name: '', contact: '', address: '', pain: '', treatment: '' });
      getAllPatients();
    } catch (err) {}
  };

  const handleMedicineChange = (idx, value) => {
    const updated = [...medicines];
    updated[idx].name = value;
    setMedicines(updated);
  };

  const handleDoseChange = (idx, value) => {
    const updated = [...medicines];
    updated[idx].dose = value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dose: '' }]);
  };

  const savePrescription = async () => {
    if (!selectedPatient) return;
    const prescription = { date: new Date().toLocaleDateString(), medicines };
    try {
      const patientRef = doc(db, 'patients', selectedPatient.id);
      await updateDoc(patientRef, {
        prescriptions: [...(selectedPatient.prescriptions || []), prescription],
      });
      getAllPatients();
      setMedicines([{ name: '', dose: '' }]);
    } catch (err) {}
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setMedicines([{ name: '', dose: '' }]);
  };

  const downloadPrescription = (prescription) => {
    if (!prescription) return;
    const docPDF = new jsPDF();
    docPDF.text(DOCTOR_NAME, 10, 10);
    docPDF.text(HOSPITAL_ADDRESS, 10, 20);
    docPDF.text(`Date: ${prescription.date}`, 10, 30);
    prescription.medicines.forEach((med, i) => {
      docPDF.text(`${med.name}: ${med.dose}`, 10, 40 + i * 10);
    });
    docPDF.save('prescription.pdf');
  };

  // --- UI below is revamped with Material UI ---
  return (
    <Box bgcolor="#e3f2fd" minHeight="100vh">
      <AppBar color="primary" elevation={3} position="static">
        <Toolbar>
          <Avatar bgcolor="white" mr={2}>
            {hospitalLogo ? <img alt="Logo" src={hospitalLogo} style={{ height: 38 }} /> : <LocalHospitalIcon color="primary" fontSize="large" />}
          </Avatar>
          <Box>
            <Typography fontWeight="bold" variant="h5">{DOCTOR_NAME}</Typography>
            <Typography variant="subtitle2">{HOSPITAL_ADDRESS}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" py={4}>
        {/* Patient Search */}
        <Paper borderRadius elevation={2} mb p sx={{ marginBottom: 2, padding: 2 }}>
          <Typography gutterBottom variant="h6">Search Patient</Typography>
          <Box alignItems="center" display="flex" gap={2}>
            <TextField label="Patient Name" value={searchPatient} onChange={e => setSearchPatient(e.target.value)} sx={{ flex: 1 }} variant="outlined" size="small" InputProps={{ endAdornment: <SearchIcon /> }} />
            <Button color="primary" onClick={searchPatientByName} variant="contained">Search</Button>
          </Box>
        </Paper>
        {/* Add/Edit patient form section */}
        <Card borderRadius mb sx={{ marginBottom: 2 }}>
          <CardHeader title="Patient Information" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <TextField required label="Name" value={patientData.name} onChange={e => setPatientData({ ...patientData, name: e.target.value })} fullWidth variant="outlined" />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField label="Contact" value={patientData.contact} onChange={e => setPatientData({ ...patientData, contact: e.target.value })} fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" value={patientData.address} onChange={e => setPatientData({ ...patientData, address: e.target.value })} fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Pain/Problem" value={patientData.pain} onChange={e => setPatientData({ ...patientData, pain: e.target.value })} fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Treatment" value={patientData.treatment} onChange={e => setPatientData({ ...patientData, treatment: e.target.value })} fullWidth variant="outlined" />
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button color="success" size="medium" startIcon={<AddCircleIcon />} onClick={savePatient} variant="contained">Save Patient</Button>
            </Box>
          </CardContent>
        </Card>
        {/* Prescription section */}
        <Paper borderRadius elevation={2} mb p sx={{ marginBottom: 2, padding: 2 }}>
          <Typography gutterBottom variant="h6">Prescription</Typography>
          <Box>
            {medicines.map((med, idx) => (
              <Grid alignItems="center" container key={idx} mb spacing={2}>
                <Grid item xs={6}>
                  <TextField select label="Medicine Name" value={med.name} onChange={e => handleMedicineChange(idx, e.target.value)} fullWidth>
                    {savedMedicines.map(opt => (
                      <MenuItem key={opt.id} value={opt.name}>{opt.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Dosage" value={med.dose} onChange={e => handleDoseChange(idx, e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="primary" onClick={addMedicine}>
                    <AddCircleIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button color="primary" mt onClick={savePrescription} sx={{ marginTop: 2 }} variant="contained">Save Prescription</Button>
          </Box>
        </Paper>
        {/* Patient Table */}
        <Paper borderRadius elevation={1} mb overflowX p sx={{ marginBottom: 2, padding: 2 }}>
          <Typography gutterBottom variant="h6"><HistoryIcon mr sx={{ verticalAlign: 'middle' }} />Patient List</Typography>
          {loadingPatients ? (
            <Box alignItems="center" display="flex" justifyContent="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((row, idx) => (
                  <TableRow hover key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.contact}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>
                      <Button color="primary" onClick={() => selectPatient(row)} size="small" variant="outlined">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Patient history and prescription download */}
        {selectedPatient && (
          <Paper borderRadius elevation={3} mb p sx={{ marginBottom: 2, padding: 2 }}>
            <Typography gutterBottom variant="h6">{selectedPatient.name} - Prescription History</Typography>
            <List>
              {(selectedPatient.prescriptions || []).map((pres, idx) => (
                <ListItem key={idx} secondaryAction={
                  <IconButton color="primary" edge="end" onClick={() => downloadPrescription(pres)}>
                    <DownloadIcon />
                  </IconButton>
                }>
                  <ListItemText
                    primary={`Date: ${pres.date || ''}`}
                    secondary={pres.medicines.map(m => `${m.name} (${m.dose})`).join(', ')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default App;

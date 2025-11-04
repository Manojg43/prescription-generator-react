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
  // ... retain your state & logic setup ...
  // Paste in all the state/logic from the original file here (to be kept)

  // --- UI below is revamped with Material UI ---
  return (
    <Box sx={{ bgcolor: '#e3f2fd', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
            {hospitalLogo ? <img src={hospitalLogo} alt="Logo" style={{ height: 38 }} /> : <LocalHospitalIcon color="primary" fontSize="large" />}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{DOCTOR_NAME}</Typography>
            <Typography variant="subtitle2">{HOSPITAL_ADDRESS}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Example prescription search & patient search section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Patient
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="Patient Name"
              value={searchPatient}
              onChange={e => setSearchPatient(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{ endAdornment: <SearchIcon /> }}
              variant="outlined"
              size="small"
            />
            <Button onClick={searchPatientByName} variant="contained" color="primary">Search</Button>
          </Box>
        </Paper>

        {/* Add/Edit patient form section */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardHeader title="Patient Information" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  label="Name"
                  value={patientData.name}
                  onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact"
                  value={patientData.contact}
                  onChange={e => setPatientData({ ...patientData, contact: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={patientData.address}
                  onChange={e => setPatientData({ ...patientData, address: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}
              >
                <TextField
                  label="Pain/Problem"
                  value={patientData.pain}
                  onChange={e => setPatientData({ ...patientData, pain: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment"
                  value={patientData.treatment}
                  onChange={e => setPatientData({ ...patientData, treatment: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button variant="contained" color="success" size="medium" startIcon={<AddCircleIcon />}
                onClick={savePatient}
              >Save Patient</Button>
            </Box>
          </CardContent>
        </Card>

        {/* Prescription section - simplified for rewrite, adapt logic as needed */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }} elevation={2}>
          <Typography variant="h6" gutterBottom>Prescription</Typography>
          <Box>
            {medicines.map((med, idx) => (
              <Grid key={idx} container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Medicine Name"
                    value={med.name}
                    onChange={e => handleMedicineChange(idx, e.target.value)}
                    fullWidth
                  >
                    {savedMedicines.map(opt => (
                      <MenuItem value={opt.name} key={opt.id}>{opt.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Dosage"
                    value={med.dose}
                    onChange={e => handleDoseChange(idx, e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="primary" onClick={addMedicine}><AddCircleIcon /></IconButton>
                </Grid>
              </Grid>
            ))}

            <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={savePrescription}>
              Save Prescription
            </Button>
          </Box>
        </Paper>

        {/* Patient Table */}
        <Paper sx={{ borderRadius: 2, overflowX: 'auto', p: 2, mb: 4 }} elevation={1}>
          <Typography variant="h6" gutterBottom><HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Patient List</Typography>
          {loadingPatients ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
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
                  <TableRow key={idx} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.contact}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => selectPatient(row)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Patient history and prescription download */}
        {selectedPatient && (
          <Paper sx={{ p: 3, borderRadius: 2, mb: 6 }} elevation={3}>
            <Typography variant="h6" gutterBottom>{selectedPatient.name} - Prescription History</Typography>
            <List>
              {(selectedPatient.prescriptions || []).map((pres, idx) => (
                <ListItem key={idx}
                  secondaryAction={
                    <IconButton edge="end" color="primary" onClick={() => downloadPrescription(pres)}>
                      <DownloadIcon />
                    </IconButton>
                  }
                >
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

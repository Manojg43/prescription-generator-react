import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';

const PatientPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [selectedPain, setSelectedPain] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  
  const [treatments, setTreatments] = useState([]);
  const [pains, setPains] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doses, setDoses] = useState([]);
  
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [selectedDose, setSelectedDose] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  useEffect(() => {
    fetchMasterData();
    fetchPatients();
  }, []);

  const fetchMasterData = async () => {
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
      console.error('Error fetching master data:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      setPatients(patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const resetPatientFields = () => {
    setSelectedPatient(null);
    setFirstName('');
    setLastName('');
    setAddress('');
    setMobile('');
    setShowAddPatient(false);
    setSelectedPain('');
    setSelectedTreatment('');
  };

  const handleSearchPatient = () => {
    if (mobileNumber.length < 3) {
      resetPatientFields();
      return;
    }

    const patient = patients.find(p => p.mobile === mobileNumber);
    if (patient) {
      setSelectedPatient(patient);
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setAddress(patient.address);
      setMobile(patient.mobile);
      setShowAddPatient(false);
    } else {
      setShowAddPatient(true);
      setSelectedPatient(null);
      setFirstName('');
      setLastName('');
      setAddress('');
      setMobile(mobileNumber);
    }
  };

  const savePatient = async () => {
    try {
      const patientData = {
        firstName,
        lastName,
        address,
        mobile,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'patients'), patientData);
      setSelectedPatient({ id: docRef.id, ...patientData });
      fetchPatients();
      alert('Patient saved successfully!');
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleGeneratePrescription = () => {
    if (!selectedPatient && !firstName) {
      alert('Please add or search for a patient first');
      return;
    }

    if (!selectedPatient) {
      savePatient();
    }

    setShowPrescription(true);
  };

  const addPrescriptionItem = () => {
    if (selectedMedicine && selectedDose) {
      setPrescriptionItems([...prescriptionItems, {
        medicine: selectedMedicine,
        dose: selectedDose
      }]);
      setSelectedMedicine('');
      setSelectedDose('');
    }
  };

  const savePrescription = async () => {
    try {
      const prescriptionData = {
        patientId: selectedPatient?.id,
        patientName: `${firstName} ${lastName}`,
        mobile,
        pain: selectedPain,
        treatment: selectedTreatment,
        medicines: prescriptionItems,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'prescriptions'), prescriptionData);
      alert('Prescription saved successfully!');
      generatePDF();
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Prescription', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Patient Name: ${firstName} ${lastName}`, 20, 40);
    doc.text(`Mobile: ${mobile}`, 20, 50);
    doc.text(`Address: ${address}`, 20, 60);
    doc.text(`Pain: ${selectedPain}`, 20, 70);
    doc.text(`Treatment: ${selectedTreatment}`, 20, 80);
    
    doc.text('Medicines:', 20, 90);
    let yPos = 100;
    prescriptionItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.medicine} - ${item.dose}`, 30, yPos);
      yPos += 10;
    });
    
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos + 10);
    
    doc.save(`prescription_${firstName}_${lastName}_${Date.now()}.pdf`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Patient Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Search Patient
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Search by Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchPatient}
          >
            Search
          </Button>
        </Box>
        {mobileNumber.length >= 3 && patients.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No patients found in the database.
          </Typography>
        )}
      </Paper>

      {(showAddPatient || selectedPatient) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Patient Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!!selectedPatient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!!selectedPatient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={!!selectedPatient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!!selectedPatient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Pain</InputLabel>
                <Select
                  value={selectedPain}
                  onChange={(e) => setSelectedPain(e.target.value)}
                >
                  {pains.map((pain) => (
                    <MenuItem key={pain.id} value={pain.name}>{pain.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Treatment</InputLabel>
                <Select
                  value={selectedTreatment}
                  onChange={(e) => setSelectedTreatment(e.target.value)}
                >
                  {treatments.map((treatment) => (
                    <MenuItem key={treatment.id} value={treatment.name}>{treatment.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {!selectedPatient && (
              <Button variant="contained" onClick={savePatient}>
                Save Patient
              </Button>
            )}
            <Button variant="contained" color="primary" onClick={handleGeneratePrescription}>
              Generate Prescription
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog open={showPrescription} onClose={() => setShowPrescription(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Medicine</InputLabel>
                  <Select
                    value={selectedMedicine}
                    onChange={(e) => setSelectedMedicine(e.target.value)}
                  >
                    {medicines.map((medicine) => (
                      <MenuItem key={medicine.id} value={medicine.name}>{medicine.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Dose</InputLabel>
                  <Select
                    value={selectedDose}
                    onChange={(e) => setSelectedDose(e.target.value)}
                  >
                    {doses.map((dose) => (
                      <MenuItem key={dose.id} value={dose.name}>{dose.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={addPrescriptionItem}>
                  Add Medicine
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              {prescriptionItems.map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.medicine} - ${item.dose}`}
                  onDelete={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrescription(false)}>Cancel</Button>
          <Button variant="contained" onClick={savePrescription}>
            Save & Generate PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientPage;

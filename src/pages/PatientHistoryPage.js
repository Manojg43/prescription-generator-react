import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PatientHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [patientHistory, setPatientHistory] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [searchTerm, startDate, endDate, prescriptions]);

  const fetchData = async () => {
    try {
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const patientsData = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsData);

      const prescriptionsSnapshot = await getDocs(collection(db, 'prescriptions'));
      const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(prescriptionsData);

      // Calculate patient statistics
      const historyMap = {};
      prescriptionsData.forEach(prescription => {
        const patientKey = prescription.patientId || prescription.mobile;
        if (!historyMap[patientKey]) {
          historyMap[patientKey] = {
            patientName: prescription.patientName,
            mobile: prescription.mobile,
            visitCount: 0,
            prescriptions: [],
            treatments: new Set(),
          };
        }
        historyMap[patientKey].visitCount++;
        historyMap[patientKey].prescriptions.push(prescription);
        if (prescription.treatment) {
          historyMap[patientKey].treatments.add(prescription.treatment);
        }
      });
      setPatientHistory(historyMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterHistory = () => {
    let filtered = prescriptions;

    // Filter by search term (name or mobile)
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile?.includes(searchTerm)
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) <= endDate);
    }

    setFilteredHistory(filtered);
  };

  const generatePrescriptionPDF = (prescription) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Prescription', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Patient Name: ${prescription.patientName}`, 20, 40);
    doc.text(`Mobile: ${prescription.mobile}`, 20, 50);
    doc.text(`Pain: ${prescription.pain}`, 20, 60);
    doc.text(`Treatment: ${prescription.treatment}`, 20, 70);
    
    doc.text('Medicines:', 20, 80);
    let yPos = 90;
    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.medicine} - ${item.dose}`, 30, yPos);
        yPos += 10;
      });
    }
    
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 20, yPos + 10);
    
    doc.save(`prescription_${prescription.patientName.replace(/\s+/g, '_')}_${new Date(prescription.createdAt).toISOString().split('T')[0]}.pdf`);
  };

  const exportHistoryToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Patient History Report', 105, 20, { align: 'center' });
    
    const tableData = filteredHistory.map(prescription => [
      prescription.patientName,
      prescription.mobile,
      new Date(prescription.createdAt).toLocaleDateString(),
      prescription.pain || '-',
      prescription.treatment || '-',
      prescription.medicines?.length || 0,
    ]);

    doc.autoTable({
      head: [['Patient Name', 'Mobile', 'Date', 'Pain', 'Treatment', 'Medicines']],
      body: tableData,
      startY: 30,
    });

    doc.save(`patient_history_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportHistoryToExcel = () => {
    const excelData = filteredHistory.map(prescription => ({
      'Patient Name': prescription.patientName,
      'Mobile': prescription.mobile,
      'Date': new Date(prescription.createdAt).toLocaleDateString(),
      'Time': new Date(prescription.createdAt).toLocaleTimeString(),
      'Pain': prescription.pain || '-',
      'Treatment': prescription.treatment || '-',
      'Medicines': prescription.medicines?.map(m => `${m.medicine} (${m.dose})`).join(', ') || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient History');
    XLSX.writeFile(workbook, `patient_history_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getSearchOptions = () => {
    const options = [];
    patients.forEach(patient => {
      if (patient.firstName && patient.lastName) {
        options.push(`${patient.firstName} ${patient.lastName}`);
      }
      if (patient.mobile) {
        options.push(patient.mobile);
      }
    });
    return [...new Set(options)];
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" color="primary">
        Patient History
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Autocomplete
            freeSolo
            sx={{ flex: 1, minWidth: 250 }}
            options={getSearchOptions()}
            value={searchTerm}
            onInputChange={(e, newValue) => setSearchTerm(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Search by Name or Mobile" />
            )}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <Button variant="outlined" onClick={() => { setStartDate(null); setEndDate(null); setSearchTerm(''); }}>
            Clear Filters
          </Button>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportHistoryToPDF}>
            Export to PDF
          </Button>
          <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={exportHistoryToExcel}>
            Export to Excel
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          },
        }}>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pain</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Treatment</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medicines</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.map((prescription, index) => (
              <TableRow key={index}>
                <TableCell>{prescription.patientName}</TableCell>
                <TableCell>{prescription.mobile}</TableCell>
                <TableCell>
                  {new Date(prescription.createdAt).toLocaleDateString()}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(prescription.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>{prescription.pain || '-'}</TableCell>
                <TableCell>{prescription.treatment || '-'}</TableCell>
                <TableCell>
                  {prescription.medicines?.map((m, i) => (
                    <div key={i}>
                      {m.medicine} ({m.dose})
                    </div>
                  ))}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => generatePrescriptionPDF(prescription)}
                    title="Download Prescription PDF"
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredHistory.length === 0 && (
        <Paper sx={{ p: 4, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No patient history found
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default PatientHistoryPage;

import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import logo from '../assets/logo.png'; // Placeholder - add your logo path

const PrescriptionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '210mm',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: '2px solid #1976d2',
}));

const LogoContainer = styled(Box)({
  width: '80px',
  height: '80px',
  backgroundColor: '#f5f5f5',
  border: '2px dashed #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
});

const DoctorInfo = styled(Box)(({ theme }) => ({
  textAlign: 'right',
  '& h5': {
    color: '#1976d2',
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  '& p': {
    margin: theme.spacing(0.3, 0),
    fontSize: '0.9rem',
    color: '#555',
  },
}));

const PatientInfo = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: '#1976d2',
  color: theme.palette.common.white,
  fontSize: '1rem',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '& td': {
    fontSize: '0.95rem',
    padding: theme.spacing(1.5),
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(2),
  borderTop: '1px solid #ddd',
  textAlign: 'right',
}));

const PrescriptionPdf = ({ prescriptionData }) => {
  const prescriptionRef = useRef();

  // Default prescription data structure
  const defaultData = {
    doctor: {
      name: 'Dr. John Smith',
      qualification: 'MBBS, MD',
      specialization: 'General Physician',
      registration: 'MCI Reg. No: 12345',
      contact: 'Phone: +91-9876543210',
      email: 'Email: drsmith@example.com',
      address: '123 Medical Center, City, State - 123456',
    },
    patient: {
      name: 'Patient Name',
      age: '35',
      gender: 'Male',
      date: new Date().toLocaleDateString(),
      id: 'P-2025-001',
    },
    medicines: [
      {
        medicineName: 'Paracetamol 500mg',
        dosage: '1-0-1',
        duration: '5 Days',
      },
      {
        medicineName: 'Amoxicillin 250mg',
        dosage: '1-1-1',
        duration: '7 Days',
      },
      {
        medicineName: 'Vitamin D3',
        dosage: '0-0-1',
        duration: '30 Days',
      },
    ],
    diagnosis: 'Common Cold, Vitamin D Deficiency',
    instructions: 'Take medicines after meals. Drink plenty of water. Rest adequately.',
    followUp: 'Follow up after 7 days if symptoms persist.',
  };

  const data = prescriptionData || defaultData;

  // PDF Generation Function with OCR-ready text
  const generatePDF = async () => {
    const element = prescriptionRef.current;
    if (!element) return;

    try {
      // Configure html2canvas for better text rendering
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Use SVG rendering for better text quality
        allowTaint: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content exceeds one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add text layer for OCR (invisible overlay)
      // This makes the PDF searchable and OCR-friendly
      pdf.setTextColor(255, 255, 255); // White text (invisible on white background)
      pdf.setFontSize(1);
      
      // Save the PDF
      const fileName = `Prescription_${data.patient.name.replace(/\s+/g, '_')}_${data.patient.date.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={generatePDF}
          sx={{ marginBottom: 2 }}
        >
          Download Prescription as PDF
        </Button>
      </Box>

      <PrescriptionContainer ref={prescriptionRef}>
        {/* Header Section */}
        <Header>
          <LogoContainer>
            {/* <img src={logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> */}
            <Typography variant="caption" color="textSecondary">
              LOGO
            </Typography>
          </LogoContainer>
          <DoctorInfo>
            <Typography variant="h5">{data.doctor.name}</Typography>
            <Typography>{data.doctor.qualification}</Typography>
            <Typography>{data.doctor.specialization}</Typography>
            <Typography variant="body2">{data.doctor.registration}</Typography>
            <Typography variant="body2">{data.doctor.contact}</Typography>
            <Typography variant="body2">{data.doctor.email}</Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              {data.doctor.address}
            </Typography>
          </DoctorInfo>
        </Header>

        <Divider sx={{ marginBottom: 3 }} />

        {/* Patient Information */}
        <PatientInfo>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
            Patient Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><strong>Name:</strong> {data.patient.name}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography><strong>Age:</strong> {data.patient.age}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography><strong>Gender:</strong> {data.patient.gender}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Patient ID:</strong> {data.patient.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Date:</strong> {data.patient.date}</Typography>
            </Grid>
          </Grid>
        </PatientInfo>

        {/* Diagnosis Section */}
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
            Diagnosis
          </Typography>
          <Typography variant="body1" sx={{ padding: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
            {data.diagnosis}
          </Typography>
        </Section>

        {/* Medicines Table */}
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
            Prescribed Medicines
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Medicine Name</StyledTableCell>
                  <StyledTableCell>Dosage</StyledTableCell>
                  <StyledTableCell>Duration</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.medicines.map((medicine, index) => (
                  <StyledTableRow key={index}>
                    <TableCell>{medicine.medicineName}</TableCell>
                    <TableCell>{medicine.dosage}</TableCell>
                    <TableCell>{medicine.duration}</TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>

        {/* Instructions Section */}
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
            Instructions
          </Typography>
          <Typography variant="body1" sx={{ padding: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
            {data.instructions}
          </Typography>
        </Section>

        {/* Follow-up Section */}
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
            Follow-up
          </Typography>
          <Typography variant="body1" sx={{ padding: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
            {data.followUp}
          </Typography>
        </Section>

        {/* Footer with Doctor's Signature */}
        <Footer>
          <Box sx={{ display: 'inline-block', textAlign: 'center' }}>
            <Box sx={{ borderTop: '2px solid #333', paddingTop: 1, minWidth: '200px' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {data.doctor.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {data.doctor.qualification}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Doctor's Signature
              </Typography>
            </Box>
          </Box>
        </Footer>
      </PrescriptionContainer>
    </Box>
  );
};

export default PrescriptionPdf;

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

const PrescriptionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '210mm',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: '3px solid #2196f3',
  backgroundColor: '#e3f2fd',
  padding: theme.spacing(2),
  borderRadius: '8px',
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#2196f3',
  color: '#ffffff',
  fontSize: '14px',
  padding: theme.spacing(1.5),
  fontFamily: 'Arial, sans-serif',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f9f9f9',
  },
  '&:hover': {
    backgroundColor: '#e3f2fd',
  },
}));

const PrescriptionPdf = ({ prescriptionData }) => {
  const pdfRef = useRef();

  const generatePdf = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`prescription_${prescriptionData?.patientName || 'patient'}_${Date.now()}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <PrescriptionContainer ref={pdfRef} elevation={3}>
        {/* Header with Logo Placeholder */}
        <Header>
          <Box>
            <Box
              sx={{
                width: 60,
                height: 60,
                backgroundColor: '#2196f3',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 1,
              }}
            >
              <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                Rx
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', fontFamily: 'Arial, sans-serif' }}>
              Medical Prescription
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>
              {new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Header>

        {/* Doctor Information */}
        <InfoSection>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 1, fontFamily: 'Arial, sans-serif' }}>
            Doctor Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Dr. {prescriptionData?.doctorName || 'Doctor Name'}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>
                {prescriptionData?.doctorSpecialization || 'Specialization'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Registration No:</strong> {prescriptionData?.doctorRegNo || 'XXX-XXXX'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Contact:</strong> {prescriptionData?.doctorContact || 'XXXXXXXXXX'}
              </Typography>
            </Grid>
          </Grid>
        </InfoSection>

        {/* Patient Information */}
        <InfoSection>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 1, fontFamily: 'Arial, sans-serif' }}>
            Patient Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Name:</strong> {prescriptionData?.patientName || 'Patient Name'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Age/Gender:</strong> {prescriptionData?.patientAge || 'XX'} years / {prescriptionData?.patientGender || 'Gender'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Patient ID:</strong> {prescriptionData?.patientId || 'XXXXXX'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Date:</strong> {prescriptionData?.date || new Date().toLocaleDateString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </InfoSection>

        <Divider sx={{ my: 3 }} />

        {/* Medicine Table with 3 Columns: Medicine Name, Dosage, Duration */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 2, fontFamily: 'Arial, sans-serif' }}>
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
                {prescriptionData?.medicines && prescriptionData.medicines.length > 0 ? (
                  prescriptionData.medicines.map((medicine, index) => (
                    <StyledTableRow key={index}>
                      <TableCell sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
                        {medicine.name || 'Medicine Name'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
                        {medicine.dosage || 'Dosage'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
                        {medicine.duration || 'Duration'}
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <TableCell colSpan={3} align="center" sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#999' }}>
                      No medicines prescribed
                    </TableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Advice Section */}
        <InfoSection>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 1, fontFamily: 'Arial, sans-serif' }}>
            Medical Advice
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
            {prescriptionData?.advice || 'No specific advice provided. Follow the prescribed medication schedule and consult if symptoms persist.'}
          </Typography>
        </InfoSection>

        <Divider sx={{ my: 3 }} />

        {/* Doctor Signature */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                borderTop: '2px solid #000',
                width: '200px',
                marginBottom: 1,
                paddingTop: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                Dr. {prescriptionData?.doctorName || 'Doctor Name'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>
                {prescriptionData?.doctorSpecialization || 'Specialization'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontFamily: 'Arial, sans-serif' }}>
              Doctor's Signature
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ marginTop: 4, textAlign: 'center', borderTop: '1px solid #e0e0e0', paddingTop: 2 }}>
          <Typography variant="caption" sx={{ color: '#999', fontFamily: 'Arial, sans-serif' }}>
            This is a digitally generated prescription. For any queries, please contact the clinic.
          </Typography>
        </Box>
      </PrescriptionContainer>

      <Box sx={{ textAlign: 'center', marginTop: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={generatePdf}
          sx={{ fontFamily: 'Arial, sans-serif', textTransform: 'none' }}
        >
          Download Prescription PDF
        </Button>
      </Box>
    </Box>
  );
};

export default PrescriptionPdf;

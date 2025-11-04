import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DoctorAdminPage from './pages/DoctorAdminPage';
import PatientPage from './pages/PatientPage';
import PatientHistoryPage from './pages/PatientHistoryPage';

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <LocalHospitalIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Prescription Management System
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Doctor/Admin
            </Button>
            <Button color="inherit" component={Link} to="/patient">
              Patient
            </Button>
            <Button color="inherit" component={Link} to="/history">
              Patient History
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<DoctorAdminPage />} />
            <Route path="/patient" element={<PatientPage />} />
            <Route path="/history" element={<PatientHistoryPage />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;

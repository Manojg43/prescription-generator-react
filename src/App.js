import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { FaUser, FaPhone, FaMapMarkerAlt, FaFileMedical, FaPrescription, FaDownload, FaSearch, FaPills, FaCalendarAlt, FaHistory, FaPlusCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [view, setView] = useState('addPatient');
  const [patientData, setPatientData] = useState({
    name: '',
    address: '',
    contact: '',
    pain: '',
    treatment: ''
  });
  const [searchPatient, setSearchPatient] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dose: '' }]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [savedMedicines, setSavedMedicines] = useState([]);

  useEffect(() => {
    loadSavedMedicines();
  }, []);

  const loadSavedMedicines = async () => {
    try {
      const medicinesRef = collection(db, 'medicines');
      const medicinesSnapshot = await getDocs(medicinesRef);
      const medicinesList = medicinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedMedicines(medicinesList);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmitPatient = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: new Date(),
        prescriptions: []
      });
      alert('Patient added successfully!');
      setPatientData({ name: '', address: '', contact: '', pain: '', treatment: '' });
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient');
    }
  };

  const searchPatientByName = async () => {
    if (!searchPatient.trim()) return;
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, where('name', '>=', searchPatient), where('name', '<=', searchPatient + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const patients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatientHistory(patients);
    } catch (error) {
      console.error('Error searching patient:', error);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setView('prescription');
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);

    if (field === 'name' && value) {
      const suggestions = savedMedicines.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setMedicineSuggestions(suggestions);
    } else {
      setMedicineSuggestions([]);
    }
  };

  const addMedicineField = () => {
    setMedicines([...medicines, { name: '', dose: '' }]);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const prescription = {
        medicines: medicines.filter(m => m.name && m.dose),
        date: new Date()
      };

      const patientRef = doc(db, 'patients', selectedPatient.id);
      const updatedPrescriptions = [...(selectedPatient.prescriptions || []), prescription];
      await updateDoc(patientRef, { prescriptions: updatedPrescriptions });

      for (const medicine of prescription.medicines) {
        const existingMedicine = savedMedicines.find(m => m.name === medicine.name);
        if (!existingMedicine) {
          await addDoc(collection(db, 'medicines'), { name: medicine.name });
        }
      }

      alert('Prescription saved successfully!');
      loadSavedMedicines();
      setMedicines([{ name: '', dose: '' }]);
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription');
    }
  };

  const downloadPrescription = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Prescription', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Patient Name: ${selectedPatient.name}`, 20, 40);
    pdf.text(`Address: ${selectedPatient.address}`, 20, 50);
    pdf.text(`Contact: ${selectedPatient.contact}`, 20, 60);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    pdf.text('Medicines:', 20, 90);

    let yPos = 100;
    medicines.forEach((med, index) => {
      if (med.name && med.dose) {
        pdf.text(`${index + 1}. ${med.name} - ${med.dose}`, 30, yPos);
        yPos += 10;
      }
    });

    pdf.save(`prescription_${selectedPatient.name}_${Date.now()}.pdf`);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1><FaFileMedical /> Prescription Generator</h1>
        <nav>
          <button onClick={() => setView('addPatient')}><FaPlusCircle /> Add Patient</button>
          <button onClick={() => setView('search')}><FaSearch /> Search Patient</button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'addPatient' && (
          <div className="form-container">
            <h2><FaUser /> Add New Patient</h2>
            <form onSubmit={handleSubmitPatient}>
              <div className="form-group">
                <label><FaUser /> Patient Name:</label>
                <input
                  type="text"
                  name="name"
                  value={patientData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><FaMapMarkerAlt /> Address:</label>
                <input
                  type="text"
                  name="address"
                  value={patientData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><FaPhone /> Contact:</label>
                <input
                  type="tel"
                  name="contact"
                  value={patientData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><FaFileMedical /> Pain/Symptoms:</label>
                <textarea
                  name="pain"
                  value={patientData.pain}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><FaPrescription /> Treatment Given:</label>
                <textarea
                  name="treatment"
                  value={patientData.treatment}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn"><FaPlusCircle /> Add Patient</button>
            </form>
          </div>
        )}

        {view === 'search' && (
          <div className="search-container">
            <h2><FaSearch /> Search Patient</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Enter patient name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
              />
              <button onClick={searchPatientByName}><FaSearch /> Search</button>
            </div>
            <div className="patient-list">
              {patientHistory.map(patient => (
                <div key={patient.id} className="patient-card" onClick={() => selectPatient(patient)}>
                  <h3><FaUser /> {patient.name}</h3>
                  <p><FaPhone /> {patient.contact}</p>
                  <p><FaMapMarkerAlt /> {patient.address}</p>
                  <p><FaHistory /> Prescriptions: {patient.prescriptions?.length || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'prescription' && selectedPatient && (
          <div className="prescription-container">
            <h2><FaPrescription /> Generate Prescription</h2>
            <div className="patient-info">
              <h3><FaUser /> {selectedPatient.name}</h3>
              <p><FaPhone /> {selectedPatient.contact}</p>
              <p><FaMapMarkerAlt /> {selectedPatient.address}</p>
            </div>
            <form onSubmit={handleSubmitPrescription}>
              <h3><FaPills /> Medicines</h3>
              {medicines.map((medicine, index) => (
                <div key={index} className="medicine-input">
                  <div className="form-group">
                    <label>Medicine Name:</label>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      required
                    />
                    {medicineSuggestions.length > 0 && (
                      <div className="suggestions">
                        {medicineSuggestions.map((sug, i) => (
                          <div
                            key={i}
                            className="suggestion-item"
                            onClick={() => {
                              handleMedicineChange(index, 'name', sug.name);
                              setMedicineSuggestions([]);
                            }}
                          >
                            {sug.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Dosage:</label>
                    <input
                      type="text"
                      value={medicine.dose}
                      onChange={(e) => handleMedicineChange(index, 'dose', e.target.value)}
                      placeholder="e.g., 1-0-1 or 2 times daily"
                      required
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addMedicineField} className="add-medicine-btn">
                <FaPlusCircle /> Add Another Medicine
              </button>
              <div className="action-buttons">
                <button type="submit" className="submit-btn"><FaPrescription /> Save Prescription</button>
                <button type="button" onClick={downloadPrescription} className="download-btn">
                  <FaDownload /> Download Prescription
                </button>
              </div>
            </form>
            {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
              <div className="prescription-history">
                <h3><FaHistory /> Prescription History</h3>
                {selectedPatient.prescriptions.map((presc, index) => (
                  <div key={index} className="history-item">
                    <p><FaCalendarAlt /> {new Date(presc.date.seconds * 1000).toLocaleDateString()}</p>
                    <ul>
                      {presc.medicines.map((med, i) => (
                        <li key={i}>{med.name} - {med.dose}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

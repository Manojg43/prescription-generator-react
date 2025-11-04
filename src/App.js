import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaFileMedical,
  FaPrescription,
  FaDownload,
  FaSearch,
  FaPills,
  FaCalendarAlt,
  FaHistory,
  FaPlusCircle,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [view, setView] = useState('searchPatient');
  const [patientData, setPatientData] = useState({
    name: '',
    address: '',
    contact: '',
    pain: '',
    treatment: '',
  });
  const [searchPatient, setSearchPatient] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dose: '' }]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [savedMedicines, setSavedMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [registrationDateFilter, setRegistrationDateFilter] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    loadSavedMedicines();
    loadPatients();
  }, []);

  // Load medicines
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
      console.error('Error loading medicines', error);
    }
  };

  // Load all patients (and apply optional date filter)
  const loadPatients = async () => {
    setLoadingPatients(true);
    let patientsRef = collection(db, 'patients');
    let q = query(patientsRef, orderBy('name'));
    if (registrationDateFilter) {
      // Firestore date filter: assumes a 'registrationDate' field of Timestamp
      const date = new Date(registrationDateFilter);
      date.setHours(0,0,0,0);
      q = query(
        patientsRef, 
        where('registrationDate', '>=', date), 
        where('registrationDate', '<', new Date(date.getTime() + 86400000)),
        orderBy('name')
      );
    }
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPatients(result);
    setFilteredPatients(result);
    setLoadingPatients(false);
  };

  // Add patient, check mobile number uniqueness
  const handleAddPatient = async (event) => {
    event.preventDefault();
    // Check mobile uniqueness
    const q = query(collection(db, 'patients'), where('contact', '==', patientData.contact));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      alert('Patient with this mobile number already exists.');
      return;
    }
    await addDoc(collection(db, 'patients'), {
      ...patientData,
      registrationDate: new Date(),
      prescriptions: []
    });
    setPatientData({ name: '', address: '', contact: '', pain: '', treatment: '' });
    loadPatients();
    alert('Patient added successfully.');
  };

  // Search logic: live suggestions as typing (no validation) and filter in table
  useEffect(() => {
    if (searchPatient.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lower = searchPatient.toLowerCase();
      setFilteredPatients(
        patients.filter(
          p => p.name && p.name.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchPatient, patients]);

  // Select a patient to view history or prescribe
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
  };

  // Responsive table rendering for patients
  const PatientTable = ({ list }) => (
    <div className="patient-table-wrapper">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Pain</th>
            <th>Treatment</th>
            <th>Register Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.contact}</td>
              <td>{p.address}</td>
              <td>{p.pain}</td>
              <td>{p.treatment}</td>
              <td>{p.registrationDate && (new Date(p.registrationDate.seconds ? p.registrationDate.seconds * 1000 : p.registrationDate)).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleSelectPatient(p)} className="action-btn">View/Add Prescription</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Add prescription
  const handleAddPrescription = async (event) => {
    event.preventDefault();
    if (!selectedPatient) return;
    const patientDoc = doc(db, 'patients', selectedPatient.id);
    const updatedPrescriptions = [
      ...((selectedPatient.prescriptions) || []),
      {
        date: new Date(),
        medicines: medicines.filter(m => m.name)
      }
    ];
    await updateDoc(patientDoc, { prescriptions: updatedPrescriptions });
    // Update in local state
    setSelectedPatient({...selectedPatient, prescriptions: updatedPrescriptions });
    setMedicines([{ name: '', dose: '' }]);
    alert('Prescription added');
    loadPatients();
  };

  // Download button for prescription PDF
  const downloadPrescription = (presc, pat) => {
    const docPdf = new jsPDF();
    docPdf.text(`Patient: ${pat.name}\nMobile: ${pat.contact}\nDate: ${new Date(presc.date.seconds ? presc.date.seconds * 1000 : presc.date).toLocaleDateString()}`, 10, 10);
    let y = 30;
    presc.medicines.forEach((med, i) => {
      docPdf.text(`${i + 1}. ${med.name} - ${med.dose}`, 10, y);
      y += 10;
    });
    docPdf.save(`${pat.name}_prescription_${new Date().getTime()}.pdf`);
  };

  // Medicines suggestion logic
  const handleMedicineInput = (val) => {
    if (!val) setMedicineSuggestions([]);
    else setMedicineSuggestions(
      savedMedicines.filter(m => m.name && m.name.toLowerCase().includes(val.toLowerCase()))
    );
  };

  // Date filter change
  const handleDateFilterChange = (e) => {
    setRegistrationDateFilter(e.target.value);
  };
  useEffect(() => {
    loadPatients();
  }, [registrationDateFilter]);

  // UI Components
  return (
    <div className="App">
      <main>
        <h2 className="title">Prescription Generator</h2>
        <div className="nav">
          <button onClick={() => setView('addPatient')} className={view==='addPatient'?'active-btn':''}>Add Patient</button>
          <button onClick={() => setView('searchPatient')} className={view==='searchPatient'?'active-btn':''}>Search Patient</button>
        </div>

        {/* Add Patient Form */}
        {view==='addPatient' && (
          <form className="patient-form" onSubmit={handleAddPatient}>
            <div className="form-row">
              <input type="text" placeholder="Patient Name" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value })} required />
              <input type="text" placeholder="Mobile Number (Primary Key)" value={patientData.contact} onChange={e => setPatientData({...patientData, contact: e.target.value })} required />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Address" value={patientData.address} onChange={e => setPatientData({...patientData, address: e.target.value })}/>
              <input type="text" placeholder="Pain" value={patientData.pain} onChange={e => setPatientData({...patientData, pain: e.target.value })}/>
            </div>
            <input type="text" placeholder="Treatment" value={patientData.treatment} onChange={e => setPatientData({...patientData, treatment: e.target.value })}/>
            <button type="submit">Add Patient</button>
          </form>
        )}

        {/* Search Patient UI*/}
        {view === 'searchPatient' && (
          <div className="search-wrapper">
            <div className="search-row">
              <input
                type="text"
                placeholder="Search patient name... (no validation, live suggestions)"
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                className="search-input"
              />
              {/* Suggestions dropdown, always visible if typing */}
              {searchPatient && (
                <div className="suggestion-list">
                  {filteredPatients.map((p, i) => (
                    <div key={p.id} className="suggestion-item" onClick={() => setSearchPatient(p.name)}>
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
              <input type="date" value={registrationDateFilter} onChange={handleDateFilterChange} className="date-filter" />
            </div>

            {/* Responsive row/table format for all patients, showing all at start */}
            {loadingPatients ? (
              <div>Loading Patients...</div>
            ) : (
              <PatientTable list={filteredPatients} />
            )}
          </div>
        )}

        {/* Prescription and history for selected patient */}
        {selectedPatient && (
          <div className="selected-patient-wrapper">
            <h3>Patient: {selectedPatient.name}</h3>
            <form className="prescription-form" onSubmit={handleAddPrescription}>
              <div className="medicine-fields">
                {medicines.map((med, idx) => (
                  <div key={idx} className="medicine-row">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={e => {
                        let meds = [...medicines];
                        meds[idx].name = e.target.value;
                        setMedicines(meds);
                        handleMedicineInput(e.target.value);
                      }}
                    />
                    {/* Medicine suggestions dropdown */}
                    {medicineSuggestions.length > 0 && idx === medicines.length -1 && (
                      <div className="suggestions-dropdown">
                        {medicineSuggestions.map((sug,i) => (
                          <div key={i} className="suggestion-item" onClick={() => {
                            let meds = [...medicines];
                            meds[idx].name = sug.name;
                            setMedicines(meds);
                            setMedicineSuggestions([]);
                          }}>{sug.name}</div>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1-0-1)"
                      value={med.dose}
                      onChange={e => {
                        let meds = [...medicines];
                        meds[idx].dose = e.target.value;
                        setMedicines(meds);
                      }}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => setMedicines([...medicines, { name: '', dose: '' }])} className="add-medicine-btn"><FaPlusCircle /> Add Another Medicine</button>
              </div>
              <button type="submit" className="submit-btn"><FaPrescription /> Save Prescription</button>
            </form>
            {/* Patient history in row/table format with download buttons */}
            {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
              <div className="prescription-history">
                <h3><FaHistory /> Prescription History</h3>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Medicines</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.prescriptions.map((presc, idx) => (
                      <tr key={idx}>
                        <td>{new Date(presc.date.seconds ? presc.date.seconds * 1000 : presc.date).toLocaleDateString()}</td>
                        <td>{presc.medicines.map(m => `${m.name} (${m.dose})`).join(', ')}</td>
                        <td><button className="download-btn" onClick={() => downloadPrescription(presc, selectedPatient)}><FaDownload /> Download</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { FaUser, FaPhone, FaMapMarkerAlt, FaFileMedical, FaPrescription, FaDownload, FaSearch, FaPills, FaCalendarAlt, FaHistory, FaPlusCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [view, setView] = useState('searchPatient');
  const [patientData, setPatientData] = useState({ name: '', address: '', contact: '', pain: '', treatment: '' });
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

  // Dose dropdown feature
  const [doseDropdown, setDoseDropdown] = useState([]); // Store all doses entered
  const [newDoseInput, setNewDoseInput] = useState('');

  // Debounce handling for search optimization
  const debounceTimer = useRef(null);

  useEffect(() => {
    loadSavedMedicines();
    loadPatients();
  }, []);

  // Load medicines
  const loadSavedMedicines = async () => {
    try {
      const medicinesRef = collection(db, 'medicines');
      const medicinesSnapshot = await getDocs(medicinesRef);
      const medicinesList = medicinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  // Improved filtering logic with debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      let input = '';
      if (view === 'addPatient') {
        input = patientData.contact.trim();
      } else {
        input = searchPatient.trim();
      }

      if (input === '') {
        setFilteredPatients(patients);
      } else {
        const isMobileNumberInput = /^[0-9]+$/.test(input);
        let matches;
        // Allow partial match and quick results (lower computation)
        if (isMobileNumberInput) {
          matches = patients.filter(
            p => p.contact && p.contact.includes(input)
                || p.name && p.name.toLowerCase().includes(input)
          );
        } else {
          const lower = input.toLowerCase();
          matches = patients.filter(
            p => p.name && p.name.toLowerCase().includes(lower)
                || p.contact && p.contact.includes(lower)
          );
        }
        setFilteredPatients(matches.length === 0 ? patients : matches);
      }
    }, 250); // Lower debounce delay for snappier UX
    return () => clearTimeout(debounceTimer.current);
  }, [searchPatient, patientData.contact, patients, view]);

  // Add patient, check mobile number uniqueness and allow suggestion fill
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

  // Fill Add Patient from suggestion
  const fillPatientFromSuggestion = (p) => {
    setPatientData({
      name: p.name || '',
      address: p.address || '',
      contact: p.contact || '',
      pain: p.pain || '',
      treatment: p.treatment || '',
    });
  };

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
                <button className="action-btn" onClick={() => handleSelectPatient(p)}>
                  View/Add Prescription
                </button>
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

  // Dose entry and dropdown handling
  const handleAddDose = () => {
    if (newDoseInput && !doseDropdown.includes(newDoseInput)) {
      setDoseDropdown([...doseDropdown, newDoseInput]);
      setNewDoseInput('');
    }
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
          <button
            className={view === 'addPatient' ? 'active-btn' : ''}
            onClick={() => setView('addPatient')}
          >
            Add Patient
          </button>
          <button
            className={view === 'searchPatient' ? 'active-btn' : ''}
            onClick={() => setView('searchPatient')}
          >
            Search Patient
          </button>
        </div>
        {/* Add Patient Form */}
        {view === 'addPatient' && (
          <form className="patient-form" onSubmit={handleAddPatient}>
            <div className="form-row">
              <input
                placeholder="Patient Name"
                type="text"
                value={patientData.name}
                onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                required
              />
              {/* MOBILE NUMBER WITH SUGGESTION DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="Mobile Number (Primary Key)"
                  type="text"
                  value={patientData.contact}
                  onChange={e => setPatientData({ ...patientData, contact: e.target.value })}
                  required
                />
                {/* Suggestions dropdown for patient mobile/name during Add */}
                {patientData.contact && filteredPatients.length > 0 && (
                  <div className="suggestion-list" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 2, background: '#fff', width: '100%' }}>
                    {filteredPatients.map((p, i) => (
                      <div
                        className="suggestion-item"
                        key={p.id}
                        style={{ cursor: 'pointer', padding: '4px' }}
                        onClick={() => fillPatientFromSuggestion(p)}
                      >
                        {p.name} ({p.contact})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <input
                placeholder="Address"
                type="text"
                value={patientData.address}
                onChange={e => setPatientData({ ...patientData, address: e.target.value })}
              />
              <input
                placeholder="Pain"
                type="text"
                value={patientData.pain}
                onChange={e => setPatientData({ ...patientData, pain: e.target.value })}
              />
            </div>
            <input
              placeholder="Treatment"
              type="text"
              value={patientData.treatment}
              onChange={e => setPatientData({ ...patientData, treatment: e.target.value })}
            />
            <PatientTable list={filteredPatients} />
            <button type="submit">Add Patient</button>
          </form>
        )}
        {/* Search Patient UI*/}
        {view === 'searchPatient' && (
          <div className="search-wrapper">
            <div className="search-row">
              <input
                type="text"
                placeholder="Search patient name or mobile... (live, no validation)"
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                className="search-input"
              />
              {searchPatient && (
                <div className="suggestion-list">
                  {filteredPatients.map((p, i) => (
                    <div className="suggestion-item" key={p.id} onClick={() => setSearchPatient(p.name)}>
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
              <input className="date-filter" type="date" value={registrationDateFilter} onChange={handleDateFilterChange} />
            </div>
            {/* Patient Table below search (shows filteredPatients) */}
            {loadingPatients ? (
              <p>Loading Patients...</p>
            ) : (
              <PatientTable list={filteredPatients} />
            )}
          </div>
        )}
        {/* Prescription and history for selected patient */}
        {selectedPatient && (
          <div className="selected-patient-wrapper">
            <div>Patient: {selectedPatient.name}</div>
            <form className="prescription-form" onSubmit={handleAddPrescription}>
              <div className="medicine-fields">
                {medicines.map((med, idx) => (
                  <div className="medicine-row" key={idx}>
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
                    {medicineSuggestions.length > 0 && idx === medicines.length - 1 && (
                      <div className="suggestions-dropdown">
                        {medicineSuggestions.map((sug, i) => (
                          <div className="suggestion-item" key={i} onClick={() => {
                            let meds = [...medicines];
                            meds[idx].name = sug.name;
                            setMedicines(meds);
                            setMedicineSuggestions([]);
                          }}>
                            {sug.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Dose input and dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1-0-1)"
                        value={med.dose}
                        onChange={e => {
                          let meds = [...medicines];
                          meds[idx].dose = e.target.value;
                          setMedicines(meds);
                          setNewDoseInput(e.target.value);
                        }}
                        list={`dose-dropdown-${idx}`}
                      />
                      <button type="button" style={{ marginLeft: 4 }} onClick={handleAddDose}>
                        Add Dose
                      </button>
                      <select
                        style={{ marginLeft: 4 }}
                        value={med.dose}
                        onChange={e => {
                          let meds = [...medicines];
                          meds[idx].dose = e.target.value;
                          setMedicines(meds);
                        }}
                      >
                        <option value="">Select dose</option>
                        {doseDropdown.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-medicine-btn" onClick={() => setMedicines([...medicines, { name: '', dose: '' }])}>Add Another Medicine</button>
              </div>
              <button className="submit-btn" type="submit">Save Prescription</button>
            </form>
            {/* Patient history in row/table format with download buttons */}
            {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
              <div className="prescription-history">
                <div>

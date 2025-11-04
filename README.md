# Prescription Generator - Multi-Page Hospital Management System

A comprehensive hospital prescription management system built with React, Material-UI, and Firebase. This application is organized into three distinct pages for managing treatments, patients, and patient history.

## 🎯 Multi-Page Architecture

The application has been refactored into three main pages:

### 1. Doctor/Admin Configuration Page (`/`)
- **Purpose**: Predefine and manage master data for the system
- **Features**:
  - Add and manage **Treatments** (stored in `treatments` collection)
  - Add and manage **Pains** (stored in `pains` collection)
  - Add and manage **Medicines** (stored in `medicines` collection)
  - Add and manage **Doses** (stored in `doses` collection)
  - Delete functionality for all master data items
  - Real-time updates from Firebase

### 2. Patient Management Page (`/patient`)
- **Purpose**: Patient registration and prescription generation
- **Features**:
  - **Dynamic Patient Search**: Search by mobile number with autocomplete
  - **Auto-fill Patient Data**: Automatically fills patient details if mobile number exists in database
  - **New Patient Registration**: Add new patients if mobile number not found
  - **Patient Fields**: First name, Last name, Address, Mobile number
  - **Treatment Selection**: Select pain and treatment from predefined options
  - **Prescription Generation**: 
    - Select medicines and doses from dropdown lists (pre-populated from database)
    - Add multiple medicine-dose combinations
    - Save prescription with patient name, date & time to database
    - Auto-download prescription as PDF

### 3. Patient History Page (`/history`)
- **Purpose**: View and manage patient visit history
- **Features**:
  - **Dynamic Search**: Search by first name, last name, or mobile number (results appear without pressing Enter)
  - **Patient Statistics**: Display visit count, treatments given, prescriptions for each patient
  - **Date Filter**: Filter patient history by date range using Material-UI date pickers
  - **Attractive Table UI**: Material-UI table with hover effects showing:
    - Patient name
    - Mobile number
    - Visit date & time
    - Pain diagnosed
    - Treatment given
    - Medicines prescribed
  - **Export Options**:
    - Export to PDF with jsPDF and autotable
    - Export to Excel using xlsx library
  - **Individual Prescription Download**: Click icon to download specific prescription as PDF

## 🗄️ Database Collections

The application uses Firebase Firestore with the following collections:

1. **treatments** - Stores treatment options
   - Fields: `name`, `id`

2. **pains** - Stores pain/symptom options
   - Fields: `name`, `id`

3. **medicines** - Stores medicine names
   - Fields: `name`, `id`

4. **doses** - Stores dosage options
   - Fields: `name`, `id`

5. **patients** - Stores patient information
   - Fields: `firstName`, `lastName`, `address`, `mobile`, `createdAt`

6. **prescriptions** - Stores prescription records
   - Fields: `patientId`, `patientName`, `mobile`, `pain`, `treatment`, `medicines[]`, `createdAt`

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **UI Framework**: Material-UI (@mui/material) 5.14.0
- **Icons**: Material-UI Icons (@mui/icons-material) 5.14.0
- **Routing**: React Router DOM 6.20.1
- **Database**: Firebase Firestore 10.7.1
- **Date Pickers**: @mui/x-date-pickers 6.18.0 with date-fns 2.30.0
- **PDF Generation**: jsPDF 2.5.1 with jspdf-autotable 3.8.2
- **Excel Export**: xlsx 0.18.5
- **Styling**: Emotion (@emotion/react, @emotion/styled)

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- A Firebase account

## 🔧 Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a Project"
3. Enter your project name (e.g., "prescription-generator")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Firestore Database
1. In your Firebase project, navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode"
4. Select your preferred location
5. Click "Enable"

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Configure Firebase in Your App
Replace the configuration in `src/firebase.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Manojg43/prescription-generator-react.git
cd prescription-generator-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
- Update `src/firebase.js` with your Firebase credentials (see Firebase Setup above)

4. **Start the development server**
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## 📱 Application Usage

### First Time Setup
1. **Navigate to Doctor/Admin Page** (`/`)
2. **Add Master Data**:
   - Add common treatments (e.g., "Physiotherapy", "Medication", "Surgery")
   - Add pain types (e.g., "Back Pain", "Headache", "Joint Pain")
   - Add medicines (e.g., "Paracetamol", "Ibuprofen", "Aspirin")
   - Add doses (e.g., "1-0-1", "0-1-0", "1-1-1")

### Adding a New Patient
1. **Navigate to Patient Page** (`/patient`)
2. **Enter mobile number** in search field
3. If patient doesn't exist:
   - Click "Add Patient" button
   - Fill in First Name, Last Name, Address
   - Select Pain and Treatment
   - Click "Save Patient"
4. **Generate Prescription**:
   - Click "Generate Prescription" button
   - Select Medicine from dropdown
   - Select Dose from dropdown
   - Click "Add Medicine"
   - Repeat for multiple medicines
   - Click "Save & Generate PDF"
5. Prescription is automatically downloaded and saved to database

### Viewing Patient History
1. **Navigate to Patient History Page** (`/history`)
2. **Search for patient** by name or mobile number
3. **Filter by date range** (optional)
4. **View complete history** in the table
5. **Export options**:
   - Click "Export to PDF" for complete filtered history
   - Click "Export to Excel" for spreadsheet format
   - Click PDF icon on any row to download that specific prescription

## 🎨 Features Highlights

### Material-UI Design
- Clean, professional interface with Material-UI components
- Responsive layout that works on all devices
- Attractive table with hover effects
- Intuitive navigation with AppBar

### Smart Search & Autocomplete
- Real-time patient search without form submission
- Autocomplete suggestions for patient mobile numbers
- Dynamic search in history page

### Date & Time Tracking
- All patient registrations timestamped
- All prescriptions timestamped
- Date filter for historical data
- Display of visit count per patient

### PDF & Excel Export
- Individual prescription PDF generation
- Bulk history export to PDF with tables
- Excel export with complete prescription details
- Professional PDF formatting with jsPDF

## 📂 Project Structure

```
prescription-generator-react/
├── public/
├── src/
│   ├── pages/
│   │   ├── DoctorAdminPage.js      # Master data management
│   │   ├── PatientPage.js          # Patient registration & prescriptions
│   │   └── PatientHistoryPage.js   # History view & export
│   ├── App.js                      # Main app with routing
│   ├── App.css
│   ├── firebase.js                 # Firebase configuration
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🔄 Recent Updates

**Multi-page upgrade**: 
- ✅ Doctor/admin treatment setup with CRUD operations
- ✅ Patient add/search/prescribe UI with autocomplete
- ✅ History search/export with PDF and Excel functionality
- ✅ Material-UI components throughout
- ✅ Firebase Firestore integration for all collections
- ✅ Date range filtering
- ✅ Auto-download prescriptions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Manojg43

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- Firebase for the real-time database
- jsPDF and xlsx for export functionality

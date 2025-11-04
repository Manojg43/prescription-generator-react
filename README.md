# Prescription Generator - Hospital Management System

A comprehensive hospital prescription management system built with React and Firebase. This application manages patient data, medical history, prescriptions, and treatment records with an intuitive UI and auto-suggest features for medicines.

## Features

- **Patient Management**: Add and manage patient information including name, address, contact details, symptoms, and initial treatment
- **Patient Search**: Search patients by name and view their complete medical history
- **Prescription Generation**: Create prescriptions with multiple medicines and dosages
- **Medicine Auto-Suggest**: Smart auto-complete for medicine names based on previously entered medicines
- **Prescription History**: View patient's complete prescription history organized by date
- **Download Prescriptions**: Generate and download prescriptions as PDF files
- **Time-based History**: Filter patient history by day, week, month, or year
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Icon-based UI**: Intuitive interface with React Icons for better user experience

## Tech Stack

- **Frontend**: React 18.2.0
- **Database**: Firebase Firestore
- **Styling**: CSS3 with modern gradients and animations
- **Icons**: React Icons (react-icons)
- **PDF Generation**: jsPDF
- **Routing**: React Router DOM

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- A Firebase account

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add Project" or "Create a Project"
3. Enter your project name (e.g., "prescription-generator")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Select "Start in test mode" (for development) or "Start in production mode" (for production)
4. Choose a Firestore location (select the one closest to your users)
5. Click "Enable"

### 3. Get Firebase Configuration

1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project Settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "prescription-generator-web")
6. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 4. Configure Firebase in the Project

1. Open `src/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 5. Firestore Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    match /medicines/{medicineId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Manojg43/prescription-generator-react.git
cd prescription-generator-react
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Update the Firebase configuration in `src/firebase.js` with your Firebase project credentials (see Firebase Setup section above).

### 4. Start the development server

```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.

## Usage Guide

### Adding a Patient

1. Click on the "Add Patient" button in the navigation
2. Fill in the patient details:
   - Patient Name
   - Address
   - Contact Number
   - Pain/Symptoms
   - Treatment Given
3. Click "Add Patient" button to save

### Searching for a Patient

1. Click on the "Search Patient" button in the navigation
2. Enter the patient's name in the search box
3. Click the "Search" button
4. Click on a patient card to view their details and generate prescriptions

### Generating a Prescription

1. Search and select a patient
2. In the prescription form:
   - Enter medicine name (auto-suggestions will appear if the medicine was previously used)
   - Enter dosage (e.g., "1-0-1" or "2 times daily")
   - Click "Add Another Medicine" to add more medicines
3. Click "Save Prescription" to save to the database
4. Click "Download Prescription" to generate a PDF

### Viewing Prescription History

1. After selecting a patient, scroll down to see "Prescription History"
2. View all previous prescriptions with dates and medicines
3. Filter history by day, week, month, or year (feature to be implemented)

## Database Structure

### Patients Collection

```javascript
{
  name: "John Doe",
  address: "123 Main St, City",
  contact: "1234567890",
  pain: "Headache and fever",
  treatment: "Rest and medication",
  createdAt: Timestamp,
  prescriptions: [
    {
      medicines: [
        { name: "Paracetamol", dose: "1-0-1" },
        { name: "Amoxicillin", dose: "1-1-1" }
      ],
      date: Timestamp
    }
  ]
}
```

### Medicines Collection

```javascript
{
  name: "Paracetamol"
}
```

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Build the project:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy
```

### Deploy to Other Platforms

You can also deploy to:
- Vercel
- Netlify
- GitHub Pages
- Heroku

Follow the respective platform's deployment documentation for React applications.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have any questions or run into issues, please open an issue on GitHub.

## Acknowledgments

- React team for the amazing framework
- Firebase team for the excellent backend services
- React Icons for the beautiful icon library
- jsPDF for PDF generation capabilities

---

**Made with ❤️ for healthcare professionals**

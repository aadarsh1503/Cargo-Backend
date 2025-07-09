import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

// Import your page and component files

import ExcelUploadPanel from './components/ExcelUploadPanel/ExcelUploadPanel';

// Import the main CSS file
import './App.css';
import LoginPage from './components/Login/LoginPage';
import SignupPage from './components/Signup/SignupPage';
import { Toaster } from 'react-hot-toast'; 

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


const DashboardWrapper = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  
    navigate('/login');
  };

  return <ExcelUploadPanel onLogout={handleLogout} />;
};



function App() {
  return (
    <Router>
      <div>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Default options for all toasts
          duration: 5000,
        }}
      />
        <Routes>
    
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

     
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />
          

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

       
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
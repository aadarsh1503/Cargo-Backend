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

// ===================================================================
// Helper Component: ProtectedRoute
// This component checks if a user is authenticated (by checking for a token).
// If they are, it renders the requested page (the `children`).
// If not, it redirects them to the login page.
// ===================================================================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ===================================================================
// Helper Component: DashboardWrapper
// This component's purpose is to provide the `onLogout` function
// to the ExcelUploadPanel, so we don't have to put routing logic
// inside the panel itself.
// ===================================================================
const DashboardWrapper = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate back to the login page after logout
    navigate('/login');
  };

  return <ExcelUploadPanel onLogout={handleLogout} />;
};


// ===================================================================
// Main App Component
// This is where the entire application's routing is defined.
// ===================================================================
function App() {
  return (
    <Router>
      <div> {/* Or your preferred background */}
        <Routes>
          {/* === PUBLIC ROUTES === */}
          {/* These routes are accessible to everyone. */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* === PROTECTED ROUTE === */}
          {/* This route is only accessible to authenticated users. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />
          
          {/* === REDIRECTS === */}
          {/* If a user goes to the root URL '/', redirect them.
              The ProtectedRoute will handle sending them to /login if not authenticated. */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* A catch-all route to handle any other URL the user might type. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
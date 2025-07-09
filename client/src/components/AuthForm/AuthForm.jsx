import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import "./s.css"
// Reusable spinner component
const Spinner = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);

const AuthForm = ({
  title,
  buttonText,
  onSubmit,
  isSignup = false,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // The actual login/signup logic is passed via the onSubmit prop
      await onSubmit(username, password);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `An error occurred.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignup && (
            <div className="input-group">
              <input
                type="password"
                className="auth-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <Spinner /> : buttonText}
          </button>
        </form>
        <p className="auth-switcher">
          {footerText}
          <Link to={footerLinkTo} className="auth-link">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
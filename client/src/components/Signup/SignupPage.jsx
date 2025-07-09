import React from 'react';
import { useNavigate } from 'react-router-dom';

import { signup } from '../../services/AuthService';
import "./s.css"
import AuthForm from '../AuthForm/AuthForm';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = async (username, password) => {
    // We can directly log the user in after signup
    const response = await signup(username, password);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard'); // Go to dashboard after successful signup
  };

  return (
    <AuthForm
      title="GVS CARGO - Admin Signup"
      buttonText="Sign Up"
      onSubmit={handleSignup}
      isSignup={true} // This will show the 'Confirm Password' field
      footerText="Already have an account?"
      footerLinkText=" Log In"
      footerLinkTo="/login"
    />
  );
};

export default SignupPage;
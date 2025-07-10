import React from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../services/AuthService';
import "./s.css"
import AuthForm from '../AuthForm/AuthForm';
const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    const response = await login(username, password);
    const { token, user } = response.data;
    
    // Store credentials and navigate to the dashboard on success
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard'); 
  };

  return (
    <AuthForm
      title="GVS CARGO - Admin Login"
      buttonText="Log In"
      onSubmit={handleLogin}
      isSignup={false}
     
    />
  );
};

export default LoginPage;
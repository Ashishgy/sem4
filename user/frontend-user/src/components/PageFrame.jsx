// src/components/PageFrame.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThisProSidebar from './SideBar.jsx';
import { Box, Button } from '@mui/material';
import { ToastContainer } from 'react-toastify';

const PageFrame = ({ element }) => {
  const navigate = useNavigate();

  /**const handleLogout = () => {
   localStorage.removeItem("jwt_token"); // Clear token

   navigate("/login"); // Redirect to login
   };*/

  const logout = async (url) => {
    try {
      localStorage.removeItem("jwt_token"); // Clear token
      const response = await fetch(url);
      navigate("/login"); // Redirect to login
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
      <div style={{ height: "100vh", display: "flex" }}>
        <ThisProSidebar />
        <main>
          <Box m="5vh">
            <Button variant="outlined" color="secondary" onClick={() => logout('http://localhost:9080/oauth/logout')}>
              Logout
            </Button>
            {element}
            <ToastContainer />
          </Box>
        </main>
      </div>
  );
};

export default PageFrame;


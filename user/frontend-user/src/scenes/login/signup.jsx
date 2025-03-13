import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from '@mui/material';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    const signUpData = { username, password };

    try {
      const response = await fetch("http://localhost:9080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      const data = await response.text();

      if (response.ok) {
        // Display success message
        setSuccessMessage("Account created successfully! Redirecting to login page...");

        // Clear any previous errors
        setError("");

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000); // 3 seconds delay
      } else {
        setError(data.message || "Username already exists. Please choose a different name.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
      <form onSubmit={handleSignUp}>
        <Box mb={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            error={!!error}
            helperText={error}
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
        </Box>
        {successMessage && (
          <Typography color="primary" sx={{ mb: 2 }}>
            {successMessage}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
      </form>
      <Button variant="text" onClick={() => navigate("/login")}>
        Already have an account? Log In
      </Button>
    </Box>
  );
};

export default SignUp;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = { username, password };

    try {
      const response = await fetch("http://localhost:9080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSecureData(data.accessToken);

        localStorage.setItem("jwt_token", data.accessToken); // Save only the access token
        navigate("/"); // Navigate to the dashboard
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  }
  const fetchSecureData = async (token) => {
    try {
      const response = await fetch("http://localhost:9080/api/secure-data", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const secureData = await response.json();
        console.log("Secure data fetched:", secureData);
        // You can now store the secure data or use it as needed
      } else {
        console.error("Failed to fetch secure data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching secure data:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleLogin}>
        <Box mb={2}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
        </Box>
        <Box mb={2}>
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth>Sign In</Button>
      </form>
      <Button variant="text" onClick={() => navigate("/signup")} fullWidth>
        Don't have an account? Sign Up
      </Button>

    </Box>
  );
};

export default Login;





//frontend


// Process for adding userId for every request
// import { jwtDecode } from "jwt-decode";

// cconst [userId, setUserId] = useState('');  // Store userId in the component's state

// useEffect(() => {
//   // Get the JWT token from localStorage
//   const token = localStorage.getItem("jwt_token");

//   // If token exists, decode it to get the userId
//   if (token) {
//     const decoded = jwtDecode(token);  // Decode the JWT token
//     setUserId(decoded.sub);  // Set the userId from the decoded token
//   } else {
//     toast.error("No token found. Please log in again.");
//   }
// }, []);

//     // Use userId in the request URL

//     const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`);


// in backend 




// private void addServiceProviderHandler(RoutingContext ctx){
//    String currentUser = ctx.request().getParam("userid"); // Get userId from query parameters
//   logger.info("Received userId from query parameter: {}", currentUser);
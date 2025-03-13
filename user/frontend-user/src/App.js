import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { CssBaseline, ThemeProvider } from '@mui/material';
import './App.css';

// Components
import Dashboard from './scenes/dashboard';
import PageFrame from './components/PageFrame';
import Profile from './scenes/profile';
import ConnectionsPage from './scenes/connections';
import Insights from './scenes/insights';
import HistoryPage from './scenes/history';
import Login from './scenes/login';
import OAuthIntegration from './scenes/DataPlug/OAuthIntegration';

// Theme
import { theme } from "./theme";
import SignUp from './scenes/login/signup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("jwt_token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn("Token expired. Logging out...");
          localStorage.removeItem("jwt_token");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("jwt_token");
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    verifyToken();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // You might want to replace this with a proper loading component
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PageFrame element={<Dashboard />} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <PageFrame element={<Profile />} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/connections" 
            element={
              <ProtectedRoute>
                <PageFrame element={<ConnectionsPage />} />
              </ProtectedRoute>
            } 
          />
          <Route
              path="/oauth"
              element={
                <ProtectedRoute>
                  <PageFrame element={<OAuthIntegration />} />
                </ProtectedRoute>
              }
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <PageFrame element={<Insights />} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <PageFrame element={<HistoryPage />} />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;

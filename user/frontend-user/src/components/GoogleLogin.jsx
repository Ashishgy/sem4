import React from 'react';

const App = () => {
  const handleLogin = () => {
    // Initiates the OAuth2 flow by redirecting to the backend
    window.location.href = 'http://localhost:9080/auth/google/initiate';
  };
  const fetchProfile = () => {
    // Initiates the OAuth2 flow by redirecting to the backend
    window.location.href = 'http://localhost:9080/auth/fetchProfile';
  };

  return (
    <div>
      <h1>Login with Google</h1>
      <button onClick={handleLogin}>Log In with Google</button>
      <h1>Existing User?</h1>
      <button onClick={fetchProfile}>Fetch users profile</button>
    </div>
    
  );
};

export default App;

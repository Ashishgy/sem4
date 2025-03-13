import React, { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

const App = () => {
  const handleLogin = () => {
    // Initiates the OAuth2 flow by redirecting to the backend
    window.location.href = 'http://localhost:9080/auth/google/secure/*';
  };

  return (
    <div>
      <h1>CheckTokenValidity</h1>
      <button onClick={handleLogin}>CheckTokenValidity</button>
    </div>
  );
};

export default App;

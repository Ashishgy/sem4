import React, { useState, useEffect } from 'react';

function LocationComponent() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [lastSentLocation, setLastSentLocation] = useState({
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser.'
      });
      return; // Exit if geolocation is not supported
    }

    const watchId = geo.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          error: null,
        });

        if (shouldSendLocation(lastSentLocation, { latitude, longitude })) {
          // Send the updated location to the backend
          fetch('http://localhost:9080/api/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Location data saved:', data);
            // Update last sent location
            setLastSentLocation({ latitude, longitude });
          })
          .catch(error => console.error('Error sending location data:', error));
        }

      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    // Clean up the watchPosition when the component unmounts
    return () => geo.clearWatch(watchId);

  }, [lastSentLocation]);

  return (
    <div>
      <h1>Your Location</h1>
      {location.error ? (
        <p>Error: {location.error}</p>
      ) : location.latitude && location.longitude ? (
        <p>Latitude: {location.latitude}, Longitude: {location.longitude}</p>
      ) : (
        <p>Waiting for location...</p>
      )}
    </div>
  );
}

function shouldSendLocation(lastLocation, newLocation) {
  const minDistance = 0.0001; // Change this value based on required sensitivity
  return !lastLocation.latitude || !lastLocation.longitude ||
         Math.abs(lastLocation.latitude - newLocation.latitude) > minDistance ||
         Math.abs(lastLocation.longitude - newLocation.longitude) > minDistance;
}

export default LocationComponent;

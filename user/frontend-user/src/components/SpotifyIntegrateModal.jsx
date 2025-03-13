import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from 'axios'
import MyModal from './MyModal';
import MyModalContent from './MyModalContent';
import config from '../utils/config'

const SpotifyIntegrateModal = ({ isIntegrated, isOpen, onClose, servProvData, onListingUpdate }) => {

  const deleteItem = async () => {
    var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/data-sources/spotify`);
    onListingUpdate();
    onClose();
  }

  const clientId = '12ae5783c2a64348a38bec41901e54db';
  const redirectUri = "http://" + window.location.host + '/profile';
  const authEndpoint = 'https://accounts.spotify.com/authorize';

  const handleLogin = () => {
    const queryParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri, // TODO MAKE SURE TO ADD PROPER REDIRECT URIS IN THE SPOTFIY DEV PANEL
      response_type: 'code',
      scope: 'user-read-private user-read-email user-top-read user-follow-read',
    });

    const loginUrl = `${authEndpoint}?${queryParams}`;
    window.location.href = loginUrl;
  };

  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        <h2>{(isIntegrated) ? ("Connected to Spotify") : ("Connect to Spotify")}</h2>

        {/* TODO spotify auth flow */}
        
        {(isIntegrated) ? (
          <Button variant="contained" onClick={deleteItem}>
          Disconnect
          </Button>
        ) : (
          <Button variant="contained" onClick={handleLogin}>
          Login with Spotify
          </Button>
        )}

        <Button variant="contained" onClick={onClose} color="secondary">
          Cancel
        </Button>
      </MyModalContent>
    </Fade>
  </MyModal>
  )
};

export default SpotifyIntegrateModal

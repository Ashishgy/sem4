import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from 'axios'
import MyModal from './MyModal';
import MyModalContent from './MyModalContent';
import config from '../utils/config'
import { useState, useEffect, useRef  } from 'react'

const BCGovCredentialDetailModal = ({ isOpen, onClose, servProvData, onListingUpdate }) => {
  console.log("detail modal", servProvData);
  const [invitationUrl, setInvitationUrl] = useState('');

  const deleteItem = async () => {
    // var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${servProvData._id}`);
    // onServProvsUpdate();
    onClose();
  }

  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        {/* <h2>Demo BC Gov Credential</h2>

        <p>Demo Credential from the BC Gov Issuer Kit.</p> */}

<h2>Demo Credential</h2>

<p>Demo Credential issued from my Demo Issuer after email verification.</p>
        
        <Button variant="contained" onClick={deleteItem}>
          Delete
        </Button>
        <Button variant="contained" onClick={onClose} color="secondary">
          Cancel
        </Button>
      </MyModalContent>
    </Fade>
  </MyModal>
  )
};

export default BCGovCredentialDetailModal

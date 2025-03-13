import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from 'axios'
import MyModal from './MyModal';
import MyModalContent from './MyModalContent';
import config from '../utils/config'
import { useState, useEffect, useRef  } from 'react'
import { ToastContainer, toast } from 'react-toastify';

const ObtainBCGovCredentialModal = ({ isOpen, onClose, servProvData, setCredModalData, setCretModalOpen, onListingUpdate }) => {
  console.log("detail modal", servProvData);
  const [invitationUrl, setInvitationUrl] = useState('');

  const deleteItem = async () => {
    // var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${servProvData._id}`);
    // onServProvsUpdate();
    onClose();
  }

  const handleTextChange = (e) => {
    setInvitationUrl(e.target.value);
  };

  const handleSubmit = async () => {
    var response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/add-credential`, {'invitationUrl': invitationUrl});
    var addedCredId = response.data;

    onListingUpdate();

    // setCredModalData(addedCredId);
    setCretModalOpen(true);

    toast.success("Added Demo Credential");

    // Close the modal:
    onClose();
  };

  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        {/* <h2>Obtain Demo BC Gov Credential</h2> */}
        <h2>Obtain Demo Credential</h2>


        <i>
        <Typography>
          <b>Old BC Gov Issuer Instructions:</b>
        </Typography>
        <ul>
          <li>Run the BC Gov Issuer Kit by following the instructions on GitHub: <a href="https://github.com/bcgov/issuer-kit/tree/main?tab=readme-ov-file#running-the-issuer-kit">github.com/bcgov/issuer-kit</a>.</li>
          <li>Go to your Issuer Kit Admin Panel here: <a href="http://localhost:8081">http://localhost:8081</a>.</li>
          <li>Click the "New Invite" button and complete the form to generate your credential.</li>
          <li>Copy and paste the invite URL to obtain the credential.</li>
        </ul></i>

        <Typography>
          <b>Instructions:</b>
        </Typography>
        <ul>
          <li>Run the Demo Issuer.</li>
          <li>Go to the Demo Issuer interface here: <a href="http://localhost:3009">http://localhost:3009</a>.</li>
          <li>Submit your email, and then click the link in the respective email message.</li>
          <li>Copy and paste the displayed invite URL to obtain the credential.</li>
        </ul>

        <TextField
          label="Issuer Credential Invitation URL"
          name="invitation-url"
          value={invitationUrl}
          onChange={handleTextChange}
          fullWidth
          autoComplete="off"
          margin="normal"
        />
        
        <Button variant="contained" onClick={handleSubmit}>
          Add
        </Button>
        <Button variant="contained" onClick={onClose} color="secondary">
          Cancel
        </Button>
      </MyModalContent>
    </Fade>
  </MyModal>
  )
};

export default ObtainBCGovCredentialModal

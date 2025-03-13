import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from 'axios'
import MyModal from './MyModal';
import MyModalContent from './MyModalContent';
import config from '../utils/config'
import { ToastContainer, toast } from 'react-toastify';

const ExampleDataIntegrateModal = ({ isIntegrated, isOpen, onClose, servProvData, onListingUpdate }) => {

  const deleteItem = async () => {
    var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/data-sources/test-example`);
    onListingUpdate();
    onClose();
  }

  async function integrate() {
    const newDataSource = {
      dataSourceId: "test-example"
    }
    const response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/data-sources`, newDataSource);

    onListingUpdate();
    onClose();
    toast.success("Integrated example data source");
  };



  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        <h2>{(isIntegrated) ? ("Example Data Source") : ("Integrate with Example Data Source")}</h2>
        
        {(isIntegrated) ? (
          <Button variant="contained" onClick={deleteItem}>
          Disconnect
          </Button>
        ) : (
          <Button variant="contained" onClick={integrate}>
          Integrate
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

export default ExampleDataIntegrateModal

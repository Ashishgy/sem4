import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme, Box, Divider } from "@mui/material";
import axios from 'axios'
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import config from '../../utils/config'
import DataMenu from '../../components/DataMenu';
import ObtainBCGovCredentialModal from '../../components/ObtainBCGovCredentialModal';
import { useState, useEffect, useRef  } from 'react'
import BCGovCredentialDetailModal from '../../components/BCGovCredentialDetailModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ServProvDetailModal = ({ isOpen, onClose, summaryData, onServProvsUpdate }) => {
  console.log("detail modal - summary data:", summaryData);

  const [detail, setDetail] = useState({bannerData: {name: "Loading...", desc: "Loading..."}});
  const [dataMenuSelection, setDataMenuSelection] = useState({});

  const [bcGovCredentialModalOpen, setBcGovCredentialModalOpen] = useState(false);

  const [bcGovCredentialDetailModalOpen, setBcGovCredentialDetailModalOpen] = useState(false);
  const [bcGovCredentialDetailModalData, setBcGovCredentialDetailModalData] = useState({});

  const [dataSources, setDataSources] = useState({});

  // const [relevantCredId, setRelevantCredId] = useState("");


  async function updateCredListing(){
    await updateServProvDetail(); // relevant credential is included in the serv prov detail response.
  }
  // async function openCredDetailModal(){

  //   setBcGovCredentialDetailModalOpen(true);
  // }


  async function updateServProvDetail() {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}`);
    console.log("fetched serv prov detail:", response.data);
    setDetail(response.data);
  }

  async function updateServProvDataMenuDetail() {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}/data-menu`);
    console.log("fetched serv prov data menu:", response.data);
    setDataMenuSelection(response.data.dataMenu);
  }

  async function updateDataSources() {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/data-sources`);
    console.log("fetched data sources:", response.data);
    setDataSources(response.data);
  }

  // Save data sharing settings:
  async function saveChanges() {
    const response = await axios.put(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}/data-menu`, dataMenuSelection);
    toast.success("Saved Data Settings");

    const itemsImmediatelyShared = response.data.itemsSharedCount;
    if (itemsImmediatelyShared > 0){
      toast.success("Shared " + itemsImmediatelyShared + " data items");
    }
  }

  // Send credentials to SP:
  async function verifyCredentials() {
    const response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/verify?presentationExchangeId=${summaryData.presentationExchangeId}&credId=${detail.relevantCredential}`);
    console.log("verify credentials response:", response.data);

    updateServProvDetail();

    if (response.data == true){
      toast.success("Verified with Service Provider");
    }
  }

  const deleteServProv = async () => {
    var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}`);
    onServProvsUpdate();
    onClose();
  }

  const hasRan = useRef(false);
  useEffect(() => {
    if (isOpen && !hasRan.current){
      hasRan.current = true;

      updateServProvDetail();
      updateServProvDataMenuDetail();
      updateDataSources();
    }
  }, [isOpen]);


  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        <h2>Service Provider Connection</h2>
        <h3>{detail.bannerData.name}</h3>

        {(summaryData.presentationExchangeId == "") ? (
          <div>
            <Typography>
              Credential Verified.
          </Typography>
          </div>
        ) : (
          <div>
            <Divider sx={{ borderWidth: '2px', marginY: '10px' }} />
            {(detail.verifiedWith) ? (
              <Typography color="green">
              Credential Verified!
              </Typography>
            ) : (
              <div>
                <Typography>
                Credential Required:
                </Typography>
                {(!detail.relevantCredential) ? (
                  // <Button variant="contained" onClick={() => setBcGovCredentialModalOpen(true)} style={{ color: '#555', backgroundColor: '#eee' }}>Demo BC Gov Credential</Button>
                  <Button variant="contained" onClick={() => setBcGovCredentialModalOpen(true)} style={{ color: '#fff', backgroundColor: '#bb0000' }}>Demo Credential</Button>
                ) : (
                  <Button variant="contained" onClick={() => { setBcGovCredentialDetailModalData(); setBcGovCredentialDetailModalOpen(true);}} color="success">Demo Credential</Button>
                )}
                
                <br></br>
                {(!detail.relevantCredential) ? (
                  <div></div>
                ) : (
                  <Button onClick={verifyCredentials} color="success">Verify with Service Provider</Button>
                )}
              </div>
            )}
            <Divider sx={{ borderWidth: '2px', marginY: '10px' }} />
          </div>
        )}
        

        <Box sx={{ paddingTop: "15px"}}>
          <DataMenu isUserView={true} dataSources={dataSources} dataMenuSelection={dataMenuSelection} setDataMenuSelection={setDataMenuSelection} refreshDataSources={updateDataSources}></DataMenu>
          <Divider sx={{ borderWidth: '2px', marginY: '10px' }} />
        </Box>


        <Button variant="contained" onClick={saveChanges} disabled={(detail.verifiedWith) ? false : true }>
          Save Data Sharing Settings
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', paddingTop:"5px" }}>
          <Button variant="contained" onClick={deleteServProv}>
            Delete
          </Button>
          <Button variant="contained" onClick={onClose} color="secondary">
            Close
          </Button>
        </Box>


        <ObtainBCGovCredentialModal isOpen={bcGovCredentialModalOpen} onClose={() => setBcGovCredentialModalOpen(false)} onListingUpdate={updateCredListing} setCretModalOpen={() => setBcGovCredentialDetailModalOpen(true)} />

        <BCGovCredentialDetailModal isOpen={bcGovCredentialDetailModalOpen} onClose={() => setBcGovCredentialDetailModalOpen(false)} onListingUpdate={updateCredListing} />
      </MyModalContent>
    </Fade>
  </MyModal>
  )
};

export default ServProvDetailModal

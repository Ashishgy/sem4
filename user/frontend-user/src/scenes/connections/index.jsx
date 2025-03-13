import { useState, useEffect, useRef  } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme, ButtonBase  } from "@mui/material";
// import cachePull from '../../utils/cachePull'
import { NavLink } from "react-router-dom";
import config from '../../utils/config'
import axios from 'axios'
import { styled } from '@mui/system';
import ServProvDetailModal from './ServProvDetailModal';
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import MyCard from '../../components/MyCard';
import SectionCard from '../../components/SectionCard';
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";


const ConnectionsPage = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    // const navigate = useNavigate()

    const [servProvs, setServProvs] = useState([]);

    const [newInvitationModalOpen, setNewInvitationModalOpen] = useState(false);
    const [invitationUrl, setInvitationUrl] = useState('');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [userId, setUserId] = useState('');  // Store userId in the component's state

    useEffect(() => {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("jwt_token");

      // If token exists, decode it to get the userId
      if (token) {
        const decoded = jwtDecode(token);  // Decode the JWT token
        setUserId(decoded.sub);  // Set the userId from the decoded token
      } else {
        toast.error("No token found. Please log in again.");
      }
    }, []);


    async function updateServProvsList() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`);
      console.log("fetched serv providers list:", response.data);
      setServProvs(response.data);
    }

    const handleSubmit = async () => {
      const formData = new FormData();
      formData.append('invitationUrl', invitationUrl);
      var response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`, formData);

      // Close the modal:
      setNewInvitationModalOpen(false);

      var newServProv = response.data;
      setDetailData(newServProv);
      setDetailModalOpen(true);

      updateServProvsList();

      toast.success("Added Service Provider");
    };

    const handleTextChange = (e) => {
      setInvitationUrl(e.target.value);
    };

    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        updateServProvsList();
      }
    }, []);

    return (
            <SectionCard>
              <Typography variant="h3" sx={{ color: "#000000"}}>
                Connected Service Providers
              </Typography>
              {/* {servProvs.map(servProv => (
                <li key={servProv._id}>{servProv.connId}</li>
              ))} */}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
              {servProvs.map(item => {
                  return (
                    <MyCard key={item._id} onClick={() => { setDetailData(item); setDetailModalOpen(true) }} style={{cursor: 'pointer'}}>
                      <CardContent>
                        {/* TODO click to bringup detail modal - then theres a list of toggles for each requested permission (which the serv prov provides/responds again from the first/initial connection message). Delete button here. */}
                        <Typography component="div">
                          {item.bannerData.name} <i>(ID: {item.connId.substring(0, 8)})</i>
                        </Typography>
                        <Typography color="text.secondary">{item.bannerData.desc}</Typography>
                      </CardContent>
                    </MyCard>
                  );
                })}
              </div>
              
              
              <Button
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                variant="contained"
                onClick={() => setNewInvitationModalOpen(true)}>
                  Add Service Provider
              </Button>


        {/* Popup Modal */}
        <MyModal
          open={newInvitationModalOpen}
          onClose={() => setNewInvitationModalOpen(false)}
          closeAfterTransition
        >
          <Fade in={newInvitationModalOpen}>
            <MyModalContent>
              <h2>Add a Service Provider</h2>
              
              <TextField
                label="Invitation URL"
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
              <Button variant="contained" onClick={() => setNewInvitationModalOpen(false)} color="secondary">
                Cancel
              </Button>
            </MyModalContent>
          </Fade>
        </MyModal>


        <ServProvDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} summaryData={detailData} onServProvsUpdate={updateServProvsList} />
      </SectionCard>
    );
}

export default ConnectionsPage

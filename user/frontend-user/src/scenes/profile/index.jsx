import { useState, useEffect, useRef } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
// import cachePull from '../../utils/cachePull'
import SectionCard from '../../components/SectionCard';
import SpotifyIntegrateModal from '../../components/SpotifyIntegrateModal';
import ObtainBCGovCredentialModal from '../../components/ObtainBCGovCredentialModal';
import axios from 'axios'
import config from '../../utils/config'
import BCGovCredentialDetailModal from '../../components/BCGovCredentialDetailModal';
import { ToastContainer, toast } from 'react-toastify';
import ExampleDataIntegrateModal from '../../components/ExampleDataIntegrateModal';
import GoogleLogin from '../../components/GoogleLogin';
import LocationComponent from '../../components/LocationComponent';
import YtData from '../../components/ytdata'

const Profile = () => {
    const theme = useTheme();
    const colors = theme.palette;
    
    const [dataSourceModalKey, setDataSourceModalKey] = useState(null);

    const [bcGovCredentialModalOpen, setBcGovCredentialModalOpen] = useState(false);
    const [bcGovCredentialDetailModalOpen, setBcGovCredentialDetailModalOpen] = useState(false);

    const [dataSources, setDataSources] = useState({});

    const [credentials, setCredentials] = useState({});

    async function updateDataSources() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/data-sources`);
      console.log("fetched data sources:", response.data);
      setDataSources(response.data);
    }

    async function updateCredentials() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/credentials`);
      console.log("fetched credentials:", response.data);
      setCredentials(response.data);
    }

    async function SaveAccessToken(code){
      const newDataSource = {
        dataSourceId: "spotify",
        code: code,
        redirectUri: "http://" + window.location.host + '/profile'
      }
      const response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/data-sources`, newDataSource);
      
      toast.success("Connected to Spotify");

      updateDataSources();
    }


    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code){
          console.log('Spotify code:', code);
          SaveAccessToken(code);
        }


        updateDataSources();
        updateCredentials();
      }
    }, []);

    return (
      <div>
        <SectionCard>
          <Typography variant="h3" sx={{ color: "#000000"}}>
            Data Source Integrations
          
          </Typography>
          <div>
            <GoogleLogin/>
          </div>
          <div>
            <LocationComponent/>
          </div>
          <div><YtData/></div>
          <div>
          {("spotify" in dataSources) ? (
              <Button variant="contained" onClick={() => setDataSourceModalKey("spotify")} color="success">Spotify</Button>
            ) : (
              <Button variant="contained" onClick={() => setDataSourceModalKey("spotify")} style={{ color: '#555', backgroundColor: '#eee' }}>Spotify</Button>
            )}
          </div>

          <div>
          {("test-example" in dataSources) ? (
              <Button variant="contained" onClick={() => setDataSourceModalKey("test-example")} color="success">Example Data Source</Button>
            ) : (
              <Button variant="contained" onClick={() => setDataSourceModalKey("test-example")} style={{ color: '#555', backgroundColor: '#eee' }}>Example Data Source</Button>
            )}
          </div>
          

          {/* TODO put mock Google Maps and Metriport buttons as well */}
        </SectionCard>


        <SectionCard>
          <Typography variant="h3" sx={{ color: "#000000"}}>
            Credentials
          </Typography>
          
          {(Object.keys(credentials).length > 0) ? (
            <Button variant="contained" onClick={() => setBcGovCredentialDetailModalOpen(true)} color="success">Demo Credential</Button>
          ) : (
            <Button variant="contained" onClick={() => setBcGovCredentialModalOpen(true)} style={{ color: '#555', backgroundColor: '#eee' }}>Demo Credential</Button>
          )}
          
        </SectionCard>


        <SpotifyIntegrateModal isIntegrated={("spotify" in dataSources)} isOpen={dataSourceModalKey == "spotify"} onClose={() => setDataSourceModalKey(null)} onListingUpdate={updateDataSources} />

        <ExampleDataIntegrateModal isIntegrated={("test-example" in dataSources)} isOpen={dataSourceModalKey == "test-example"} onClose={() => setDataSourceModalKey(null)} onListingUpdate={updateDataSources} />

        <ObtainBCGovCredentialModal isOpen={bcGovCredentialModalOpen} onClose={() => setBcGovCredentialModalOpen(false)} onListingUpdate={updateCredentials} setCretModalOpen={() => setBcGovCredentialDetailModalOpen(true)} />
        <BCGovCredentialDetailModal isOpen={bcGovCredentialDetailModalOpen} onClose={() => setBcGovCredentialDetailModalOpen(false)} onListingUpdate={updateCredentials} />
      </div>
    );
}

export default Profile

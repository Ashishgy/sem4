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
import { DataGrid } from "@mui/x-data-grid";
import { jwtDecode } from "jwt-decode";



const HistoryPage = () => {
    const theme = useTheme();
    
    const [data, setData] = useState([]);
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

    async function updateCollectedDataList() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/shared-data`);
      console.log("fetched data:", response.data);
      setData(response.data);
    }


    function downloadJSONAsFile(jsonData, filename) {
      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  }

    async function download() {
      downloadJSONAsFile(data, "user-data.json");
    }


    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        updateCollectedDataList();
      }
    }, []);


    function epochSecondsToDateTimeString(epochSeconds) {
      return new Date(epochSeconds * 1000).toLocaleString();
    }


    const columns = [  
      { field: 'datetime', headerName: 'Date Time', flex: 1 },
      { field: 'servProvId', headerName: 'Service Provider ID', flex: 1 },
      { field: 'dataSourceId', headerName: 'Data Source', flex: 1 },
      { field: 'dataItemId', headerName: 'Data Item', flex: 1 },
      { field: 'dataStr', headerName: 'Data', flex: 2 },  
      ];
  
    const rows = data.map((dataItem, idx) => {
      const r = {
        ...dataItem,
        datetime: epochSecondsToDateTimeString(dataItem.epoch_seconds),
        servProvId: dataItem.servProvId.substring(0, 8),
        dataStr: JSON.stringify(dataItem.data, null, 2),
        id: dataItem._id,
      };
      console.log(r);
      return r;
    });
    

    return (
      <div>
        <SectionCard>
          <Typography variant="h3" sx={{ color: "#000000"}}>
            Shared Data / Activity
          </Typography>
          
          <Box sx={{ height: '500px', width: '800px', maxWidth: 1500 }}>
            <DataGrid 
            rows={rows} 
            columns={columns}
            disableSelectionOnClick
            rowSelectionModel={[]} 
              />
          </Box>

          <Button variant="contained" onClick={download}>
            Download Data Dump
          </Button>
          

          {/* TODO put mock Google Maps and Metriport buttons as well */}
        </SectionCard>
      </div>
    );
}

export default HistoryPage

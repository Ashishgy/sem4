import React, { useEffect, useState} from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
import SectionCard from '../../components/SectionCard';
// import cachePull from '../../utils/cachePull'
import { jwtDecode } from "jwt-decode";


const Dashboard = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    const navigate = useNavigate()
    const [checkbox0, setCheckbox0] = useState(true);
    const [checkbox1, setCheckbox1] = useState(true);
    const [checkbox2, setCheckbox2] = useState(true);
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
    
    
    const handleCheckboxChange = (checkboxName) => {
      switch (checkboxName) {
        case '0':
          setCheckbox0(prevState => !prevState);
          break;
        case '1':
          setCheckbox1(prevState => !prevState);
          break;
        case '2':
          setCheckbox2(prevState => !prevState);
          break;
        default:
          break;
      }
      const data = {
        "0": checkboxName=="0"?!checkbox0:checkbox0,
        "1": checkboxName=="1"?!checkbox1:checkbox1,
        "2": checkboxName=="2"?!checkbox2:checkbox2
      };
      var url = 'http://host.docker.internal:9080/user-settings?userid=${userId}'
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    };

    return (
      <SectionCard>
        <Typography variant="h3" sx={{ color: "#000000"}}>
          Dashboard
        </Typography>
        <Typography variant="h5" sx={{ padding: "20px 30px 0 5px", color: "#000000"}}>
          Text here
          TODO have separate cards with simple fun insights maybe, like stress score and top played artist.
          <div>
            <h2>Data Sharing Setting:</h2>
            <label>
              <input
                type="checkbox"
                checked={checkbox0}
                onChange={() => handleCheckboxChange('0')}
              />
              0
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={checkbox1}
                onChange={() => handleCheckboxChange('1')}
              />
              1
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={checkbox2}
                onChange={() => handleCheckboxChange('2')}
              />
              2
            </label>
            <br />
          </div>
        </Typography>
      </SectionCard>
    );
}

export default Dashboard

            {/* <Box height="250px">
              <div style={{ paddingLeft:"50px", paddingRight:"10px", height:"300px", width:"300px"}}>
                  <Donut />
                </div>
            </Box> */}
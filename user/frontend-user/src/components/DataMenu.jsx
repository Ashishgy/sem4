import React from 'react';
import ThisProSidebar from './SideBar.jsx';
import { useState, useEffect } from "react";
import { Box } from '@mui/system'
import { FormLabel, Select, MenuItem, Typography, Button } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SpotifyIntegrateModal from './SpotifyIntegrateModal.jsx';
import ExampleDataIntegrateModal from './ExampleDataIntegrateModal.jsx';


const DataMenu = ({isUserView, dataSources, dataMenuSelection, setDataMenuSelection, refreshDataSources}) => {
  const [integrateModalKey, setIntegrateModalKey] = useState(null);

  console.log("data menu:", dataMenuSelection);
  return (
    <Box>
      {Object.entries(dataMenuSelection).map(([dataSourceKey, dataSourceValue]) => (
        <div key={dataSourceKey}>
          {(dataSourceKey in dataSources) ?
          (
            <Typography variant="h6">{dataSourceValue.name}</Typography>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">{dataSourceValue.name}</Typography>
              <Button sx={{ margin: "5px" }} variant="contained" onClick={() => setIntegrateModalKey(dataSourceKey)} color="secondary">
                Integrate
              </Button>
            </div>
          )}
            
          <FormGroup sx={{paddingBottom: "20px"}}>
            {Object.entries(dataSourceValue.items).map(([dataItemKey, dataItemValue]) => (
              <DataItem dataSources={dataSources} isUserView={isUserView} key={dataItemKey} title={dataItemValue.name} dataMenuSelection={dataMenuSelection} setDataMenuSelection={setDataMenuSelection} dataSourceKey={dataSourceKey} dataItemKey={dataItemKey}></DataItem>
            ))}
          </FormGroup>
        </div>
      ))}

      <SpotifyIntegrateModal isOpen={integrateModalKey == "spotify"} onClose={() => setIntegrateModalKey(null)} onListingUpdate={refreshDataSources} />

      <ExampleDataIntegrateModal isOpen={integrateModalKey == "test-example"} onClose={() => setIntegrateModalKey(null)} onListingUpdate={refreshDataSources} />
    </Box>
  );
};

const DataItem = ({isUserView, title, dataMenuSelection, setDataMenuSelection, dataSourceKey, dataItemKey, dataSources}) => {
  const handleSwitchChange = (isSwitchOn) => {
    setDataMenuSelection((prevData) => {
      const newData = {
        ...prevData,
      };
      newData[dataSourceKey]["items"][dataItemKey]["selected"] = isSwitchOn;
      return newData;
    });
  };

  return (
    <FormControl component="fieldset" variant="standard">
      <Box>
        <FormControlLabel control={
          <Switch 
          checked={dataMenuSelection[dataSourceKey]["items"][dataItemKey]["selected"] || false} // Set to false if undefined, which may happen if "selected" attr doesn't exist (yet).
          onChange={(event) => handleSwitchChange(event.target.checked)}
          disabled={!(dataSourceKey in dataSources)}
          />
        } label={title} />
        <Select
          labelId="demo-simple-select-label"
          value={1}
          label="Age"
          // onChange={handleChange}
          disabled={isUserView}
        >
          <MenuItem value={1}>Once</MenuItem>
          <MenuItem value={2}>Daily</MenuItem>
          <MenuItem value={2}>Weekly</MenuItem>
          <MenuItem value={3}>Monthly</MenuItem>
        </Select>
      </Box>
    </FormControl>
  );
};

export default DataMenu;

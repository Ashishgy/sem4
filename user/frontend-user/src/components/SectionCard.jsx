import React from 'react';
import ThisProSidebar from './SideBar.jsx';
import { useState, useEffect } from "react";
import { Box } from '@mui/system'

const SectionCard = ({ children }) => {
  return (
    <Box gridColumn="span 16" gridRow="span 2" backgroundColor="#f3f4f8" sx={{borderRadius: '16px', boxShadow: 2, marginBottom: "20px"}}> 
      <Box gridColumn="span 16" gridRow="span 10" sx={{ width:'100%', borderRadius:'16px', display:"flex", direction:"row", padding: "20px 20px 20px 20px" }}>
        <Box>
          {children}
        </Box>
      </Box>
    </Box>
    // <Box backgroundColor="#f3f4f8" sx={{boxShadow: 2, width:'100%', borderRadius:'16px', display:"flex", direction:"row", padding: "20px 20px 20px 20px"}}> 
    //   {children}
    // </Box>
  );
};

export default SectionCard;

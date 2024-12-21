import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";



const Navbar = () => {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        {/* Logo Görseli */}
        <Box display="flex" alignItems="center">
          <Link to="/" style={{ textDecoration: "none", color: "inherit",  marginTop: "0.5rem"  }}>
            <img
              src="/logo.png" // Public klasöründeki logo.png
              alt="Logo"
              style={{ height: "40px", marginRight: "10px" }} // Görsel boyutu ve boşluk
            />
          </Link>
          <Typography variant="h6">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            LexiAI
            </Link>
          </Typography>
        </Box>
        <Box>
        </Box>
      </Toolbar>
    </AppBar>
 
  );
};

export default Navbar;

import React from 'react';
import { Outlet } from 'react-router';
import Nabvar from "./components/Navbar"
import { Container, CssBaseline, Toolbar } from '@mui/material';

function Layout() {
  return (
    <>
      <CssBaseline />
      <Nabvar />
      <Toolbar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;
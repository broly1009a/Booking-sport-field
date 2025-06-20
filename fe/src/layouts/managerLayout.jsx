// ManagerLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box, Container, CssBaseline, Toolbar, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Typography
} from '@mui/material';
import { TableChart, Book } from '@mui/icons-material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ManagerHeader from '../components/headers/ManagerHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 240;

const ManagerLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <CssBaseline />
      <ManagerHeader />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0b3d91',
            color: 'white'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 1, fontWeight: 'bold' }}>QUẢN LÝ</Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="manager/booking-list">
                <ListItemIcon sx={{ color: 'white' }}>
                  {/* icon for sport */}
                  <Book />
                </ListItemIcon>
                <ListItemText primary="Lịch Đặt Sân" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="manager/type-list">
                <ListItemIcon sx={{ color: 'white' }}><TableChart /></ListItemIcon>
                <ListItemText primary="Loại Sân" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="manager/sport-field-list">
                <ListItemIcon sx={{ color: 'white' }}><Book /></ListItemIcon>
                <ListItemText primary="Sân Thể Thao" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="manager/equipment-list">
                <ListItemIcon sx={{ color: 'white' }}><SportsSoccerIcon /></ListItemIcon>
                <ListItemText primary="Thiết Bị" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="manager/consumable-list">
                <ListItemIcon sx={{ color: 'white' }}><Book /></ListItemIcon>
                <ListItemText primary="Vật Tư Tiêu Hao" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', my: 2 }} />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        pauseOnHover
        closeOnClick
        draggable
        theme="colored"
      />
    </Box>
  );
};

export default ManagerLayout;

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box, Container, CssBaseline, Toolbar, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Typography
} from '@mui/material';
import { TableChart, Newspaper, SportsSoccer, Inventory, Category, Policy, Event } from '@mui/icons-material';
import StaffHeader from '../components/headers/staffHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GiChampions } from 'react-icons/gi';

const drawerWidth = 240;

const StaffLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <CssBaseline />
      <StaffHeader />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#e8801eff',
            color: 'white'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 1, fontWeight: 'bold' }}>QUẢN LÝ</Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/dashboard">
                <ListItemIcon sx={{ color: 'white' }}>
                  <TableChart />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/booking-list">
                <ListItemIcon sx={{ color: 'white' }}>
                  <Event />
                </ListItemIcon>
                <ListItemText primary="Lịch Đặt Sân" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/sport-field-list">
                <ListItemIcon sx={{ color: 'white' }}><SportsSoccer /></ListItemIcon>
                <ListItemText primary="Sân Thể Thao" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/equipment-list">
                <ListItemIcon sx={{ color: 'white' }}><Inventory /></ListItemIcon>
                <ListItemText primary="Thiết Bị" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/consumable-list">
                <ListItemIcon sx={{ color: 'white' }}><Inventory /></ListItemIcon>
                <ListItemText primary="Vật Tư Tiêu Hao" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="staff/new-list">
                <ListItemIcon sx={{ color: 'white' }}><Newspaper /></ListItemIcon>
                <ListItemText primary="Tin Tức" />
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

export default StaffLayout;

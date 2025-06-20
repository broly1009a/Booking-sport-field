// ManagerHeader.jsx
import * as React from 'react';
import {
  AppBar, Box, Toolbar, Typography, Menu, Container,
  Tooltip, MenuItem, Link
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import Person3Icon from '@mui/icons-material/Person3';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import ProfileDialog from '../dialogs/profileDialog';

function ManagerHeader() {
  const navigate = useNavigate();
  const { currentUser, isUserLoggedIn } = useAuth();
  const [user, setUser] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [openProfileDialog, setOpenProfileDialog] = React.useState(false);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleSignOut = () => navigate('/sign-out');

  React.useEffect(() => {
    if (isUserLoggedIn) {
      setUser(currentUser);
    }
  }, [currentUser, isUserLoggedIn]);

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#0b3d91', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <SportsSoccerIcon onClick={() => navigate('/manager/booking-list')} sx={{ mr: 2, cursor: 'pointer' }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/manager/booking-list"
              sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              SPORT FIELD MANAGER
            </Typography>

            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Thông tin tài khoản">
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleOpenUserMenu}>
                  <Person3Icon />
                  <Typography sx={{ ml: 1, fontWeight: 600 }}>
                    {user ? `QLV: ${user.lname} ${user.fname}` : 'Quản lý viên'}
                  </Typography>
                </Box>
              </Tooltip>

              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { handleCloseUserMenu(); setOpenProfileDialog(true); }}>
                  <Typography textAlign="center">Thông tin tài khoản</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Đăng xuất</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <ProfileDialog open={openProfileDialog} setOpen={setOpenProfileDialog} />
    </>
  );
}

export default ManagerHeader;

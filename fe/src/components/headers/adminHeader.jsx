import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Person3Icon from '@mui/icons-material/Person3';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { useAuth } from '../../contexts/authContext';
import ProfileDialog from '../dialogs/profileDialog';

function AdminHeader() {
    const navigate = useNavigate();
    const { currentUser, isUserLoggedIn } = useAuth();
    const [user, setUser] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openProfileDialog, setOpenProfileDialog] = React.useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSignOut = async () => {
        return navigate('/sign-out');
    }

    React.useEffect(() => {
        if (isUserLoggedIn) {
            setUser(currentUser);
        }
    }, [currentUser, isUserLoggedIn])
   const drawerWidth = 240;
    return (
        <>
           <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: '#006D38',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    boxShadow: 'none',
                    borderBottom: '1px solid #ccc',
                    transition: 'width 0.3s ease-in-out',
                    '&:hover': {
                        backgroundColor: '#006D38',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <SportsSoccerIcon onClick={() => navigate('/admin/dish')} sx={{ cursor: 'pointer', display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/admin/dish"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            FSF Admin Dashboard
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="cài đặt">
                                <Box sx={{ display: 'flex' }} style={{ cursor: "pointer" }} onClick={handleOpenUserMenu}>
                                    <Person3Icon sx={{ p: 0 }}> </Person3Icon>


                                    <Link
                                        sx={{ ml: 1, textAlign: 'center', fontWeight: "bold" }}
                                        component="button"
                                        color="inherit"
                                        variant="body1"
                                        underline="hover"
                                    >
                                        Quản trị viên : {user?.lname} {user?.fname}
                                    </Link>
                                </Box>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem onClick={handleCloseUserMenu}>
                                    <Typography sx={{ textAlign: 'center' }} onClick={() => setOpenProfileDialog(true)}>Thông tin tài khoản</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleSignOut}>
                                    <Typography sx={{ textAlign: 'center' }}>Đăng xuất</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <ProfileDialog open={openProfileDialog} setOpen={setOpenProfileDialog}></ProfileDialog>
        </>
    );
}
export default AdminHeader;

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
import TableBarIcon from '@mui/icons-material/TableBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ProfileDialog from '../dialogs/profileDialog';
// import BookingHistoryDialog from '../dialogs/bookingHistoryDialog';
import Link from '@mui/material/Link';
import { useAuth } from '../../contexts/authContext';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
const theme = createTheme({
    palette: {
        primary: {
            main: '#006D38',
        },
        secondary: {
            main: '#ffff',
        },
    },
});

function CustomerHeader() {
    const navigate = useNavigate();
    const { currentUser, isUserLoggedIn } = useAuth();
    const [user, setUser] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openProfileDialog, setOpenProfileDialog] = React.useState(false);
    // const [openBookingHistoryDialog, setOpenBookingHistoryDialog] = React.useState(false);
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

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="fixed">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <SportsSoccerIcon onClick={() => navigate('/')} sx={{ cursor: 'pointer', display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
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
                            FPT
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/yard')}
                            >
                                Danh sách Sân
                            </Link>
                        <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/matchmaking-list')}
                            >
                                Ghép trận
                            </Link>
                            <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/voucher')}
                            >
                                Ưu đãi hấp dẫn
                            </Link>
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
                                        Tài khoản : {user?.lname} {user?.fname}
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
                                    {/* <Typography sx={{ textAlign: 'center' }} onClick={() => setOpenBookingHistoryDialog(true)}>Xem trạng thái đặt sân</Typography> */}
                                </MenuItem>
                                <MenuItem onClick={handleCloseUserMenu}>
                                    <Typography sx={{ textAlign: 'center' }} onClick={() => setOpenProfileDialog(true)}>Thông tin tài khoản</Typography>
                                </MenuItem>
                                {/* Lịch sử đặt lịch */}
                                <MenuItem onClick={handleCloseUserMenu}>
                                    <Typography sx={{ textAlign: 'center' }} onClick={() => navigate('/booking-history')}>Lịch sử đặt sân</Typography>
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
            {/* <BookingHistoryDialog open={openBookingHistoryDialog} setOpen={setOpenBookingHistoryDialog} ></BookingHistoryDialog> */}
        </ThemeProvider>
    );
}
export default CustomerHeader;

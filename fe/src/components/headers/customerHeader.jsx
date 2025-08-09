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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ProfileDialog from '../dialogs/profileDialog';
import Link from '@mui/material/Link';
import { useAuth } from '../../contexts/authContext';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import WalletIcon from '@mui/icons-material/Wallet';
import { walletService } from '../../services/api/walletService';
import TopUpWalletDialog from '../dialogs/TopUpWalletDialog';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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
    const [wallet, setWallet] = React.useState(null);
    const [walletLoading, setWalletLoading] = React.useState(false);
    const [showTopUpDialog, setShowTopUpDialog] = React.useState(false);

    // Reload ví khi cần (sau khi nạp tiền xong)
    const fetchWallet = React.useCallback(() => {
        if (isUserLoggedIn && currentUser?._id) {
            setWalletLoading(true);
            walletService.getWallet(currentUser._id)
                .then(res => {
                    if (res?.wallet) setWallet(res.wallet);
                    else setWallet(null);
                })
                .catch(() => setWallet(null))
                .finally(() => setWalletLoading(false));
        }
    }, [isUserLoggedIn, currentUser]);

    React.useEffect(() => {
        fetchWallet();
        // eslint-disable-next-line
    }, [fetchWallet]);

    // Reload ví khi quay lại trang từ VNPAY
    React.useEffect(() => {
        window.addEventListener('focus', fetchWallet);
        return () => window.removeEventListener('focus', fetchWallet);
    }, [fetchWallet]);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSignOut = async () => {
        return navigate('/sign-out');
    };

    React.useEffect(() => {
        if (isUserLoggedIn) {
            setUser(currentUser);
        }
    }, [currentUser, isUserLoggedIn]);

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
                                onClick={() => navigate('/event')}
                            >
                                Sự kiện
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
                            <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/about')}
                            >
                                Giới thiệu
                            </Link>
                            <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/news')}
                            >
                                TIN TỨC
                            </Link>
                            <Link
                                sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body2"
                                underline="hover"
                                onClick={() => navigate('/favorite')}
                            >
                                Danh sách yêu thích
                            </Link>
                                <Link
                                    sx={{ ml: 3, textAlign: 'center', textTransform: "uppercase", fontWeight: "bold" }}
                                    component="button"
                                    color="inherit"
                                    variant="body2"
                                    underline="hover"
                                    onClick={() => navigate('/policy')}
                                >
                                    Chính sách pháp lý
                                </Link>
                            </Box>
                        {/* Ví và nạp tiền */}
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', mr: 2 }}>
                            {walletLoading ? (
                                <CircularProgress size={24} sx={{ mr: 2 }} />
                            ) : (
                                <Tooltip title="Nạp thêm tiền vào ví">
                                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowTopUpDialog(true)}>
                                        <WalletIcon sx={{ color: '#white', mr: 0.5 }} />
                                        <Typography sx={{ fontWeight: 'bold', color: '#white', mr: 1 }}>
                                            {wallet?.balance?.toLocaleString()}đ
                                        </Typography>
                                        <AddCircleOutlineIcon color="primary" />
                                    </Box>
                                </Tooltip>
                            )}
                        </Box>
                        {/* User menu */}
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
                                {/* Lịch sử ghép trận */}
                                <MenuItem onClick={handleCloseUserMenu}>
                                    <Typography sx={{ textAlign: 'center' }} onClick={() => navigate('/matchmaking-history')}>Lịch sử ghép trận</Typography>
                                </MenuItem>
                                {/* Lịch sử giao dịch ví */}
                                <MenuItem onClick={handleCloseUserMenu}>
                                    <Typography sx={{ textAlign: 'center' }} onClick={() => navigate('/wallet-history')}>Lịch sử giao dịch ví</Typography>
                                </MenuItem>
                                {/* Nạp tiền vào ví */}
                                <MenuItem onClick={() => {
                                    setShowTopUpDialog(true);
                                    handleCloseUserMenu();
                                }}>
                                    <Typography sx={{ textAlign: 'center' }}>Nạp tiền vào ví</Typography>
                                </MenuItem>
                                {/* Đăng xuất */}
                                <MenuItem onClick={handleSignOut}>
                                    <Typography sx={{ textAlign: 'center' }}>Đăng xuất</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <ProfileDialog open={openProfileDialog} setOpen={setOpenProfileDialog} />
            <TopUpWalletDialog
                open={showTopUpDialog}
                onClose={() => setShowTopUpDialog(false)}
                userId={currentUser?._id}
            />
        </ThemeProvider>
    );
}
export default CustomerHeader;
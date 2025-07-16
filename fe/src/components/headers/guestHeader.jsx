import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Person3Icon from '@mui/icons-material/Person3';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TableBarIcon from '@mui/icons-material/TableBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoginDialog from '../dialogs/loginDialog'
import RegisterDialog from '../dialogs/registerDialog';
import Link from '@mui/material/Link';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function GuestHeader() {
    const navigate = useNavigate();
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);

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
                        </Box>
                        <Box sx={{ display: 'flex' }} >
                            <Person3Icon sx={{ p: 0 }}> </Person3Icon>
                          {/* direct to /login page */}
                            <Link
                                sx={{ ml: 1, textAlign: 'center', fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body1"
                                underline="hover"
                            //   onClick={() => navigate('/login')}
                                onClick={() => setOpenLogin(true)}
                            >
                                Đăng nhập
                            </Link>
                            <Typography sx={{ ml: 1, textAlign: 'center' }}>/</Typography>
                            <Link
                                sx={{ ml: 1, textAlign: 'center', fontWeight: "bold" }}
                                component="button"
                                color="inherit"
                                variant="body1"
                                underline="hover"
                            //    onClick={() => navigate('/register')}
                                onClick={() => setOpenRegister(true)}
                            >
                                Đăng ký
                            </Link>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <LoginDialog open={openLogin} setOpen={setOpenLogin}></LoginDialog>
            <RegisterDialog open={openRegister} setOpen={setOpenRegister}></RegisterDialog>
        </ThemeProvider>
    );
}
export default GuestHeader;

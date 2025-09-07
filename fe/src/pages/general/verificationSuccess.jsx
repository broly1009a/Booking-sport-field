import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4caf50', // xanh lá cây
        },
        background: {
            default: '#ffffff',
        },
    },
});

const VerificationSuccess = () => {
    const navigate = useNavigate();
    const { isUserLoggedIn } = useAuth();
    const [count, setCount] = useState(5);

    useEffect(() => {
        document.title = "FSF | Xác Thực Thành Công";
        const intervalId = setInterval(() => {
            setCount(prev => {
                if (prev === 1) {
                    clearTimeout(intervalId);
                    navigate('/');
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (isUserLoggedIn) {
            const signOut = async () => {
                await doSignOut();
            };
            signOut();
        }
    }, [isUserLoggedIn]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'background.default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Card
                    sx={{
                        textAlign: 'center',
                        px: 4,
                        py: 5,
                        bgcolor: '#e6ffe6', // màu xanh lá nhạt
                        boxShadow: 3,
                        borderRadius: 3,
                        minWidth: 350
                    }}
                >
                    <CardContent>
                        <CheckCircleIcon
                            sx={{ fontSize: 100, color: '#4caf50', mb: 2 }}
                        />
                        <Typography variant="h4" component="div" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            Xác thực thành công!
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mt: 2, color: '#2e7d32' }}>
                            Chào mừng bạn đến với hệ thống đặt sân của chúng tôi.
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1, color: '#2e7d32' }}>
                            Trở về trang chủ sau {count} giây.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </ThemeProvider>
    );
};

export default VerificationSuccess;

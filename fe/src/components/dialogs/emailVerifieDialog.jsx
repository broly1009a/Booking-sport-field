import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import UserService from '../../services/userService';
import { useState } from 'react';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import LoadingOverlay from '../general/loadingOverlay';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#006D38',
        },
        secondary: {
            main: '#FFAF00',
        },
    },
});

export default function EmailVerifierDialog({ open, setOpen, email }) {
    // Snackbar state
    const [openNotification, setOpenNotification] = useState(false);
    const [messageNotification, setMessageNotification] = useState('');
    const [severityNotification, setSeverityNotification] = useState('info');
    const [loading, setLoading] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };

    const handleSendEmailVerification = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await UserService.sendEmailVerification(email);
            setSeverityNotification('success');
            setMessageNotification("Chúng tôi đã gửi vào email của bạn, hãy kiểm tra!");
            setOpenNotification(true);
            setLoading(false);
            handleClose();
        } catch (error) {
            setSeverityNotification('error');
            setMessageNotification(error?.response?.data?.message || error.message);
            setOpenNotification(true);
            setLoading(false);
        }
        return;
    }

    return (
        <React.Fragment>
            <NotificationSnackbar open={openNotification} setOpen={setOpenNotification} message={messageNotification} severity={severityNotification}></NotificationSnackbar>
            <ThemeProvider theme={theme}>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <LoadingOverlay open={loading}></LoadingOverlay>
                    <DialogTitle id="alert-dialog-title">
                        {"Email của bạn chưa được xác thực"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Nếu bạn đã làm mất mail xác thực hãy bấm vào gửi lại mail. Chúng tôi luôn luôn hỗ trợ bạn!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Bỏ qua</Button>
                        <Button onClick={handleSendEmailVerification} autoFocus>
                            Gửi lại mail
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </React.Fragment>
    );
}

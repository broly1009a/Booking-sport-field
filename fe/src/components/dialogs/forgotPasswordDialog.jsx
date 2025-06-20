import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import Divider from '@mui/material/Divider';
import DialogContentText from '@mui/material/DialogContentText';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import UserService from '../../services/userService';
import LoadingOverlay from '../general/loadingOverlay';

export default function ForgotPasswordDialog({ open, setOpen }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    // Snackbar state
    const [openNotification, setOpenNotification] = useState(false);
    const [messageNotification, setMessageNotification] = useState('');
    const [severityNotification, setSeverityNotification] = useState('info');

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        if (email.trim().length === 0) {
            setSeverityNotification("error");
            setMessageNotification("Không được để trống Email!");
            setOpenNotification(true);
            return;
        }
        setLoading(true);
        try {
            await UserService.resetPassword(email);
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

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth={true}
                maxWidth={"xs"}
            >
                <LoadingOverlay open={loading}></LoadingOverlay>
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 'h4.fontSize', textAlign: 'center' }}>Quên mật khẩu</DialogTitle>
                <DialogContentText sx={{ fontSize: 'normal', textAlign: 'center', mb: 2 }}>
                    Nhập địa chỉ email chúng tôi sẽ xử lý giúp bạn
                </DialogContentText>
                <Divider orientation="horizontal" flexItem />
                <DialogContent >
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        label="Địa chỉ email"
                        type="email"
                        fullWidth
                        variant="standard"
                        onChange={e => setEmail(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={(event) => { handleOnSubmit(event) }}>Xác nhận</Button>
                </DialogActions>
            </Dialog>
            <NotificationSnackbar open={openNotification} setOpen={setOpenNotification} message={messageNotification} severity={severityNotification}></NotificationSnackbar>
        </React.Fragment >
    );
}
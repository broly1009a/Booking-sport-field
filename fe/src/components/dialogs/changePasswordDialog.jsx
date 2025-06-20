import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import { useAuth } from '../../contexts/authContext'
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import { doSignInWithEmailAndPassword, doSignOut, doUpdatePassword } from '../../firebase/auth';
import LoadingOverlay from '../general/loadingOverlay';

export default function ChangePasswordDialog({ open, setOpen }) {
    const [loading, setLoading] = React.useState(false);
    const { currentUser, refreshUserData } = useAuth();
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [renewPassword, setRenewPassword] = useState("");

    // Snackbar state
    const [openNotification, setOpenNotification] = useState(false);
    const [messageNotification, setMessageNotification] = useState('');
    const [severityNotification, setSeverityNotification] = useState('info');

    const handleClose = () => {
        setOpen(false);
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();

        if (password.length === 0) {
            setSeverityNotification("error");
            setMessageNotification("Bạn chưa nhập lại mật khẩu!")
            setOpenNotification(true);
            return;
        }
        if (newPassword !== renewPassword) {
            setSeverityNotification("error");
            setMessageNotification("Nhập lại mật khẩu mới sai!")
            setOpenNotification(true);
            return;
        }
        if (newPassword === password) {
            setSeverityNotification("error");
            setMessageNotification("Mật khẩu mới không thể giống mật khẩu cũ!")
            setOpenNotification(true);
            return;
        }
        setLoading(true);
        try {
            await doSignInWithEmailAndPassword(currentUser?.email, password);
            await doUpdatePassword(newPassword);
            await refreshUserData();
            setSeverityNotification("success");
            setMessageNotification("Thay đổi mật khẩu thành công!");
            setOpenNotification(true);
            handleClose();
            setLoading(false);
        } catch (error) {
            setSeverityNotification("error");
            if (error.code === 'auth/invalid-credential') {
                setMessageNotification("Mật khẩu cũ không chính xác!");
            }
            else {
                setMessageNotification(error.message);
            }
            setOpenNotification(true);
            setLoading(false);
            return;
        }
    }

    return (
        <React.Fragment>
            <NotificationSnackbar open={openNotification} setOpen={setOpenNotification} message={messageNotification} severity={severityNotification}></NotificationSnackbar>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <LoadingOverlay open={loading}></LoadingOverlay>
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 'h4.fontSize', textAlign: 'center' }}>Thay đổi mật khẩu</DialogTitle>
                <Divider orientation="horizontal" flexItem />
                <DialogContent>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1}>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Mật khẩu mới"
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Nhập lại mật khẩu mới"
                                    type="password"
                                    value={renewPassword}
                                    onChange={e => setRenewPassword(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Mật khẩu cũ"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Thoát</Button>
                    <Button onClick={(event) => { handleOnSubmit(event) }}>Lưu lại</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}
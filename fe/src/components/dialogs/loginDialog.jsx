import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import { useState } from 'react';
import Divider from '@mui/material/Divider';
import DialogContentText from '@mui/material/DialogContentText';
import { useAuth } from "../../contexts/authContext";
import LoadingOverlay from '../general/loadingOverlay';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import ForgotPasswordDialog from './forgotPasswordDialog';
import { useNavigate } from 'react-router-dom';
export default function LoginDialog({ open, setOpen }) {
    const navigate = useNavigate();
    const { isUserLoggedIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);

    // Snackbar state
    const [openNotification, setOpenNotification] = useState(false);
    const [messageNotification, setMessageNotification] = useState('');
    const [severityNotification, setSeverityNotification] = useState('info');

    const handleClose = () => {
        setOpen(false);
    };
    const handleOnSubmit = async (event) => {
        event.preventDefault();
        if (!isUserLoggedIn) {
            try {
                await doSignInWithEmailAndPassword(email, password);
                handleClose();
                navigate('/');
            } catch (error) {
                setMessageNotification("Tài khoản hoặc mật khẩu của bạn không chính xác");
                setSeverityNotification("error");
                setOpenNotification(true);
            }
        }
    }

    return (
        <React.Fragment>
            <NotificationSnackbar open={openNotification} setOpen={setOpenNotification} message={messageNotification} severity={severityNotification}></NotificationSnackbar>
            <ForgotPasswordDialog open={openForgotPasswordDialog} setOpen={setOpenForgotPasswordDialog}></ForgotPasswordDialog>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <LoadingOverlay open={loading}></LoadingOverlay>
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 'h4.fontSize', textAlign: 'center' }}>Đăng nhập</DialogTitle>
                <DialogContentText sx={{ fontSize: 'normal', textAlign: 'center', mb: 2 }}>
                    Chào mừng bạn đến với FPT Sports Field! Vui lòng đăng nhập để tiếp tục.
                </DialogContentText>
                <Divider orientation="horizontal" flexItem />
                <DialogContent>
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
                    <TextField
                        required
                        margin="dense"
                        label="Mật khẩu"
                        type="password"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setPassword(e.target.value)}

                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => {
                        handleClose()
                        return setOpenForgotPasswordDialog(true);
                    }} sx={{ mr: 'auto' }}>Quên mật khẩu</Button>
                        <Button onClick={() => {
                        handleClose()
                        return navigate('/register');
                    }} >Đăng ký</Button>
                    <Button onClick={(event) => { handleOnSubmit(event) }}>Đăng nhập</Button>
                
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}
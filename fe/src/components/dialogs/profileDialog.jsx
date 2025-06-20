import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../contexts/authContext';
import { formatDate } from '../../utils/handleFormat';
import EditProfileDialog from './editProfileDialog';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ChangePasswordDialog from './changePasswordDialog';
const borderStyles = {
    bgcolor: 'background.paper',
    border: 1,
    borderRadius: '16px',
    BorderColor: '#006D38'
};

export default function ProfileDialog({ open, setOpen }) {
    const { currentUser } = useAuth();
    const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);

    useEffect(() => {
        setFname(currentUser?.fname);
        setLname(currentUser?.lname);
        setEmail(currentUser?.email);
        setPhoneNumber(currentUser?.phoneNumber);
        setDob(currentUser?.dob);
        setGender(currentUser?.gender == 'MALE' ? 'Nam' : 'Nữ');
    }, [useAuth, open])

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Dialog
                sx={{ width: '100%' }}
                maxWidth='md'
                open={open}
                onClose={handleClose}
            >

                <DialogTitle>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black', p: 2, textTransform: 'uppercase', color: "#006D38" }}>
                        Thông tin cá nhân
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent >
                    <Grid container spacing={3}>
                        <Grid size={12} >
                            <Box sx={{ ...borderStyles, p: 1 }}>
                                <Box sx={{ p: 2, display: 'flex' }}>
                                    <Grid container spacing={4}>
                                        <Grid size={6}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Họ
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={lname}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={6} >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Tên
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={fname}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>


                                        <Grid size={6} >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Địa chỉ email
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={email}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={6} >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Số điện thoại
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={phoneNumber}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={3} >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Ngày sinh
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={formatDate(dob)}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={3} >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                                                        Giới tính
                                                    </Typography>
                                                </Box>
                                                <TextField variant="outlined" sx={{ width: "100%" }} size="small"
                                                    value={gender}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ mx: 2, mr: 'auto' }}>
                        <Button
                            onClick={() => {
                                setOpenEditProfileDialog(true)
                                handleClose()
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }} >
                                Sửa thông tin cá nhân
                            </Typography>
                        </Button>
                        <Button onClick={handleClose} sx={{ mx: 4 }} onClickCapture={() => {
                            setOpenChangePasswordDialog(true);
                            return handleClose()
                        }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                Thay đổi mật khẩu
                            </Typography>
                        </Button>
                    </Box>
                    <Button onClick={handleClose} sx={{ mx: 2 }} >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Quay lại
                        </Typography>
                    </Button>
                </DialogActions>
            </Dialog>
            <EditProfileDialog open={openEditProfileDialog} setOpen={setOpenEditProfileDialog}></EditProfileDialog>
            <ChangePasswordDialog open={openChangePasswordDialog} setOpen={setOpenChangePasswordDialog}></ChangePasswordDialog>
        </React.Fragment >
    );
}

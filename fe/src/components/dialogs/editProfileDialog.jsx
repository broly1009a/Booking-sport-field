import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext'
import UserService from '../../services/userService';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import LoadingOverlay from '../general/loadingOverlay';

var daysSelect = [];
var monthsSelect = [];
var yearsSelect = [];
var i;
for (i = 1; i <= 31; i++) {
    daysSelect.push(i);
}

for (i = 1; i <= 12; i++) {
    monthsSelect.push(i);
}

for (i = 2024; i >= 1906; i--) {
    yearsSelect.push(i);
}

export default function EditProfileDialog({ open, setOpen }) {
    const [loading, setLoading] = React.useState(false);
    const { currentUser, refreshUserData } = useAuth();

    const [firstName, setFirstName] = useState(currentUser?.fname);
    const [lastName, setLastName] = useState(currentUser?.lname);
    const [day, setDay] = useState(1);
    const [month, setMonth] = useState(1);
    const [year, setYear] = useState(2024);
    const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber);
    const [gender, setGender] = useState(currentUser?.gender);
    const [password, setPassword] = useState("");

    // Snackbar state
    const [openNotification, setOpenNotification] = useState(false);
    const [messageNotification, setMessageNotification] = useState('');
    const [severityNotification, setSeverityNotification] = useState('info');

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const d = new Date(currentUser?.dob);
        setDay(d.getDate());
        setMonth(d.getMonth());
        setYear(d.getFullYear());
        currentUser?.dob.getMonth
    }, [currentUser])

    const handleOnSubmit = async (event) => {
        event.preventDefault();

        if (password.length === 0) {
            setMessageNotification("Bạn chưa nhập lại mật khẩu!");
            setSeverityNotification('error');
            setOpenNotification(true);
            return;
        }
        if (firstName.length === 0 || firstName.length === 0 || phoneNumber.length === 0) {
            setMessageNotification("Các trường thông tin không thể để trống!")
            setSeverityNotification('error');
            setOpenNotification(true);
            return;
        }
        setLoading(true);
        try {
            await doSignInWithEmailAndPassword(currentUser?.email, password);
            const dob = `${month}-${day}-${year}`;
            const filter = {
                fname: firstName, lname: lastName, dob, phoneNumber, gender
            }
            await UserService.updateCustomerInfo(filter);
            await refreshUserData();
            setSeverityNotification('success');
            setMessageNotification("Thay đổi thông tin cá nhân thành công!");
            setOpenNotification(true);
            setLoading(false);
            return handleClose();
        } catch (error) {
            setSeverityNotification('error');
            if (error.code === 'auth/invalid-credential') {
                setMessageNotification("Mật khẩu không chính xác!");
            }
            else {
                setMessageNotification(error.message);
            }
            setOpenNotification(true);
            return setLoading(false);
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
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 'h4.fontSize', textAlign: 'center' }}>Chỉnh sửa thông tin cá nhân</DialogTitle>
                <Divider orientation="horizontal" flexItem />
                <DialogContent>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1}>
                            <Grid size={7} sx={{ mt: 1 }} >
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Họ"
                                    placeholder="ví dụ: Phạm Văn"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={5} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    id="outlined-textarea"
                                    label="Tên"
                                    placeholder="ví dụ: Tiến"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={12} sx={{ mt: 1 }}>
                                <FormControl>
                                    <FormLabel>Ngày sinh</FormLabel>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={day}
                                        onChange={e => setDay(e.target.value)}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        {
                                            daysSelect.map(item => {
                                                return (
                                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={month}
                                        onChange={e => setMonth(e.target.value)}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        {
                                            monthsSelect.map(item => {
                                                return (
                                                    <MenuItem key={item} value={item}>tháng {item}</MenuItem>
                                                )
                                            })
                                        }

                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        {
                                            yearsSelect.map(item => {
                                                return (
                                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={12} sx={{ mt: 1 }}>
                                <FormControl>
                                    <FormLabel>Giới tính</FormLabel>
                                    <RadioGroup
                                        row
                                        value={gender}
                                        onChange={e => setGender(e.target.value)}
                                    >
                                        <FormControlLabel value="FEMALE" control={<Radio />} label="Nữ giới" />
                                        <FormControlLabel value="MALE" control={<Radio />} label="Nam giới" />
                                        <FormControlLabel value="OTHER" control={<Radio />} label="Khác" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Số điện thoại"
                                    placeholder="ví dụ: 123456789"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Nhập lại mật khẩu"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required={true}
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid size={12} sx={{ mt: 3 }}>
                                <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                                    Hãy kiểm trả kĩ thông tin cá nhân, chúng tôi sẽ dựa vào chúng để có thể liên hệ với bạn
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Thoát</Button>
                    <Button onClick={(event) => { handleOnSubmit(event) }}>Cập nhập</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}
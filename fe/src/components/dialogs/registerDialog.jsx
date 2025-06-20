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
import DialogContentText from '@mui/material/DialogContentText';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext'
import UserService from '../../services/userService';
import ThankForSignUp from './thankForSignUp';
import LoadingOverlay from '../general/loadingOverlay';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import { useNavigate } from 'react-router-dom';
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

export default function RegisterDialog({ open, setOpen }) {
    const [showNotice, setShowNotice] = useState(false);
    const [showThank, setShowThank] = useState(false);
    const [noticeContent, setNoticeContent] = useState('');
    const [loading, setLoading] = React.useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [day, setDay] = useState(1);
    const [month, setMonth] = useState(1);
    const [year, setYear] = useState(2024);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("MALE");
    const { isUserLoggedIn } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const date = new Date();
        setDay(date.getDate());
        setMonth(date.getMonth() + 1);
        setYear(date.getFullYear());
    }, []);

    const handleClose = () => {
        // quay lại trang trước /login
         setOpen(false);
        navigate(-1); 
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        if (!isUserLoggedIn) {
            setLoading(true);
            try {
                const dob = `${month}-${day}-${year}`;
                const filter = {
                    fname: firstName,
                    lname: lastName,
                    dob,
                    phoneNumber,
                    email,
                    gender,
                    password
                }
                await UserService.registerCustomerAccount(filter);
                setLoading(false);
                setShowThank(true);
                handleClose();
            } catch (error) {
                setShowNotice(true);
                setNoticeContent(error.message);
                setLoading(false);
            }
        }
    }

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <LoadingOverlay open={loading}></LoadingOverlay>
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 'h4.fontSize', textAlign: 'center' }}>Đăng ký</DialogTitle>
                <DialogContentText sx={{ fontSize: 'normal', textAlign: 'center' }}>
                    Tạo tài khoản một cách nhanh chóng
                </DialogContentText>
                <Divider orientation="horizontal" flexItem />
                <DialogContent>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1}>
                            <Grid size={7} sx={{ mt: 1 }} >
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Họ"
                                    placeholder="ví dụ: Nguyễn Văn"
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
                                    placeholder="ví dụ: ABC"
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
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Số điện thoại liên hệ"
                                    placeholder="ví dụ: 123456789"
                                    type="number"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required={true}

                                />
                            </Grid>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Địa chỉ email"
                                    placeholder="ví dụ: xxx.dev@gmail.com"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={6} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Password"
                                    placeholder="ví dụ: Abcd1234@"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required={true}
                                />
                            </Grid>
                            <Grid size={12} sx={{ mt: 1 }}>
                                <FormControl

                                >
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
                            <Grid size={12} sx={{ mt: 3 }}>
                                <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                                    Bằng cách nhấp vào Đăng ký, bạn đồng ý với Điều khoản, Chính sách bảo mật và Chính sách cookie của chúng tôi. Bạn có thể nhận được thông báo qua SMS từ chúng tôi và có thể chọn không tham gia bất kỳ lúc nào.
                                </Typography>
                            </Grid>
                        </Grid>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Quay lại</Button>
                    <Button onClick={(event) => { handleOnSubmit(event) }}>Đăng ký</Button>
                </DialogActions>
            </Dialog>
            <NotificationSnackbar open={showNotice} setOpen={setShowNotice} message={noticeContent} severity={'error'}></NotificationSnackbar>
            <ThankForSignUp open={showThank} setOpen={setShowThank}></ThankForSignUp>
        </React.Fragment >
    );
}
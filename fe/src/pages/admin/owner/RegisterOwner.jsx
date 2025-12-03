import React, { useState,useEffect } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import UserService from '../../../services/userService';
import { toast } from 'react-toastify';
const RegisterOwner = () => {
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [dob, setDob] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('MANAGER');
    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        setDob(currentDate);
    }, []);
    const validateEmail = (email) => {
       return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate email before submitting
            if (!validateEmail(email)) {
                toast.error('Email phải có đuôi @fpt.edu.vn');
                return;
            }
            
            const filter = { fname, lname, dob, phoneNumber, email, gender, password, role };
            await UserService.registerAndVerifyAccount(filter);
            toast.success('Tạo tài khoản thành công!');
            // Reset form fields
            setFname('');
            setLname('');
            setDob('');
            setPhoneNumber('');
            setEmail('');
            setGender('');
            setPassword('');
            setRole('');
        } catch (error) {
            console.error('Error creating user:', error?.message);
            toast.error(error?.message || 'Đã xảy ra lỗi khi tạo tài khoản.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <TextField label="Họ" value={fname} onChange={(e) => setFname(e.target.value)} fullWidth margin="normal" />
            <TextField label="Tên" value={lname} onChange={(e) => setLname(e.target.value)} fullWidth margin="normal" />
            <TextField label="Ngày sinh" type="date" value={dob} onChange={(e) => setDob(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth margin="normal" />
            <TextField 
                label="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
                margin="normal"
                helperText={email && !validateEmail(email) ? "Email phải có đuôi @fpt.edu.vn" : ""}
                error={email && !validateEmail(email)}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Giới tính</InputLabel>
                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <MenuItem value="MALE">Nam giới</MenuItem>
                    <MenuItem value="FEMALE">Nữ giới</MenuItem>
                    <MenuItem value="OTHER">Giới tính khác</MenuItem>
                </Select>
            </FormControl>
            <TextField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
                <InputLabel>Vai trò</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    {/* <MenuItem value="ADMIN">Quản trị viên</MenuItem> */}
                    <MenuItem value="MANAGER">Chủ sân</MenuItem>
                    {/* <MenuItem value="CUSTOMER">Khách hàng</MenuItem>  */}
                </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary">Tạo mới</Button>
        </Box>
    );
};

export default RegisterOwner;
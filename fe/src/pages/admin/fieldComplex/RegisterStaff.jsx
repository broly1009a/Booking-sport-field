import React, { useState,useEffect } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import UserService from '../../../services/userService';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
const RegisterStaff = () => {
    const { complexId } = useParams();
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [dob, setDob] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [role] = useState('STAFF');
    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        setDob(currentDate);
    }, []);
    const validateEmail = (email) => {
        return email.endsWith('@fpt.edu.vn');
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
            // Tạo staff mới
            const userRes = await UserService.registerAndVerifyAccount(filter);
            // Nếu tạo thành công và có complexId, cập nhật fieldComplex
            if (userRes?.data?._id && complexId) {
                await fieldComplexService.addStaffToFieldComplex(complexId, userRes.data._id);
            }
            toast.success('Tạo tài khoản thành công!');
            // Reset form fields
            setFname('');
            setLname('');
            setDob('');
            setPhoneNumber('');
            setEmail('');
            setGender('');
            setPassword('');
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
            {/* Trường vai trò đã được ẩn, mặc định là STAFF */}
            <Button type="submit" variant="contained" color="primary">Tạo mới</Button>
        </Box>
    );
};

export default RegisterStaff;
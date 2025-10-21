import React, { useState } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import UserService from '../../../services/userService';
import { toast } from 'react-toastify';
const UpdateOwner = ({ user, onClose }) => {
    const [fname, setFname] = useState(user?.fname || '');
    const [lname, setLname] = useState(user?.lname || '');
    const [dob, setDob] = useState(user?.dob ? new Date(user.dob).toISOString().split("T")[0] : '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [role, setRole] = useState(user?.role || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.updateAccountInfo(user._id, fname, lname, dob, phoneNumber, gender, role);
            toast.success('Cập nhật thông tin người dùng thành công!');
            onClose(); // Close dialog after updating
        } catch (error) {
            console.error('Error updating user:', error?.message);
            toast.error(error?.message || 'Đã xảy ra lỗi khi cập nhật thông tin người dùng.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <TextField label="Họ" value={fname} onChange={(e) => setFname(e.target.value)} fullWidth margin="normal" />
            <TextField label="Tên" value={lname} onChange={(e) => setLname(e.target.value)} fullWidth margin="normal" />
            <TextField label="Ngày sinh" type="date" value={dob} onChange={(e) => setDob(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
                <InputLabel>Giới tính</InputLabel>
                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <MenuItem value="MALE">Nam giới</MenuItem>
                    <MenuItem value="FEMALE">Nữ giới</MenuItem>
                    <MenuItem value="OTHER">Giới tính khác</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Vai trò</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                    <MenuItem value="MANAGER">Quản lí viên</MenuItem>
                    <MenuItem value="CUSTOMER">Khách hàng</MenuItem>               
                </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary">Cập nhật</Button>
        </Box>
    );
};

export default UpdateOwner;

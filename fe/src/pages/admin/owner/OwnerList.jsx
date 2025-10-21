import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Pagination, TextField, Select, MenuItem, FormControl, InputLabel, Button, Dialog,
    DialogTitle, DialogContent, Grid, Box, Breadcrumbs, Typography, Tooltip
} from '@mui/material';
import { toast } from 'react-toastify';
import UserService from '../../../services/userService';
import { formatDate } from '../../../utils/handleFormat';
import UpdateOwner from './UpdateOwner';
import RegisterOwner from './RegisterOwner';

const roleMapping = {
    ADMIN: 'Quản trị viên',
    MANAGER: 'Quản lí viên',
    CUSTOMER: 'Khách hàng',
    STAFF: 'Nhân viên'
};
const getRoleInVietnamese = (role) => roleMapping[role] || 'Không xác định';

const OwnerList = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('MANAGER');
    const [totalPages, setTotalPages] = useState(1);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getPaginatedUsers(page, limit, search, role);
            setUsers(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, [page, limit, search, role]);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedUser(null);
    };

    const handleOpenRegisterDialog = () => {
        setOpenRegisterDialog(true);
    };

    const handleCloseRegisterDialog = () => {
        setOpenRegisterDialog(false);
    };

    // Kích hoạt/vô hiệu hóa tài khoản
    const handleToggleAccountStatus = async (firebaseUID, isActive) => {
        const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
        const confirm = window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`);
        if (!confirm) return;

        try {
            if (isActive) {
                await UserService.disableAccount(firebaseUID);
                toast.success('Tài khoản đã bị vô hiệu hóa.');
            } else {
                await UserService.enableAccount(firebaseUID);
                toast.success('Tài khoản đã được kích hoạt lại.');
            }
            fetchUsers();
        } catch (error) {
            toast.error(error.message || `Không thể ${action} tài khoản.`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={8}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">Quản lý tài khoản</Typography>
                    </Breadcrumbs>
                    <Box display="flex" gap={2}>
                        <TextField
                            label="Tìm kiếm"
                            placeholder="Nhập từ thông tin tìm kiếm..."
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Vai trò</InputLabel>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                                <MenuItem value="MANAGER">Quản lí viên</MenuItem>
                                <MenuItem value="CUSTOMER">Khách hàng</MenuItem>
                                <MenuItem value="STAFF">Nhân viên</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4} textAlign={{ xs: 'center', md: 'right' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenRegisterDialog}
                    >
                        Tạo tài khoản
                    </Button>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Họ</TableCell>
                            <TableCell>Tên</TableCell>
                            <TableCell>Ngày sinh</TableCell>
                            <TableCell>Số điện thoại</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Vai trò</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Công cụ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user?._id}>
                                <TableCell>{user?.fname}</TableCell>
                                <TableCell>{user?.lname}</TableCell>
                                <TableCell>{formatDate(user?.dob)}</TableCell>
                                <TableCell>{user?.phoneNumber}</TableCell>
                                <TableCell>{user?.email || 'Chưa xác minh'}</TableCell>
                                <TableCell>{getRoleInVietnamese(user?.role)}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <span
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: user?.accountStatus === 'Active' ? 'green' : user?.accountStatus === 'Disabled' ? 'red' : 'gray',
                                                display: 'inline-block',
                                            }}
                                        ></span>
                                        {user?.accountStatus === 'Active'
                                            ? 'Đang hoạt động'
                                            : user?.accountStatus === 'Disabled'
                                                ? 'Đã vô hiệu hóa'
                                                : 'Không xác định'}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" gap={1}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            Xem và sửa
                                        </Button>
                                        <Tooltip
                                            title={
                                                user.accountStatus === 'Active'
                                                    ? 'Vô hiệu hóa tài khoản'
                                                    : user.accountStatus === 'Disabled'
                                                        ? 'Kích hoạt tài khoản'
                                                        : 'Trạng thái không hợp lệ'
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="contained"
                                                    color={user.accountStatus === 'Active' ? 'error' : 'success'}
                                                    onClick={() => handleToggleAccountStatus(user.firebaseUID, user.accountStatus === 'Active')}
                                                    disabled={user.accountStatus === 'Unknown'}
                                                >
                                                    {user.accountStatus === 'Active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
            />

            {/* Dialog for UpdateOwner form */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <UpdateOwner user={selectedUser} onClose={handleCloseEditDialog} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog for RegisterOwner form */}
            <Dialog open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
                <DialogTitle>Tạo tài khoản mới</DialogTitle>
                <DialogContent>
                    <RegisterOwner />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OwnerList;
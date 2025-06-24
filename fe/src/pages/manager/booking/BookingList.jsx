import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, MenuItem, Select, FormControl, InputLabel, Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import bookingService from '../../../services/api/bookingService';
import { PublicContext } from "../../../contexts/publicContext";

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Đang chờ' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'cancelled', label: 'Đã hủy' }
];

const BookingList = ({ userId }) => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1, perPage: 5 });
    const [fromDate, setFromDate] = useState(dayjs().startOf('day'));
    const [toDate, setToDate] = useState(dayjs().endOf('day'));
    const { types, sportFields = [] } = useContext(PublicContext);
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    limit: meta.perPage,
                    from: fromDate ? fromDate.startOf('day').toISOString() : undefined,
                    to: toDate ? toDate.endOf('day').toISOString() : undefined,
                    search: search || undefined,
                };
                if (status) params.status = status;
                if (type) params.type = type;
                // if (userId) params.userId = userId;
                const res = await bookingService.getPaginatedBookings(params);
                if (res && res.data) {
                    setBookings(res.data);
                    setMeta(res.meta || { total: 0, totalPages: 1, currentPage: 1, perPage: 5 });
                } else {
                    setBookings([]);
                    setMeta({ total: 0, totalPages: 1, currentPage: 1, perPage: 5 });
                }
            } catch (error) {
                toast.error('Không thể tải danh sách đặt lịch');
            }
            setLoading(false);
        };
        fetchBookings();
    }, [fromDate, toDate, userId, page, status, type, meta.perPage, search]);

    const handleCancelBooking = async (bookingId) => {
        try {
            await bookingService.updateBooking(bookingId, { status: 'cancelled' });
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
            toast.success('Hủy đặt lịch thành công');
        } catch (error) {
            toast.error('Hủy đặt lịch thất bại');
        }
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            await bookingService.updateBooking(bookingId, { status: 'confirmed' });
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'confirmed' } : b
            ));
            toast.success('Xác nhận đặt lịch thành công');
        } catch (error) {
            toast.error('Xác nhận đặt lịch thất bại');
        }
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPage(1); // reset page khi filter thay đổi
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
            <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
                Danh sách đặt lịch
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Từ ngày"
                        value={fromDate}
                        onChange={(newValue) => { setFromDate(newValue); setPage(1); }}
                        renderInput={(params) => <TextField {...params} sx={{ width: '150px' }} />}
                    />
                    <DatePicker
                        label="Đến ngày"
                        value={toDate}
                        onChange={(newValue) => { setToDate(newValue); setPage(1); }}
                        renderInput={(params) => <TextField {...params} sx={{ width: '150px' }} />}
                    />
                </LocalizationProvider>
                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={status}
                        label="Trạng thái"
                        onChange={handleFilterChange(setStatus)}
                        size="small"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                  <FormControl sx={{ minWidth: 140 }}>
                     <TextField
        label="Tìm kiếm tên sân"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        size="small"
        sx={{ width: '200px' }}
    />
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Loại sân</InputLabel>
                    <Select
                        value={type}
                        label="Loại sân"
                        onChange={handleFilterChange(setType)}
                        size="small"
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        {types.map(t => (
                            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#4caf50', mr: 1 }} />
                    <Typography>Đã xác nhận</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', mr: 1 }} />
                    <Typography>Đang chờ</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#f44336', mr: 1 }} />
                    <Typography>Đã hủy</Typography>
                </Box>
            </Box>

            <Table sx={{ bgcolor: 'white', border: '1px solid #e0e0e0' }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                        <TableCell>Sân</TableCell>
                        <TableCell>Thời gian bắt đầu</TableCell>
                        <TableCell>Thời gian kết thúc</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                                Đang tải...
                            </TableCell>
                        </TableRow>
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                                Không có đặt lịch nào cho ngày này
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map(booking => (
                            <TableRow key={booking._id}>
                                <TableCell>{booking.fieldId?.name || ''}</TableCell>
                                <TableCell>{booking.startTime}</TableCell>
                                <TableCell>{booking.endTime}</TableCell>
                                <TableCell>{booking.totalPrice?.toLocaleString('vi-VN')} VNĐ</TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            bgcolor:
                                                booking.status === 'confirmed' ? '#4caf50' :
                                                    booking.status === 'pending' ? '#ff9800' : '#f44336',
                                            color: 'white',
                                            textAlign: 'center',
                                            borderRadius: '12px',
                                            padding: '4px 8px',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                            booking.status === 'pending' ? 'Đang chờ' : 'Đã hủy'}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {booking.status === 'pending' && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                sx={{ mr: 1 }}
                                                onClick={() => handleConfirmBooking(booking._id)}
                                            >
                                                Xác nhận
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleCancelBooking(booking._id)}
                                            >
                                                Hủy
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default BookingList;
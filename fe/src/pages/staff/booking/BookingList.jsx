import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, MenuItem, Select, FormControl, InputLabel, Pagination, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from 'react-toastify';
import bookingService from '../../../services/api/bookingService';
import { PublicContext } from "../../../contexts/publicContext";
import { walletService } from '../../../services/api/walletService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useAuth } from "../../../contexts/authContext";
dayjs.extend(utc);
const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Đang chờ thanh toán' },
    { value: 'waiting', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'cancelled', label: 'Đã hủy' }
];

const BookingListStaff = () => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const { currentUser } = useAuth();
    const userId = currentUser?._id;
    const handleOpenDetail = (booking) => {
        setSelectedBooking(booking);
        setOpenDetail(true);
    };
    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedBooking(null);
    };

    const handleOpenConfirm = (bookingId) => {
        setSelectedBookingId(bookingId);
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
        setSelectedBookingId(null);
    };
    // const [selectedDate, setSelectedDate] = useState(dayjs());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    // const [fieldId, setFieldId] = useState('');
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
                const res = await bookingService.getBookingsByComplexStaff(userId, params);
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

    const handleCancelBooking = async () => {
        if (!selectedBookingId) return;
        try {
            const booking = bookings.find(b => b._id === selectedBookingId);
            await bookingService.updateBooking(selectedBookingId, { status: 'cancelled' });
            setBookings(bookings.map(b =>
                b._id === selectedBookingId ? { ...b, status: 'cancelled' } : b
            ));
            // Nếu booking đang ở trạng thái waiting thì hoàn tiền
            if (booking && booking.status === 'waiting') {
                console.log('Booking ở trạng thái waiting, tiến hành hoàn tiền');
                // Gọi refund API với logic mới
                const refundData = {
                    userId: booking.userId,
                    amount: booking.totalPrice,
                    objectId: booking._id,
                    type: 'booking',
                    description: 'Hoàn tiền do manager hủy booking ở trạng thái waiting'
                };
                await walletService.refundToWallet(refundData);
                toast.success('Hoàn tiền cho khách thành công');
            } else {
                toast.success('Hủy đặt lịch thành công');
            }
        } catch (error) {
            toast.error('Hủy đặt lịch hoặc hoàn tiền thất bại');
        } finally {
            handleCloseConfirm();
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
                    <Typography>Đang chờ thanh toán</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#1976d2', mr: 1 }} />
                    <Typography>Chờ xác nhận</Typography>
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
                        <TableCell>Chi tiết</TableCell>
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
                                <TableCell>{dayjs(booking.startTime).utc().format('DD/MM/YYYY HH:mm')}</TableCell>
                                <TableCell>{dayjs(booking.endTime).utc().format('DD/MM/YYYY HH:mm')}</TableCell>
                                <TableCell>{booking.totalPrice?.toLocaleString('vi-VN')} VNĐ</TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            bgcolor:
                                                booking.status === 'confirmed' ? '#4caf50' :
                                                    booking.status === 'pending' ? '#ff9800' :
                                                        booking.status === 'waiting' ? '#1976d2' : '#f44336',
                                            color: 'white',
                                            textAlign: 'center',
                                            borderRadius: '12px',
                                            padding: '4px 8px',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                            booking.status === 'pending' ? 'Đang chờ thanh toán' :
                                                booking.status === 'waiting' ? 'Chờ xác nhận' : 'Đã hủy'}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpenDetail(booking)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    {(booking.status === 'pending' || booking.status === 'waiting') && (
                                        <>
                                            {booking.status === 'waiting' && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleConfirmBooking(booking._id)}
                                                >
                                                    Xác nhận
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleOpenConfirm(booking._id)}
                                            >
                                                Hủy
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                                {/* Modal chi tiết booking */}
                                <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="md" fullWidth>
                                    <DialogTitle>Chi tiết đặt lịch</DialogTitle>
                                    <DialogContent>
                                        {selectedBooking && (
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Sân: {selectedBooking.fieldId?.name}</Typography>
                                                <Typography>Thời gian: {dayjs(selectedBooking.startTime).utc().format('HH:mm DD/MM/YYYY')} - {dayjs(selectedBooking.endTime).utc().format('HH:mm DD/MM/YYYY')}</Typography>
                                                <Typography>Trạng thái: {selectedBooking.status}</Typography>
                                                <Typography>Tổng tiền: {selectedBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ</Typography>
                                                <Typography>Tên người đặt: {selectedBooking.customerName}</Typography>
                                                <Typography>Số điện thoại: {selectedBooking.phoneNumber}</Typography>
                                                {selectedBooking.notes && <Typography>Ghi chú: {selectedBooking.notes}</Typography>}
                                                {/* Hiển thị dịch vụ đi kèm */}
                                                {selectedBooking.consumablePurchases && selectedBooking.consumablePurchases.length > 0 && (
                                                    <Box sx={{ my: 2 }}>
                                                        <Divider sx={{ mb: 1 }} />
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Đồ ăn/thức uống đã mua:</Typography>
                                                        {selectedBooking.consumablePurchases.map((cp, idx) => (
                                                            <Box key={cp._id || idx} sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                                                <Typography><b>Tổng tiền:</b> {cp.totalPrice?.toLocaleString('vi-VN')}đ</Typography>
                                                                {cp.consumables && cp.consumables.length > 0 && (
                                                                    <Box sx={{ mt: 1 }}>
                                                                        <Typography><b>Chi tiết:</b></Typography>
                                                                        {cp.consumables.map((item, i) => (
                                                                            <Typography key={item._id || i} sx={{ ml: 2 }}>
                                                                                {item.consumableId?.name ? `${item.consumableId.name} - ` : ''}Số lượng: {item.quantity}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                                {selectedBooking.equipmentRentals && selectedBooking.equipmentRentals.length > 0 && (
                                                    <Box sx={{ my: 2 }}>
                                                        <Divider sx={{ mb: 1 }} />
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Thiết bị thuê:</Typography>
                                                        {selectedBooking.equipmentRentals.map((eq, idx) => (
                                                            <Box key={eq._id || idx} sx={{ mb: 2, p: 2, bgcolor: '#fffde7', borderRadius: 2 }}>
                                                                <Typography><b>Tổng tiền:</b> {eq.totalPrice?.toLocaleString('vi-VN')}đ</Typography>
                                                                {eq.equipments && eq.equipments.length > 0 && (
                                                                    <Box sx={{ mt: 1 }}>
                                                                        <Typography><b>Chi tiết:</b></Typography>
                                                                        {eq.equipments.map((item, i) => (
                                                                            <Typography key={item._id || i} sx={{ ml: 2 }}>
                                                                                {item.equipmentId?.name ? `${item.equipmentId.name} - ` : ''}Số lượng: {item.quantity}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </DialogContent>
                                </Dialog>
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

            {/* Dialog xác nhận hủy booking */}
            <Dialog open={openConfirm} onClose={handleCloseConfirm}>
                <DialogTitle>Xác nhận hủy đặt lịch</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn hủy đặt lịch này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleCancelBooking} color="error" variant="contained">
                        Xác nhận hủy
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingListStaff;
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';

import { formatDate, formatTime } from '../../utils/handleFormat';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function BookingHistoryDialog({ open, setOpen }) {
    const [bookings, setBookings] = useState([]);
    const handleClose = () => {
        setOpen(false);
    };
    setBookings([]);
    const formatStatus = (status) => {
        const statusMap = {
            'PENDING': 'Đang chờ',
            'CONFIRMED': 'Đã xác nhận',
            'TABLE_ASSIGNED': 'Đã xếp bàn',
            'CANCELLED': 'Đã hủy',
            'COMPLETED': 'Hoàn thành'
        };

        return statusMap[status] || 'Không xác định';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'grey';
            case 'CONFIRMED':
                return 'green';
            case 'TABLE_ASSIGNED':
                return 'blue';
            case 'CANCELLED':
                return 'red';
            case 'COMPLETED':
                return 'grey';
            default:
                return 'black';
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth='lg'
                fullWidth={true}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black', p: 2, textTransform: 'uppercase', color: "#006D38" }}>
                    Lịch sử đặt sân
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
                <DialogContent dividers>
                    {bookings.length === 0 ? (
                        <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
                            Bạn chưa có lịch sử đặt sân nào.
                        </Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ngày khởi tạo</TableCell>
                                        <TableCell align="center">Sân</TableCell>
                                        <TableCell align="center">Thời gian đặt sân</TableCell>
                                        <TableCell align="center">Số lượng người lớn</TableCell>
                                        <TableCell align="center">Số lượng trẻ em</TableCell>
                                        <TableCell align="center">Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow
                                            key={booking?._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {formatTime(booking?.createdAt)} ngày {formatDate(booking?.createdAt)}
                                            </TableCell>
                                            <TableCell align="center">{booking?.yard?.name}</TableCell>
                                            <TableCell align="center">{formatTime(booking?.bookingTime)} ngày {formatDate(booking?.bookingTime)}</TableCell>
                                            <TableCell align="center">{booking?.adultsCount}</TableCell>
                                            <TableCell align="center">{booking?.childrenCount}</TableCell>
                                            <TableCell style={{ color: getStatusColor(booking?.status) }} align="center">{formatStatus(booking?.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
            </BootstrapDialog>
        </React.Fragment>
    );
}

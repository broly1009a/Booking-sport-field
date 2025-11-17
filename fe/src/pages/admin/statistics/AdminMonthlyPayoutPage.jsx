import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Collapse,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination
} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import { Download, Visibility, Paid } from "@mui/icons-material";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import * as XLSX from "xlsx";
import statisticService from "../../../services/api/statisticService";
import bookingService from "../../../services/api/bookingService";
const AdminMonthlyPayoutPage = () => {
  const [ownerId, setOwnerId] = useState("");
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [payoutData, setPayoutData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
    // Xem chi tiết booking
    const handleShowBookingDetail = async (bookingId) => {
      setBookingDetail(null);
      setBookingModalOpen(true);
      try {
        const res = await bookingService.getBookingById(bookingId);
        if (res && res.data) setBookingDetail(res.data);
      } catch (e) {
        setBookingDetail({ error: 'Không lấy được thông tin booking.' });
      }
    };
  // Tải Excel
  const handleExportExcel = () => {
    if (!payoutData || payoutData.length === 0) return;
    const wb = XLSX.utils.book_new();
    payoutData.forEach(owner => {
      const sheetData = owner.payoutList.map(item => ({
        'Booking ID': item.bookingId,
        'Phương thức thanh toán': item.paymentMethod,
        'Thời gian thanh toán': item.paymentTime ? new Date(item.paymentTime).toLocaleString('vi-VN') : "",
        'Số tiền': item.amount
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetData), `Owner_${owner.ownerId}`);
    });
    XLSX.writeFile(wb, `DanhSachThanhToan_${month}_${year}.xlsx`);
  };

  // Fake chuyển tiền
  const handleFakeTransfer = (ownerId) => {
    alert(`Đã chuyển tiền cho chủ sân: ${ownerId} (fake)`);
  };

  // Tự động fetch khi đủ tháng/năm
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await statisticService.getOwnerMonthlyPayoutList("", month, year);
        if (res && res.data) {
          const owners = Array.isArray(res.data) ? res.data : [res.data];
          setOwnerOptions(owners);
          setPayoutData(
            ownerId
              ? owners.filter(o => o.ownerId === ownerId)
              : owners
          );
          if (ownerId) {
            const found = owners.find(o => o.ownerId === ownerId);
            setSelectedOwner(found || null);
          } else {
            setSelectedOwner(null);
          }
        } else {
          setOwnerOptions([]);
          setPayoutData([]);
          setSelectedOwner(null);
        }
      } catch (e) {
        setOwnerOptions([]);
        setPayoutData([]);
        setSelectedOwner(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [ownerId, month, year]);
  // Tính dữ liệu phân trang
  const paginatedOwners = payoutData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" mb={4} textAlign="center">Danh sách thanh toán hàng tháng cho chủ sân</Typography>
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="month-label">Tháng</InputLabel>
                <Select
                  labelId="month-label"
                  value={month}
                  label="Tháng"
                  onChange={e => setMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={String(i + 1)}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="year-label">Năm</InputLabel>
                <Select
                  labelId="year-label"
                  value={year}
                  label="Năm"
                  onChange={e => setYear(e.target.value)}
                >
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
                      years.push(y);
                    }
                    return years.map(y => (
                      <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={ownerOptions}
                getOptionLabel={option =>
                  `${option.ownerName || ''} - ${option.ownerEmail || ''} - ${option.ownerPhone || ''}`
                }
                renderInput={params => (
                  <TextField {...params} label="Chọn chủ sân (tìm kiếm)" size="small" fullWidth />
                )}
                value={ownerOptions.find(o => o.ownerId === ownerId) || null}
                onChange={(e, value) => {
                  setOwnerId(value ? value.ownerId : "");
                  setSelectedOwner(value || null);
                }}
                isOptionEqualToValue={(option, value) => option.ownerId === value.ownerId}
                filterOptions={(options, state) => {
                  const input = state.inputValue.toLowerCase();
                  return options.filter(o =>
                    (o.ownerName && o.ownerName.toLowerCase().includes(input)) ||
                    (o.ownerEmail && o.ownerEmail.toLowerCase().includes(input)) ||
                    (o.ownerPhone && o.ownerPhone.toLowerCase().includes(input))
                  );
                }}
                disabled={ownerOptions.length === 0}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="success"
                startIcon={<Download />}
                onClick={handleExportExcel}
                fullWidth
                disabled={!payoutData || payoutData.length === 0}
              >
                Tải Excel
              </Button>
            </Grid>
          </Grid>
        </Paper>
        {selectedOwner && (
          <Box mb={2}>
            <Paper sx={{ p: 2, background: '#f7f7f7' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Thông tin chủ sân:
              </Typography>
              <Typography variant="body2">Tên: <b>{selectedOwner.ownerName}</b></Typography>
              <Typography variant="body2">Email: <b>{selectedOwner.ownerEmail}</b></Typography>
              <Typography variant="body2">SĐT: <b>{selectedOwner.ownerPhone}</b></Typography>
            </Paper>
          </Box>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {(!payoutData || payoutData.length === 0) ? (
              <Box textAlign="center" mt={4}>
                <Typography variant="body1" color="text.secondary">Không có dữ liệu thanh toán cho tháng/năm đã chọn.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chủ sân</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>SĐT</TableCell>
                      <TableCell>Tổng tiền cần thanh toán</TableCell>
                      <TableCell>Tháng/Năm</TableCell>
                      <TableCell align="center">Chi tiết</TableCell>
                      <TableCell align="center">Chuyển tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOwners.map(owner => (
                      <React.Fragment key={owner.ownerId}>
                        <TableRow>
                          <TableCell><Chip label={owner.ownerName || owner.ownerId} color="primary" size="small" sx={{ fontWeight: 700 }} /></TableCell>
                          <TableCell>{owner.ownerEmail}</TableCell>
                          <TableCell>{owner.ownerPhone}</TableCell>
                          <TableCell><b>{owner.totalPayout?.toLocaleString('vi-VN')}đ</b></TableCell>
                          <TableCell>{owner.month}/{owner.year}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={expanded[owner.ownerId] ? "Ẩn chi tiết" : "Xem chi tiết"}>
                              <IconButton color="primary" onClick={() => setExpanded(prev => ({ ...prev, [owner.ownerId]: !prev[owner.ownerId] }))}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Chuyển tiền (fake)">
                              <IconButton color="success" onClick={() => handleFakeTransfer(owner.ownerId)}>
                                <Paid />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                            <Collapse in={expanded[owner.ownerId] || false} timeout="auto" unmountOnExit>
                              <Box mt={2} mb={2}>
                                {owner.payoutList.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary" textAlign="center">Không có booking nào cần thanh toán.</Typography>
                                ) : (
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Booking Code</TableCell>
                                        <TableCell>Phương thức thanh toán</TableCell>
                                        <TableCell>Thời gian thanh toán</TableCell>
                                        <TableCell>Số tiền</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {owner.payoutList.map((item, idx2) => (
                                        <TableRow key={idx2}>
                                          <TableCell>
                                            {item.bookingId}
                                            <IconButton size="small" sx={{ ml: 1 }} onClick={() => handleShowBookingDetail(item.bookingId)}>
                                              <RemoveRedEyeIcon fontSize="small" />
                                            </IconButton>
                                          </TableCell>
                                          <TableCell>{item.paymentMethod}</TableCell>
                                          <TableCell>{item.paymentTime ? new Date(item.paymentTime).toLocaleString('vi-VN') : ""}</TableCell>
                                          <TableCell>{item.amount?.toLocaleString('vi-VN')}đ</TableCell>
                                        </TableRow>
                                      ))}
                                          {/* Modal chi tiết booking */}
                                          <Dialog open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} maxWidth="sm" fullWidth>
                                            <DialogTitle>Chi tiết Booking</DialogTitle>
                                            <DialogContent>
                                              {bookingDetail === null ? (
                                                <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                                                  <CircularProgress />
                                                </Box>
                                              ) : bookingDetail?.error ? (
                                                <Typography color="error">{bookingDetail.error}</Typography>
                                              ) : (
                                                <Box>
                                                  <Typography variant="h6" mb={1}>Thông tin khách hàng</Typography>
                                                  <Typography variant="body2"><b>Họ tên:</b> {bookingDetail.customerName || bookingDetail.userId?.fname + ' ' + bookingDetail.userId?.lname}</Typography>
                                                  <Typography variant="body2"><b>Email:</b> {bookingDetail.userId?.email}</Typography>
                                                  <Typography variant="body2"><b>SĐT:</b> {bookingDetail.phoneNumber || bookingDetail.userId?.phoneNumber}</Typography>
                                                  <Typography variant="body2"><b>Trạng thái:</b> {bookingDetail.status}</Typography>
                                                  <Box mt={2} mb={2}>
                                                    <Typography variant="h6" mb={1}>Thông tin sân</Typography>
                                                    <Typography variant="body2"><b>Tên sân:</b> {bookingDetail.fieldId?.name}</Typography>
                                                    <Typography variant="body2"><b>Địa chỉ:</b> {bookingDetail.fieldId?.location}</Typography>
                                                    <Typography variant="body2"><b>Sức chứa:</b> {bookingDetail.fieldId?.capacity}</Typography>
                                                    <Typography variant="body2"><b>Tiện ích:</b> {bookingDetail.fieldId?.amenities?.join(', ')}</Typography>
                                                    {bookingDetail.fieldId?.images?.length > 0 && (
                                                      <Box mt={1}>
                                                        <img src={bookingDetail.fieldId.images[0]} alt="Ảnh sân" style={{ maxWidth: 200, borderRadius: 8 }} />
                                                      </Box>
                                                    )}
                                                  </Box>
                                                  <Typography variant="body2"><b>Mã booking:</b> {bookingDetail._id}</Typography>
                                                  <Typography variant="body2"><b>Thời gian đặt:</b> {bookingDetail.createdAt ? new Date(bookingDetail.createdAt).toLocaleString('vi-VN') : ''}</Typography>
                                                  <Typography variant="body2"><b>Thời gian sử dụng:</b> {bookingDetail.startTime ? new Date(bookingDetail.startTime).toLocaleString('vi-VN') : ''} - {bookingDetail.endTime ? new Date(bookingDetail.endTime).toLocaleString('vi-VN') : ''}</Typography>
                                                  <Typography variant="body2"><b>Tổng tiền:</b> {(bookingDetail.totalPrice || bookingDetail.amount)?.toLocaleString('vi-VN')}đ</Typography>
                                                  {bookingDetail.notes && (
                                                    <Typography variant="body2" mt={1}><b>Ghi chú:</b> {bookingDetail.notes}</Typography>
                                                  )}
                                                </Box>
                                              )}
                                            </DialogContent>
                                            <DialogActions>
                                              <Button onClick={() => setBookingModalOpen(false)}>Đóng</Button>
                                            </DialogActions>
                                          </Dialog>
                                    </TableBody>
                                  </Table>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                  <Pagination
                    count={Math.ceil(payoutData.length / rowsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminMonthlyPayoutPage;

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, useMediaQuery, Paper, Slider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import maintenanceService from '../../../services/api/maintenanceService';


import { useParams } from "react-router-dom";
import scheduleService from '../../../services/api/scheduleService';
import MaintenanceDialog from '../../../components/dialogs/MaintenanceDialog';
const MaintenanceSchedule = () => {
    const { typeId } = useParams(); 
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sportFields, setSportFields] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [slotWidth, setSlotWidth] = useState(50);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy lịch theo typeId và ngày
        if (!typeId) return;
        const res = await scheduleService.getSchedulesByType(typeId, selectedDate.format('YYYY-MM-DD'));
        if (res && res.data) {
          setSportFields(res.data.sportFields || []);
          setTimeSlots(res.data.timeSlots || []);
          setSchedule(res.data.schedules || []);
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu lịch');
      }
    };
    fetchData();
  }, [typeId, selectedDate]);

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  const isPastSlot = (slotTime) => {
    const slotDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${slotTime}:00`);
    return slotDateTime.isBefore(dayjs());
  };

  const getSlotStatus = (fieldId, slotTime) => {
    if (isPastSlot(slotTime)) return 'past';
    const fieldSchedule = schedule.find(s => s.fieldId === fieldId);
    if (!fieldSchedule) return 'available';

    const slotDateTime = new Date(`${selectedDate.format('YYYY-MM-DD')}T${slotTime}:00`);
    for (const slot of fieldSchedule.timeSlots) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      if (slotDateTime >= start && slotDateTime < end) {
        if (slot.status === 'maintenance') return 'maintenance';
        if (slot.status === 'booked') return 'booked';
      }
    }
    return 'available';
  };

  const handleSlotClick = (fieldId, slotTime) => {
    const status = getSlotStatus(fieldId, slotTime);
    if (status !== 'available') {
      toast.warn(
        status === 'past'
          ? 'Không thể chọn khung giờ đã qua'
          : 'Khung giờ này không khả dụng'
      );
      return;
    }

    const slotDateTime = `${selectedDate.format('YYYY-MM-DD')}T${slotTime}:00`;

    const exists = selectedSlots.find(slot => slot.fieldId === fieldId && slot.time === slotDateTime);
    if (exists) {
      setSelectedSlots(selectedSlots.filter(slot => !(slot.fieldId === fieldId && slot.time === slotDateTime)));
      return;
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([{ fieldId, time: slotDateTime }]);
      return;
    }

    if (selectedSlots.some(slot => slot.fieldId !== fieldId)) {
      toast.warn('Chỉ được chọn các khung giờ liên tục trên cùng một sân');
      return;
    }

    const allSlots = [...selectedSlots, { fieldId, time: slotDateTime }]
      .map(slot => slot.time)
      .sort();

    let isContinuous = true;
    for (let i = 1; i < allSlots.length; i++) {
      const prev = dayjs(allSlots[i - 1]);
      const curr = dayjs(allSlots[i]);
      if (curr.diff(prev, 'minute') !== 30) {
        isContinuous = false;
        break;
      }
    }

    if (!isContinuous) {
      toast.warn('Chỉ được chọn các khung giờ liên tục!');
      return;
    }

    setSelectedSlots([...selectedSlots, { fieldId, time: slotDateTime }]);
  };

  const handleMaintenanceSuccess = () => {
    setSelectedSlots([]);
    setOpenDialog(false);
    toast.success('Đặt lịch bảo trì thành công!');
    // reload lại lịch
    const fetchData = async () => {
      const res = await scheduleService.getSchedulesByType('', selectedDate.format('YYYY-MM-DD'));
      if (res && res.data) {
        setSportFields(res.data.sportFields || []);
        setTimeSlots(res.data.timeSlots || []);
        setSchedule(res.data.schedules || []);
      }
    };
    fetchData();
  };

  const tableContainerSx = isMobile
    ? { overflowX: 'auto', bgcolor: 'white', border: '1px solid #e0e0e0', width: '100vw', maxWidth: '100vw' }
    : { bgcolor: 'white', border: '1px solid #e0e0e0' };

  return (
    <Box
      sx={{
        p: isMobile ? 1 : 4,
        bgcolor: '#f5f5f5',
        minHeight: '100vh',
        width: '100vw',
        boxSizing: 'border-box'
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          mb: 2,
          color: '#388e3c',
          textAlign: isMobile ? 'center' : 'left',
          fontWeight: 'bold'
        }}
      >
        Đặt lịch bảo trì sân
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Chọn ngày"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          slotProps={{
            textField: {
              sx: { mb: 2, width: isMobile ? '100%' : '200px' }
            }
          }}
        />
      </LocalizationProvider>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography fontSize={isMobile ? 12 : 14}>Độ rộng slot:</Typography>
        <Slider
          value={slotWidth}
          min={36}
          max={160}
          step={4}
          onChange={(_, value) => setSlotWidth(value)}
          valueLabelDisplay="auto"
          sx={{ width: isMobile ? 120 : 200 }}
        />
        <Typography fontSize={isMobile ? 12 : 14}>{slotWidth}px</Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'white', border: '1px solid #ccc', mr: 1 }} />
          <Typography fontSize={isMobile ? 12 : 14}>Trống</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#9e9e9e', mr: 1 }} />
          <Typography fontSize={isMobile ? 12 : 14}>Bảo trì</Typography>
        </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#f44336', mr: 1 }} />
                  <Typography fontSize={isMobile ? 12 : 14}>Đã đặt</Typography>
                </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            width: 20,
            height: 20,
            bgcolor: '#e0e0e0',
            mr: 1,
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CloseIcon fontSize="small" sx={{ color: '#bdbdbd' }} />
          </Box>
          <Typography fontSize={isMobile ? 12 : 14}>Đã qua</Typography>
        </Box>
      </Box>

      <Box sx={tableContainerSx} component={Paper} elevation={isMobile ? 0 : 1}>
        <Table
          size={isMobile ? "small" : "medium"}
          sx={{
            minWidth: isMobile ? 600 : 800,
            tableLayout: 'fixed'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  minWidth: isMobile ? 80 : 120,
                  maxWidth: isMobile ? 120 : 200,
                  width: isMobile ? 100 : 150,
                  fontWeight: 'bold',
                  fontSize: isMobile ? 12 : 16,
                  whiteSpace: 'nowrap'
                }}
              >
                Sân
              </TableCell>
              {timeSlots.map((time, index) => (
                <TableCell
                  key={index}
                  sx={{
                    textAlign: 'center',
                    bgcolor: '#e3f2fd',
                    minWidth: slotWidth,
                    maxWidth: slotWidth,
                    width: slotWidth,
                    fontSize: isMobile ? 11 : 14,
                    p: isMobile ? 0.5 : 1
                  }}
                >
                  {time}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sportFields.map(field => (
              <TableRow key={field._id}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? 12 : 14,
                    minWidth: isMobile ? 80 : 120,
                    maxWidth: isMobile ? 120 : 200,
                    width: isMobile ? 100 : 150,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {field.name}
                </TableCell>
                {timeSlots.map((time, index) => {
                  const status = getSlotStatus(field._id, time);
                  const isSelected = selectedSlots.some(
                    slot => slot.fieldId === field._id && slot.time === `${selectedDate.format('YYYY-MM-DD')}T${time}:00`
                  );
                  let cellBg;
                  if (status === 'maintenance') cellBg = '#9e9e9e';
                  else if (status === 'booked') cellBg =  '#f44336'
                  else if (status === 'past') cellBg = '#e0e0e0';
                  else if (isSelected) cellBg = '#4caf50';
                  else cellBg = 'white';

                  return (
                    <TableCell
                      key={index}
                      sx={{
                        bgcolor: cellBg,
                        textAlign: 'center',
                        cursor: status === 'available' ? 'pointer' : 'default',
                        border: '1px solid #e0e0e0',
                        p: isMobile ? 0.5 : 1,
                        minWidth: slotWidth,
                        maxWidth: slotWidth,
                        width: slotWidth
                      }}
                      onClick={() => handleSlotClick(field._id, time)}
                    >
                      {status === 'maintenance' && <LockIcon sx={{ color: 'white', fontSize: isMobile ? 16 : 20 }} />}
                        {status === 'booked' && <StarIcon sx={{ color: 'yellow', fontSize: isMobile ? 16 : 20 }} />}
                      {status === 'past' && <CloseIcon sx={{ color: '#bdbdbd', fontSize: isMobile ? 16 : 20 }} />}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Button
        variant="contained"
        sx={{
          mt: 2,
          bgcolor: '#388e3c',
          '&:hover': { bgcolor: '#2e7d32' },
          width: isMobile ? '100%' : 'auto',
          fontWeight: 'bold',
          fontSize: isMobile ? 14 : 16
        }}
        onClick={() => setOpenDialog(true)}
        disabled={selectedSlots.length === 0}
      >
        Đặt lịch bảo trì
      </Button>
      <MaintenanceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        selectedSlots={selectedSlots}
        sportField={
          selectedSlots.length > 0
            ? sportFields.find(f => f._id === selectedSlots[0].fieldId)
            : null
        }
        onConfirm={handleMaintenanceSuccess}
      />
    </Box>
  );
};

export default MaintenanceSchedule;
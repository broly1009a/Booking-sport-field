import React, { useEffect, useState } from "react";
import { eventService } from "../../../services/api/eventService";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventFormModel from "./EventFormModel";
import { toast } from "react-toastify";

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = async () => {
    const res = await eventService.getEvents();
    if (res && res.data) setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, data);
        toast.success("Cập nhật sự kiện thành công");
      } else {
        await eventService.createEvent(data);
        toast.success("Tạo sự kiện thành công");
      }
      setModalOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await eventService.deleteEvent(id);
        toast.success("Xóa sự kiện thành công");
        fetchEvents();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#388e3c">
        Quản lý sự kiện
      </Typography>
      <Button
        variant="contained"
        color="success"
        sx={{ mb: 2, borderRadius: 2 }}
        onClick={handleOpenCreate}
      >
        + Thêm sự kiện
      </Button>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e0f2e9" }}>
            <TableRow>
              <TableCell>Tên sự kiện</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Công cụ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">Chưa có sự kiện nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    {new Date(event.startTime).toLocaleString()} -<br />
                    {new Date(event.endTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{event.status}</TableCell>
                  <TableCell>
                    <img src={event.image} alt={event.name} style={{ width: 80, borderRadius: 8 }} />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenEdit(event)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(event._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <EventFormModel
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingEvent}
      />
    </Box>
  );
};

export default EventDashboard;
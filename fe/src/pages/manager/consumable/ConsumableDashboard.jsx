import React, { useEffect, useState, useContext } from "react";
import consumableService from "../../../services/api/consumableService";
import { PublicContext } from "../../../contexts/publicContext";
import ConsumableFormModal from "./ConsumableFormModal";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ConsumableDashboard = () => {
  const { sportFields } = useContext(PublicContext);
  const [consumables, setConsumables] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    try {
      const consumableData = await consumableService.getAllConsumables();
      setConsumables(consumableData.data);
    } catch (error) {
      toast.error("Không thể tải danh sách vật tư");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (data) => {
    if (editingItem) {
      try {
        await consumableService.updateConsumable(editingItem._id, data);
        toast.success("Cập nhật vật tư thành công");
      } catch (error) {
        toast.error("Cập nhật thất bại");
      }
    } else {
      try {
        await consumableService.createConsumable(data);
        toast.success("Thêm vật tư thành công");
      } catch (error) {
        toast.error("Thêm thất bại");
      }
    }
    setModalOpen(false);
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vật tư này?")) {
      try {
        await consumableService.deleteConsumable(id);
        toast.success("Xóa vật tư thành công");
        fetchData();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#388e3c">
        Quản lý vật tư tiêu hao
      </Typography>
      <Button
        variant="contained"
        color="success"
        sx={{ mb: 2, borderRadius: 2 }}
        onClick={handleOpenCreate}
      >
        + Thêm vật tư
      </Button>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#e0f2e9" }}>
            <TableRow>
              <TableCell>Tên vật tư</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Sân áp dụng</TableCell>
              <TableCell align="center">Công cụ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consumables?.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip label={item.type} color="primary" size="small" />
                </TableCell>
                <TableCell>{item.pricePerUnit?.toLocaleString()}đ</TableCell>
                <TableCell>{item.quantityInStock}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status === "available" ? "Còn hàng" : "Hết hàng"}
                    color={item.status === "available" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {item.sportField?.map((field) => (
                      <Chip key={field._id} label={field.name} size="small" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {consumables?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">Chưa có vật tư nào</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ConsumableFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
        sportFields={sportFields}
      />
    </Box>
  );
};

export default ConsumableDashboard;
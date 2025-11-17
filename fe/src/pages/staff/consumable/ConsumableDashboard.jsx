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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ConsumableDashboard = () => {
  const { sportFields } = useContext(PublicContext);
  const [consumables, setConsumables] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // Modal xem danh sách sân
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldModalList, setFieldModalList] = useState([]);

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
      <TextField
        label="Tìm kiếm vật tư theo tên"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />
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
            {(() => {
              const filtered = consumables.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
              const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
              return (
                <>
                  {paginated.map((item) => (
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
                        {item.sportField?.length <= 3 ? (
                          <Stack direction="row" spacing={1}>
                            {item.sportField?.map((field) => (
                              <Chip key={field._id} label={field.name} size="small" />
                            ))}
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1}>
                            {item.sportField.slice(0, 3).map((field) => (
                              <Chip key={field._id} label={field.name} size="small" />
                            ))}
                            <Chip
                              label={`...${item.sportField.length} sân`}
                              color="info"
                              size="small"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                setFieldModalList(item.sportField);
                                setFieldModalOpen(true);
                              }}
                            />
                          </Stack>
                        )}
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
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">Chưa có vật tư nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })()}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <Pagination
          count={Math.ceil(consumables.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
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

      {/* Modal danh sách sân áp dụng */}
      <Dialog open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Danh sách sân áp dụng</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {fieldModalList.map(f => (
              <Chip key={f._id} label={f.name} size="medium" />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldModalOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsumableDashboard;
import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { policyService } from "../../../services/api/policyService";
import { categoryPolicyService } from "../../../services/api/categoryPolicyService";

const PolicyList = () => {
    const [policies, setPolicies] = useState([]);
    const [categoryPolicies, setCategoryPolicies] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        categoryPolicyId: '',
        content: ''
    });

    const fetchData = async () => {
        const [pRes, cRes] = await Promise.all([
            policyService.getPolicies(),
            categoryPolicyService.getCategories()
        ]);

        // Xử lý policies
        if (pRes?.success) {
            setPolicies(pRes.data);
        } else if (Array.isArray(pRes)) {
            setPolicies(pRes);
        } else {
            setPolicies([]);
        }

        // Xử lý categoryPolicies
        if (cRes?.success) {
            setCategoryPolicies(cRes.data);
        } else if (Array.isArray(cRes)) {
            setCategoryPolicies(cRes);
        } else {
            setCategoryPolicies([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (item = null) => {
        setEditing(item);
        setForm(item ? {
            categoryPolicyId: item.categoryPolicyId?._id || item.categoryPolicyId,
            content: item.content || ''
            
        } : {
            categoryPolicyId: '',
            content: ''
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (editing) {
            await policyService.updatePolicy(editing._id, form);
        } else {
            await policyService.createPolicy(form);
        }
        setOpen(false);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn xác nhận xoá chính sách này?')) {
            await policyService.deletePolicy(id);
            fetchData();
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4">Danh sách chính sách</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm chính sách
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Nội dung</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {policies.map((p) => (
                        <TableRow key={p._id}>
                            <TableCell>{p.categoryPolicyId?.title}</TableCell>
                            <TableCell>{p.content}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpen(p)}>Sửa</Button>
                                <Button onClick={() => handleDelete(p._id)} color="error">Xoá</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{editing ? 'Sửa' : 'Thêm'} chính sách</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                            value={form.categoryPolicyId}
                            label="Danh mục"
                            onChange={(e) => setForm({ ...form, categoryPolicyId: e.target.value })}
                        >
                            {categoryPolicies.map((cat) => (
                                <MenuItem key={cat._id} value={cat._id}>
                                    {cat.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Nội dung"
                        fullWidth
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave}>Lưu</Button>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PolicyList;
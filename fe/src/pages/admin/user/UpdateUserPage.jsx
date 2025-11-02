import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../../../services/userService';
import UpdateUser from './UpdateUser';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import { toast } from 'react-toastify';

export default function UpdateUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      UserService.getUserById(id)
        .then((data) => {
          setUser(data.data);
        })
        .catch(() => {
          toast.error('Không tìm thấy người dùng!');
        //   navigate(-1);
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);
// console.log('Rendered UpdateUserPage with user:', user, 'and loading:', loading);
  return (
    <Box className="container mx-auto min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <Paper elevation={3} sx={{ p: 4, mt: 2, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Cập nhật thông tin người dùng
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <UpdateUser user={user} onClose={() => navigate(-1)} />
        ) : null}
        <Box display="flex" justifyContent="center" mt={3}>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </Box>
      </Paper>
    </Box>
  );
}

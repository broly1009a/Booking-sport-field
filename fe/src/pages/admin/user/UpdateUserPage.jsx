import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../../../services/userService';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import UpdateUser from './UpdateUser';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import { toast } from 'react-toastify';

export default function UpdateUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complexes, setComplexes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComplex, setLoadingComplex] = useState(false);

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

  useEffect(() => {
    const fetchComplexes = async () => {
      if (!user?._id) return;
      setLoadingComplex(true);
      try {
        const data = await fieldComplexService.getAll();
        const ownedComplexes = data.filter(fc => fc.owner._id === user._id);
        setComplexes(ownedComplexes);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách cụm sân:', error);
        toast.error('Không thể tải danh sách cụm sân!');
      } finally {
        setLoadingComplex(false);
      }
    };
    fetchComplexes();
  }, [user]);
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
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Các cụm sân do chủ sân này quản lý
          </Typography>

          {loadingComplex ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : complexes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complexes.map((complex) => (
                <div
                  key={complex._id}
                  className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg">{complex.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <i className="fas fa-map-marker-alt mr-1"></i> {complex.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái:{" "}
                    <span
                      className={`font-medium ${
                        complex.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {complex.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Chủ sân này đang không quản lý cụm sân nào!
            </Typography>
          )}
        </Box>
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

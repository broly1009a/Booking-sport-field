import React, { useState, useEffect } from "react";
import { Box, Container, Card, CardContent, Grid, Typography, Paper, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
import { FaBookmark, FaMoneyBillWave, FaLayerGroup } from "react-icons/fa";
import statisticService from "../../../services/api/statisticService";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../../contexts/authContext";
const STATUS_LABELS = {
  confirmed: "Đã xác nhận",
  pending: "Đang chờ",
  cancelled: "Đã hủy"
};
const STATUS_COLORS = {
  confirmed: "#4caf50",
  pending: "#ff9800",
  cancelled: "#f44336"
};

const StyledCard = styled(Card)(({ theme, color }) => ({
  backgroundColor: color,
  transition: "transform 0.3s",
  "&:hover": {
    transform: "translateY(-5px)"
  }
}));

const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <StyledCard color={color}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" color="white">{title}</Typography>
          <Typography variant="h4" color="white">{value}</Typography>
        </Box>
        <Icon size={40} color="white" />
      </Box>
    </CardContent>
  </StyledCard>
);

const OwnerStatsPage = () => {
  const { currentUser } = useAuth();
  const ownerId = currentUser?._id;
  console.log('Owner ID:', ownerId);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const res = await statisticService.getOwnerStats(ownerId, fromDate, toDate);
      console.log('Owner Stats Response:', res);
      if (res && res.data) setStats(res.data);
      setLoading(false);
    };
    if (ownerId) fetchStats();
  }, [ownerId, fromDate, toDate]);

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" mb={4}>Thống kê chủ sân</Typography>
        <Box display="flex" gap={2} mb={4}>
          <TextField
            type="date"
            label="Từ ngày"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Đến ngày"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Tổng số sân"
              value={stats?.totalFields ?? 0}
              icon={FaLayerGroup}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Tổng lượt đặt sân"
              value={stats?.totalBookings ?? 0}
              icon={FaBookmark}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Tổng doanh thu"
              value={stats?.totalRevenue?.toLocaleString('vi-VN') + "đ" || "0đ"}
              icon={FaMoneyBillWave}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Số dư ví"
              value={stats?.walletBalance?.toLocaleString('vi-VN') + "đ" || "0đ"}
              icon={FaMoneyBillWave}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>
        <Box mt={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Trạng thái đặt sân</Typography>
            <Box display="flex" gap={3}>
              {stats?.bookingStatusCounts && Object.entries(stats.bookingStatusCounts).map(([status, count], idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, bgcolor: STATUS_COLORS[status] || '#bdbdbd', borderRadius: '50%' }} />
                  <Typography variant="body2">{STATUS_LABELS[status] || status}: {count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
        <Box mt={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Trạng thái sự kiện</Typography>
            <Box display="flex" gap={3}>
              {stats?.eventStatusCounts && Object.entries(stats.eventStatusCounts).map(([status, count], idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, bgcolor: STATUS_COLORS[status] || '#bdbdbd', borderRadius: '50%' }} />
                  <Typography variant="body2">{STATUS_LABELS[status] || status}: {count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default OwnerStatsPage;

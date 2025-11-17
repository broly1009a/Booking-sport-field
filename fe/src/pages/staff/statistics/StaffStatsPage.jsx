import React, { useState, useEffect } from "react";
import { Box, Container, Card, CardContent, Grid, Typography, Switch, FormControlLabel, Paper, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
import { FaUsers, FaBookmark, FaMoneyBillWave, FaLayerGroup } from "react-icons/fa";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import statisticService from "../../../services/api/statisticService";
import { useTheme } from "@mui/material/styles";
import * as XLSX from "xlsx";
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

const StaffStatsPage = () => {
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
      const res = await statisticService.getStaffStats(ownerId, fromDate, toDate);
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
               value={(typeof stats?.walletBalance === 'number' ? stats.walletBalance.toLocaleString('vi-VN') + "đ" : "0đ")}
              icon={FaMoneyBillWave}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>
        <Box mt={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Trạng thái đặt sân</Typography>
            {stats?.bookingStatusCounts && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.bookingStatusCounts).map(([status, count]) => ({ status: STATUS_LABELS[status] || status, count }))}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.keys(stats.bookingStatusCounts).map((status, idx) => (
                      <Cell key={status} fill={STATUS_COLORS[status] || '#bdbdbd'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>
        <Box mt={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Trạng thái sự kiện</Typography>
            {stats?.eventStatusCounts && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(stats.eventStatusCounts).map(([status, count]) => ({ status: STATUS_LABELS[status] || status, count }))}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {Object.keys(stats.eventStatusCounts).map((status, idx) => (
                      <Cell key={status} fill={STATUS_COLORS[status] || '#bdbdbd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default StaffStatsPage;

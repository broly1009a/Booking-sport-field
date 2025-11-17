import React, { useState, useEffect } from "react";
import { Box, Container, Card, CardContent, Grid, Typography, Switch, FormControlLabel, Paper, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
import { FaUsers, FaBookmark, FaMoneyBillWave, FaLayerGroup } from "react-icons/fa";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import statisticService from "../../../services/api/statisticService";
import { useTheme } from "@mui/material/styles";
import * as XLSX from "xlsx";
// Mapping trạng thái sang tiếng Việt và màu sắc
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

const AnalyticsDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const res = await statisticService.getDashboardStats(fromDate, toDate);
      if (res && res.data) setStats(res.data);
      setLoading(false);
    };
    fetchStats();
  }, [fromDate, toDate]);

  // Xử lý dữ liệu cho biểu đồ
  const pieData = stats?.bookingStatusCounts?.map(item => ({
    name: STATUS_LABELS[item._id] || item._id,
    value: item.count,
    color: STATUS_COLORS[item._id] || "#bdbdbd"
  })) || [];

  const lineData = stats?.chart?.bookingsByDay?.map(item => ({
    date: item._id,
    bookings: item.count
  })) || [];

  const revenueData = stats?.chart?.revenueByDay?.map(item => ({
    date: item._id,
    amount: item.total
  })) || [];
// Hàm xuất Excel
  const handleExportExcel = () => {
    if (!stats) return;

    // Sheet 1: Tổng quan
    const overview = [
      ["Tổng người dùng", stats.totalUsers],
      ["Tổng lượt đặt sân", stats.totalBookings],
      ["Tổng doanh thu", stats.totalRevenue],
      ["Tổng số sân", stats.totalFields],
    ];

    // Sheet 2: Trạng thái đặt sân
    const status = stats.bookingStatusCounts?.map(item => ({
      "Trạng thái": STATUS_LABELS[item._id] || item._id,
      "Số lượng": item.count
    })) || [];

    // Sheet 3: Đặt sân theo ngày
    const bookingsByDay = stats.chart?.bookingsByDay?.map(item => ({
      "Ngày": item._id,
      "Số lượt đặt": item.count
    })) || [];

    // Sheet 4: Doanh thu theo ngày
    const revenueByDay = stats.chart?.revenueByDay?.map(item => ({
      "Ngày": item._id,
      "Doanh thu": item.total
    })) || [];

    // Sheet 5: Thống kê ví
    const walletStats = stats.walletStats?.map(item => ({
      "Loại giao dịch": item._id,
      "Số lần": item.count,
      "Tổng tiền": item.total
    })) || [];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), "Tổng quan");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(status), "Trạng thái đặt sân");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bookingsByDay), "Đặt sân theo ngày");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueByDay), "Doanh thu theo ngày");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(walletStats), "Thống kê ví");

    XLSX.writeFile(wb, "ThongKeDashboard.xlsx");
  };
  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Typography variant="h4">Thống kê tổng quan</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" color="success" onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
              label="Chế độ tối"
            />
          </Box>
        </Box>

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
              title="Tổng người dùng"
              value={stats?.totalUsers ?? 0}
              icon={FaUsers}
              color={theme.palette.primary.main}
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
              title="Tổng số sân"
              value={stats?.totalFields ?? 0}
              icon={FaLayerGroup}
              color={theme.palette.warning.main}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: "400px" }}>
              <Typography variant="h6" mb={2}>Phân bố trạng thái đặt sân</Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Chú thích trạng thái */}
              <Box display="flex" justifyContent="center" mt={2} gap={3}>
                {pieData.map((entry, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: entry.color, borderRadius: '50%' }} />
                    <Typography variant="body2">{entry.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: "400px" }}>
              <Typography variant="h6" mb={2}>Xu hướng đặt sân</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM dd")} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke={theme.palette.primary.main} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: "300px" }}>
              <Typography variant="h6" mb={2}>Doanh thu theo ngày</Typography>
              <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM dd")} />
  <YAxis label={{ value: "Doanh thu (đ)", angle: -90, position: "insideLeft" }} />
  <Tooltip
    formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
    labelFormatter={(label) => `Ngày: ${label}`}
  />
  <Bar dataKey="amount" fill={theme.palette.success.main} name="Doanh thu" />
</BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>Thống kê ví</Typography>
              <Typography variant="body1">
                Tổng số lần nạp: {stats?.walletStats?.find(w => w._id === 'topup' || w._id === 'deposit')?.count ?? 0} giao dịch
              </Typography>
              <Typography variant="body1">
                Tổng số tiền: {(stats?.walletStats?.find(w => w._id === 'topup' || w._id === 'deposit')?.total ?? 0).toLocaleString('vi-VN')}đ
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AnalyticsDashboard;
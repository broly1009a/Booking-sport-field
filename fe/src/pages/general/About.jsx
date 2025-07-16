import React from "react";
import { Box, Typography, Container, Divider, Grid, Paper } from "@mui/material";

const About = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
        Giới thiệu hệ thống đặt sân thể thao
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1" sx={{ mb: 2 }}>
        Hệ thống đặt sân thể thao trực tuyến giúp bạn dễ dàng tìm kiếm, đặt lịch và quản lý các sân bóng đá, cầu lông, tennis và nhiều loại sân khác. Chúng tôi mang đến trải nghiệm đặt sân nhanh chóng, minh bạch và tiện lợi cho mọi đối tượng khách hàng.
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
        Tính năng nổi bật:
      </Typography>
      <ul style={{ marginLeft: 24, marginBottom: 16 }}>
        <li>Đặt sân trực tuyến mọi lúc, mọi nơi</li>
        <li>Thanh toán linh hoạt: ví điện tử, VNPAY, tiền mặt</li>
        <li>Quản lý lịch sử đặt sân, đánh giá và phản hồi</li>
        <li>Hỗ trợ ghép trận, tìm đối thủ dễ dàng</li>
        <li>Quản lý bảo trì, thiết bị, sự kiện cho chủ sân</li>
      </ul>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
        Đội ngũ phát triển
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Chúng tôi là những lập trình viên trẻ, đam mê công nghệ và thể thao, luôn nỗ lực mang lại giải pháp tối ưu cho cộng đồng yêu thể thao.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" fontWeight="bold">Liên hệ hỗ trợ:</Typography>
          <Typography>Email: support@sandatsport.vn</Typography>
          <Typography>Hotline: 0374.857.068</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" fontWeight="bold">Địa chỉ:</Typography>
          <Typography>Trường Đại học CNTT, ĐHQG TP.HCM</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        &copy; {new Date().getFullYear()} Hệ thống đặt sân thể thao. All rights reserved.
      </Typography>
    </Paper>
  </Container>
);

export default About;
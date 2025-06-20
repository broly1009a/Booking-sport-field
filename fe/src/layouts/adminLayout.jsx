import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import AdminHeader from "../components/headers/adminHeader";
import People from "@mui/icons-material/People";
import TableBarIcon from "@mui/icons-material/TableBar";
 
const drawerWidth = 240;

const menuItems = [
  {
    text: "Quản lí Tài Khoản",
    icon: <People />,
    path: "/admin/user-list",
  },
  {
    text: "Quản lí Loại Sân",
    icon: <TableBarIcon />,
    path: "/admin/type-list",
  },
  {
    text: "Quản lí Sân",
    icon: <TableBarIcon />,
    path: "/admin/sport-field-list",
  },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f6f7fb" }}>
      <CssBaseline />
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#1a1a1a",
            color: "#fff",
            boxShadow: 3,
          },
        }}
      >       
        <Box sx={{ textAlign: "center", py: 2 }}>
          <TableBarIcon sx={{ fontSize: 40, color: "#fff" }} />
          <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: ".2rem" }}>
            ADMIN PANEL
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 1 }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  mx: 2,
                  my: 1,
                  borderRadius: 2,
                  bgcolor: location.pathname === item.path ? "rgba(255,255,255,0.15)" : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, background: "#f6f7fb", minHeight: "100vh" }}>
          <AdminHeader />
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
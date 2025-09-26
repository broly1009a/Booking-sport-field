import { Outlet } from 'react-router-dom';
import GuestHeader from '../components/headers/guestHeader';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const GuestLayout = () => {
    return (
        <>
            <Box >
                <Grid container >
                    <Grid size={12}>
                        <GuestHeader></GuestHeader>
                         <Toolbar />
                    </Grid>
                    <Grid size={12} >
                        <Outlet />
                    </Grid>
                </Grid >
                      <ToastContainer
                        position="top-right"
                        autoClose={2000}
                        pauseOnHover
                        closeOnClick
                        draggable
                        theme="colored"
                      />
            </Box>
        </>
    )
}
export default GuestLayout;
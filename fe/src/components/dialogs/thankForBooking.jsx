import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function ThankForBooking({ open, setOpen }) {

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Cảm ơn bạn đã đặt bàn!
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        Chúng tôi đã tiếp nhận yêu cầu đặt bàn của bạn
                    </Typography>
                    <Typography gutterBottom>
                        Hãy chờ đợi trong giây lát, nhân viên cửa hàng sẽ liên hệ với bạn ngay.
                    </Typography>
                    <Typography gutterBottom>
                        Nếu bạn đã đăng nhập hãy theo dõi trạng thái đặt bàn trong phần quản lý.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Đã hiểu
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

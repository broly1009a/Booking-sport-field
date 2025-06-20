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

export default function ThankForSignUp({ open, setOpen }) {

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth={true}
                maxWidth={"sm"}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Cảm ơn bạn đã đăng ký tài khoản!
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
                    <Typography gutterBottom sx={{ mt: 1 }}>
                        Chúng tôi rất vui mừng chào đón bạn đến với cộng đồng của chúng tôi.
                    </Typography>
                    <Typography gutterBottom sx={{ mt: 1 }}>
                        Việc bạn lựa chọn đăng ký là một sự ủng hộ quý báu và chúng tôi cam kết sẽ mang đến cho bạn những trải nghiệm tốt nhất.
                    </Typography>
                    <Typography gutterBottom sx={{ fontWeight: "bold", color: "#4CAF50", mt: 3 }}>
                        Vui lòng truy cập email của bạn và xác nhận tài khoản trước khi đăng nhập nhé!
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

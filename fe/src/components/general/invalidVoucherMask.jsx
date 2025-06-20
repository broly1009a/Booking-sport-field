import React from 'react';
import { Box, Typography } from '@mui/material';

const InvalidVoucherMask = ({ children, status }) => {
    return (
        <>
            {
                status === 'invalid' ? <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {children}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(128, 128, 128, 0.7)',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Voucher đã hết hạn
                        </Typography>
                    </Box>
                </Box>
                    :
                    <Box>
                        {children}
                    </Box>
            }
        </>

    );
};

export default InvalidVoucherMask;

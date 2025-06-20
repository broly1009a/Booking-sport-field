import Box from '@mui/material/Box';
import videoSrc from '../../assets/default_background_heading.mp4';


const SectionHeading = ({ headingTitle }) => {
    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <video autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <Box
                    sx={{
                        position: 'absolute',
                        mx: 3,
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        typography: 'h2',
                        color: 'white',
                        textShadow: '2px 2px 4px #000000',
                        zIndex: 1 // Đặt z-index để heading nằm trên video
                    }}
                >
                    {headingTitle}
                </Box>
            </Box>

        </>
    )
}

export default SectionHeading;
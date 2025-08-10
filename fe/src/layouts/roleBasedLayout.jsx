import CustomerLayout from './customerLayout';
import GuestLayout from './guestLayout';
import { useAuth } from '../contexts/authContext';
import { useEffect, useState } from 'react';
import EmailVerifierDialog from '../components/dialogs/emailVerifieDialog';
import { doSignOut } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './adminLayout';
import ManagerLayout from './managerLayout';
const RoleBasedLayout = () => {
    const navigate = useNavigate();
    const { currentUser, isUserLoggedIn } = useAuth();
    const [openEmailVerifierDialog, setOpenEmailVerifierDialog] = useState(false);
    const [email, setEmail] = useState(currentUser?.email);
    useEffect(() => {
        if (isUserLoggedIn) {
            setEmail(currentUser?.email);
        }
    }, [isUserLoggedIn, currentUser]);

    useEffect(() => {
        if (currentUser?.role === 'CUSTOMER' && currentUser?.emailVerified === false) {
            setOpenEmailVerifierDialog(true);
            const signOut = async () => {
                await doSignOut();
            }
            signOut();
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.role === 'MANAGER' && window.location.pathname === '/') {
            navigate('/manager/booking-list');
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.role === 'ADMIN' && window.location.pathname === '/') {
            navigate("/admin")
        }
    }, [currentUser]);

    return (
        <>
            {isUserLoggedIn && currentUser?.role === "ADMIN" && <AdminLayout></AdminLayout>}
            {isUserLoggedIn && currentUser?.role === "CUSTOMER" && <CustomerLayout></CustomerLayout>}
            {isUserLoggedIn && currentUser?.role === "MANAGER" && <ManagerLayout></ManagerLayout>}
            {!isUserLoggedIn && <GuestLayout></GuestLayout>}
            <EmailVerifierDialog open={openEmailVerifierDialog} setOpen={setOpenEmailVerifierDialog} email={email}></EmailVerifierDialog>
        </>
    )
}
export default RoleBasedLayout;
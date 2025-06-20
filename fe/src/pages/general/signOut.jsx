// AutoLogout.js
import React, { useEffect } from 'react';
import { doSignOut } from "../../firebase/auth"
import { useNavigate } from 'react-router-dom';
const SignOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const signOut = async () => {
            await doSignOut();
            navigate('/');
        }
        signOut();
    }, [navigate]);

    return (<>
    </>);
};

export default SignOut;

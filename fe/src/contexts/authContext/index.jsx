import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import UserService from "../../services/userService";
const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    const initializeUser = async (user) => {
        if (user) {
            try {
                localStorage.setItem('token', user?.accessToken);
                const dbUser = await UserService.getCurrentUser();
                setCurrentUser({ ...user, ...dbUser.data });
                console.log("Current user: ", { ...user, ...dbUser.data });
                setIsUserLoggedIn(true);
            } catch (error) {
                setCurrentUser(null);
                setIsUserLoggedIn(false);
            }
        } else {
            setCurrentUser(null);
            setIsUserLoggedIn(false);
        }
        setLoading(false);
    }

    const refreshUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const dbUser = await UserService.getCurrentUser();
                setCurrentUser({ ...dbUser.data });
            }
        } catch (error) {
            console.error("Failed to refresh user data", error);
        }
    }
    const value = {
        currentUser,
        isUserLoggedIn,
        loading,
        refreshUserData,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
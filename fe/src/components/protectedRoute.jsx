import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import { useEffect } from "react";

const ProtectedRoute = ({ children, requiredRoles }) => {
    const { currentUser, isUserLoggedIn } = useAuth();

    useEffect(() => {
        if (!isUserLoggedIn) {
            doSignOut();
        }
    }, [isUserLoggedIn]);

    if (!isUserLoggedIn) {
        if (requiredRoles && !requiredRoles.includes('GUEST')) {
            return <Navigate to="/unauthorized" />;
        } else {
            return children;
        }
    }

    if (requiredRoles && !requiredRoles.includes(currentUser?.role)) {
        return <Navigate to="/unauthorized" />;
    } else {
        return children;
    }
};

export default ProtectedRoute;
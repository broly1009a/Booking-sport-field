import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth"
const ProtectedRoute = ({ children, requiredRoles }) => {
    const { currentUser, isUserLoggedIn } = useAuth();

    if (!isUserLoggedIn) {
        const signOut = async () => {
            await doSignOut();
        }
        signOut();
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
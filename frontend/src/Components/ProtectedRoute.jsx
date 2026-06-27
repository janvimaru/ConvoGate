// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//     const token = localStorage.getItem("token");

//     if (!token) {
//         return <Navigate to="/login" replace />;
//     }

//     return children;
// }


// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//     // Look for the actual access token stored by login
//     const token = localStorage.getItem("token");

//     if (!token) {
//         // If no token, redirect to login
//         return <Navigate to="/login" replace />;
//     }

//     // If token exists, render children (protected page)
//     return children;
// }
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

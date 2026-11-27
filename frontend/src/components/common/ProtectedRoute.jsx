
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    initialized
  } = useSelector((state) => state.auth);

  console.log("AUTH DEBUG:", {
  userRole: user?.role,
  allowedRoles,
  isAuthenticated,
  initialized,
});


  
  // Wait until session restoration finishes
  if (!initialized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect guests to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check user role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}


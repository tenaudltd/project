import { useCallback, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MobileNavDrawer from "./MobileNavDrawer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({
  requiresAuth = false,
  allowedRoles = [],
}: {
  requiresAuth?: boolean;
  allowedRoles?: string[];
}) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 animate-pulse">
            Loading platform...
          </p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiresAuth &&
    allowedRoles.length > 0 &&
    userProfile &&
    !allowedRoles.includes(userProfile.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {requiresAuth && <Sidebar />}
      {requiresAuth && (
        <MobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav} />
      )}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Navbar
          showSidebarToggle={requiresAuth}
          onMobileMenuOpen={
            requiresAuth ? () => setMobileNavOpen(true) : undefined
          }
        />
        <main className="w-full h-full p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

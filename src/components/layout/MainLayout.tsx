import { useCallback, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import BrandBackdrop from "../brand/BrandBackdrop";
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

  if (requiresAuth && loading) {
    return (
      <div className="app-shell flex items-center justify-center px-6">
        <BrandBackdrop />
        <div className="app-panel relative z-10 flex flex-col items-center px-10 py-12 text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-[5px] border-primary-100 border-t-primary-600" />
          <p className="mt-4 text-sm font-medium text-ink-600">
            Loading platform...
          </p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresAuth && allowedRoles.length > 0 && currentUser) {
    if (!userProfile) {
      return <Navigate to="/dashboard" replace />;
    }
    if (!allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="app-shell">
      <BrandBackdrop />
      {requiresAuth && (
        <MobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav} />
      )}
      <div className="app-shell-inner lg:flex-row">
        {requiresAuth && <Sidebar />}
        <div className="relative flex min-h-screen flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Navbar
            showSidebarToggle={requiresAuth}
            onMobileMenuOpen={
              requiresAuth ? () => setMobileNavOpen(true) : undefined
            }
          />
          <main className="w-full flex-1 px-4 pb-10 pt-24 md:px-6 lg:px-8 lg:pt-28">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

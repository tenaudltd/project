import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Menu, UserCircle } from "lucide-react";

export default function Navbar({
  showSidebarToggle,
  onMobileMenuOpen,
}: {
  showSidebarToggle: boolean;
  onMobileMenuOpen?: () => void;
}) {
  const { currentUser, userProfile, signOut, isDemoSession } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex w-full h-16 items-center justify-between bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        {showSidebarToggle && onMobileMenuOpen && (
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="text-gray-500 focus:outline-none lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <Link
          to={currentUser ? "/dashboard" : "/"}
          className="flex flex-shrink-0 items-center"
        >
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            CivicEd Mushindamo
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!currentUser ? (
          <>
            <Link
              to="/help"
              className="hidden text-sm font-medium text-gray-700 hover:text-primary-600 sm:block"
            >
              Help
            </Link>
            <Link
              to="/about"
              className="hidden text-sm font-medium text-gray-700 hover:text-primary-600 sm:block"
            >
              About
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Get Started
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden items-center gap-2 text-gray-700 md:flex">
              {isDemoSession && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Demo
                </span>
              )}
              <span>
                Welcome,{" "}
                <span className="font-semibold">
                  {userProfile?.fullName || "User"}
                </span>
              </span>
            </span>
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <UserCircle className="h-8 w-8" />
              </button>
              <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col rounded-md border border-gray-100 bg-white py-1 shadow-lg group-hover:flex">
                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

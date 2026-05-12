import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Menu, UserCircle } from "lucide-react";
import BrandLogo from "../brand/BrandLogo";

export default function Navbar({
  showSidebarToggle,
  onMobileMenuOpen,
}: {
  showSidebarToggle: boolean;
  onMobileMenuOpen?: () => void;
}) {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between rounded-2xl border border-ink-100 bg-white/92 px-4 py-3 shadow-[0_14px_32px_rgba(11,26,31,0.08)] backdrop-blur md:px-5">
        <div className="flex items-center gap-4">
          {showSidebarToggle && onMobileMenuOpen && (
            <button
              type="button"
              onClick={onMobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-100 bg-slate-50 text-ink-700 focus:outline-none lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            to={currentUser ? "/dashboard" : "/"}
            className="flex flex-shrink-0 items-center"
          >
            <BrandLogo compact={showSidebarToggle} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!currentUser ? (
            <>
              <Link
                to="/about"
                className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 md:block"
              >
                About
              </Link>
              <Link
                to="/help"
                className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 md:block"
              >
                Help
              </Link>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 sm:block"
              >
                Login
              </Link>
              <Link to="/register" className="button-primary px-4 py-2.5">
                Get started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-ink-700 xl:flex">
                <span className="font-medium">{userProfile?.fullName || "User"}</span>
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl border border-ink-100 bg-slate-50 px-3 py-2 text-ink-700 hover:bg-slate-100"
                  aria-expanded={menuOpen}
                  aria-label="Open user menu"
                >
                  <UserCircle className="h-5 w-5" />
                </button>
                <div
                  className={`absolute right-0 top-full mt-3 w-60 flex-col rounded-2xl border border-ink-100 bg-white p-2 shadow-[0_18px_40px_rgba(11,26,31,0.12)] ${
                    menuOpen ? "flex" : "hidden"
                  }`}
                >
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {userProfile?.fullName}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-coral-700 hover:bg-coral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

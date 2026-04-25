import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../../contexts/AuthContext";
import { mainNavItems } from "../../lib/navigation";
import BrandLogo from "../brand/BrandLogo";

export default function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { userProfile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const allowedLinks = mainNavItems.filter(
    (link) => !userProfile || link.roles.includes(userProfile.role),
  );

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/25 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <nav
        className="app-panel absolute bottom-4 left-4 top-4 flex w-80 max-w-[88vw] flex-col gap-1 overflow-y-auto p-4 pt-6"
        aria-label="Main navigation"
      >
        <div className="border-b border-ink-100 pb-4">
          <BrandLogo />
        </div>
        {allowedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  "mt-2 flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-ink-600 hover:bg-slate-50 hover:text-ink-900",
                  isActive && "bg-primary-50 text-primary-800",
                ),
              )
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
              <link.icon className="h-5 w-5 flex-shrink-0" />
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

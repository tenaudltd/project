import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../../contexts/AuthContext";
import { mainNavItems } from "../../lib/navigation";

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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close menu"
      />
      <nav
        className="absolute left-0 top-0 bottom-0 flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-r border-gray-200 bg-white p-4 pt-20 shadow-xl"
        aria-label="Main navigation"
      >
        {allowedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",
                  isActive &&
                    "bg-primary-50 text-primary-700 hover:bg-primary-50",
                ),
              )
            }
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

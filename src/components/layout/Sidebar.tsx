import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { navItemsVisibleForAuthUser } from "../../lib/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import BrandLogo from "../brand/BrandLogo";

export default function Sidebar() {
  const { userProfile } = useAuth();

  const allowedLinks = navItemsVisibleForAuthUser(userProfile);

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 p-5 lg:flex">
      <div className="app-panel flex w-full flex-col overflow-hidden px-4 py-5">
        <div className="border-b border-ink-100 px-2 pb-5">
          <BrandLogo className="px-2" />
          <p className="mt-4 px-2 text-sm text-ink-600">
            Quick access to learning, announcements, and account tools.
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-2 pt-5">
          {allowedLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    "flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-ink-600 hover:bg-slate-50 hover:text-ink-900",
                    isActive && "bg-primary-50 text-primary-800",
                  ),
                )
              }
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <link.icon className="h-5 w-5 flex-shrink-0" />
              </span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-[20px] bg-slate-50 p-4 text-sm text-ink-700">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink-500">
            Signed in as
          </p>
          <p className="mt-2 text-base font-semibold text-ink-900">
            {userProfile?.fullName || "Platform user"}
          </p>
          <p className="mt-1 capitalize text-ink-500">
            {userProfile?.role || "guest"}
          </p>
        </div>
      </div>
    </aside>
  );
}

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen,
  Home,
  Bell,
  MessageSquare,
  Settings,
  Users,
  LayoutDashboard,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export default function Sidebar() {
  const { userProfile } = useAuth();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["learner", "staff", "admin"],
    },
    {
      to: "/modules",
      label: "Modules",
      icon: BookOpen,
      roles: ["learner", "staff", "admin"],
    },
    {
      to: "/announcements",
      label: "Announcements",
      icon: Bell,
      roles: ["learner", "staff", "admin"],
    },
    {
      to: "/feedback",
      label: "Feedback",
      icon: MessageSquare,
      roles: ["learner"],
    },
    {
      to: "/staff",
      label: "Staff Panel",
      icon: LayoutDashboard,
      roles: ["staff", "admin"],
    },
    { to: "/admin", label: "User Management", icon: Users, roles: ["admin"] },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["learner", "staff", "admin"],
    },
  ];

  const allowedLinks = links.filter(
    (link) => !userProfile || link.roles.includes(userProfile.role),
  );

  return (
    <aside className="hidden w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4 pt-6">
        {allowedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 text-gray-600",
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
    </aside>
  );
}

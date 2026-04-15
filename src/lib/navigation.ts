import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import type { Role } from "./types";

export type MainNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

export const mainNavItems: MainNavItem[] = [
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
  {
    to: "/admin",
    label: "User Management",
    icon: Users,
    roles: ["admin"],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["learner", "staff", "admin"],
  },
  {
    to: "/help",
    label: "Help",
    icon: CircleHelp,
    roles: ["learner", "staff", "admin"],
  },
];

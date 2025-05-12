import { useState } from "react";
import {
  Users,
  Map,
  UserCircle,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  LucideIcon,
  ClipboardList,
  CalendarCheck,
  Gift,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Define types for menu items and categories
type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

type MenuCategory = {
  name: "GENERAL" | "MANAGEMENT" | "ENGAGEMENT" | "SERVICES" | "RESERVATIONS";
  items: MenuItem[];
};

// Restructure menu items into categories
const menuCategories: MenuCategory[] = [
  {
    name: "GENERAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: UserCircle, label: "Profile", path: "/profile" },
    ],
  },
  {
    name: "SERVICES",
    items: [
      { icon: Map, label: "Trips", path: "/trips" },
      { icon: Calendar, label: "Events", path: "/events" },
      { icon: Gift, label: "Rewards", path: "/rewards" },
    ],
  },
  {
    name: "RESERVATIONS",
    items: [
      { icon: ClipboardList, label: "Reservations", path: "/reservations" },
      {
        icon: CalendarCheck,
        label: "Event Reservations",
        path: "/event-reservations",
      },
    ],
  },
  {
    name: "MANAGEMENT",
    items: [{ icon: Users, label: "Users", path: "/users" }],
  },
  {
    name: "ENGAGEMENT",
    items: [
      { icon: FileText, label: "Surveys", path: "/surveys" },
      { icon: MessageSquare, label: "Community", path: "/community" },
    ],
  },
];

type ExpandedCategories = {
  GENERAL: boolean;
  MANAGEMENT: boolean;
  ENGAGEMENT: boolean;
  SERVICES: boolean;
  RESERVATIONS: boolean;
};

const Sidebar = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();
  const [expandedCategories, setExpandedCategories] =
    useState<ExpandedCategories>({
      GENERAL: true,
      MANAGEMENT: true,
      ENGAGEMENT: true,
      SERVICES: true,
      RESERVATIONS: true,
    });

  const toggleCategory = (category: MenuCategory["name"]) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-64 bg-gradient-to-r from-primary to-primary/80 min-h-screen flex flex-col overflow-hidden">
      <div className="p-5 border-b border-white/20">
        <h1 className="text-white text-2xl font-bold text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary">
            Admin Panel
          </span>
        </h1>
      </div>

      {/* User info section */}
      {admin && (
        <div className="px-4 py-4 border-b border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3 border-2 border-secondary">
              {admin.profileImage ? (
                <img
                  src={admin.profileImage}
                  alt={admin.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {admin.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-300 mb-0.5">Welcome back,</p>
              <p className="font-semibold text-white truncate">{admin.name}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto pt-2">
        {menuCategories.map((category) => (
          <div key={category.name} className="mb-2">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between px-4 py-2 text-white font-medium text-xs"
            >
              <span className="uppercase tracking-wider">{category.name}</span>
              {expandedCategories[category.name] ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>

            {expandedCategories[category.name] && (
              <ul className="px-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/surveys" &&
                      location.pathname.includes("/survey"));

                  return (
                    <li key={item.path} className="mb-0.5">
                      <Link
                        to={item.path}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-secondary text-white"
                            : "text-gray-100 hover:bg-secondary/60"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-white/20 mt-auto">
        <button
          onClick={logout}
          className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-md flex items-center justify-center text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

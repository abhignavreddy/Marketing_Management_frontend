import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  Calendar,
  DollarSign,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Award,
  UserPlus,
  Building,
  LogOut,
  FolderPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

// ---------- Menu Configuration ----------
const menuConfig = {
  Manager: [
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/manager-board", label: "Manager Board", icon: Users },
    { path: "/attendance", label: "Attendance", icon: Calendar },
    { path: "/leave-requests", label: "Leave Requests", icon: FileText },
    { path: "/documents-management", label: "Document Management", icon: FolderPlus },
  ],
  HR: [
    { path: "/employee-directory", label: "Employee Directory", icon: Users },
    { path: "/attendance", label: "Attendance", icon: Calendar },
    { path: "/onboarding", label: "Onboarding", icon: UserPlus },
    { path: "/leave-requests", label: "Leave Requests", icon: FileText },
    { path: "/payroll", label: "Payroll", icon: DollarSign },
    { path: "/documents-management", label: "Document Management", icon: FolderPlus },
  ],
  CEO: [
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/attendance", label: "Attendance", icon: Calendar },
    { path: "/leave-requests", label: "Leave Requests", icon: FileText },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/department-reports", label: "Department Reports", icon: Building },
    { path: "/salaries-overview", label: "Salaries Overview", icon: DollarSign },
    { path: "/top-performers", label: "Top Performers", icon: Award },
    { path: "/task-analytics", label: "Task Analytics", icon: TrendingUp },
    { path: "/documents-management", label: "Document Management", icon: FolderPlus },
  ],
  Employee: [
    { path: "/employee-board", label: "Employee Board", icon: Building },
    { path: "/my-attendance", label: "Attendance History", icon: Calendar },
    { path: "/my-salary", label: "Salary Details", icon: DollarSign },
    { path: "/profile", label: "Profile", icon: Users },
  ],
};

// ---------- Main Sidebar ----------
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = menuConfig[user?.role] || [];

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="w-64 h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">CompanyHub</span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-blue-600">
              {getInitials(user?.name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full text-slate-300 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-2">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

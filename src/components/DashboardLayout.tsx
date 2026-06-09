import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { 
  LayoutDashboard, FileText, ClipboardList, 
  FileSpreadsheet, Users, LogOut, Menu, X, CreditCard, ChevronRight,
  CheckSquare, BarChart3, Bell, User
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Unified menu list as requested by the user (excluding Settings/Profile)
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "PROCUREMENT", "VENDOR", "MANAGER"] },
    { name: "Vendors", path: "/vendor-onboarding", icon: Users, roles: ["ADMIN", "PROCUREMENT", "MANAGER"] },
    { name: "RFQs", path: "/rfqs", icon: ClipboardList, roles: ["ADMIN", "PROCUREMENT", "VENDOR", "MANAGER"] },
    { name: "Quotations", path: "/quotations", icon: FileSpreadsheet, roles: ["VENDOR"] },
    { name: "Approvals", path: "/approvals", icon: CheckSquare, roles: ["ADMIN", "PROCUREMENT", "MANAGER"] },
    { name: "Purchase Orders", path: "/purchase-orders", icon: FileText, roles: ["ADMIN", "PROCUREMENT", "VENDOR", "MANAGER"] },
    { name: "Invoices", path: "/invoices", icon: CreditCard, roles: ["ADMIN", "PROCUREMENT", "VENDOR", "MANAGER"] },
    { name: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN", "PROCUREMENT", "MANAGER"] },
  ];

  // Filter items based on user role to keep the application secure and robust
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/auth/notifications");
      const items = res.data.data || [];
      setNotifications(items);
      
      const readIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");
      const unread = items.filter((n: any) => !readIds.includes(n.id));
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = (id: string, link: string) => {
    const readIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("readNotificationIds", JSON.stringify(readIds));
    }
    const unread = notifications.filter((n: any) => !readIds.includes(n.id));
    setUnreadCount(unread.length);
    setShowNotifMenu(false);
    navigate(link);
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("readNotificationIds", JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderNotificationBell = () => {
    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifMenu(!showNotifMenu)}
          className="relative p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-slate-100 transition focus:outline-none flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-brand-error text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border-default rounded shadow-lg z-50 overflow-hidden text-xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-border-default flex items-center justify-between font-bold text-text-primary">
                <span>Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-brand-primary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const isRead = JSON.parse(localStorage.getItem("readNotificationIds") || "[]").includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.link)}
                        className={`p-3 hover:bg-slate-50 cursor-pointer transition flex flex-col gap-1 ${!isRead ? 'bg-slate-50/70 border-l-2 border-brand-primary pl-2.5' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-bold ${!isRead ? 'text-text-primary' : 'text-text-secondary'}`}>{notif.title}</span>
                          <span className="text-[9px] text-text-secondary whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-text-secondary text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-text-secondary">
                    No new system notifications.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-bg-card border-b border-border-default py-4 px-6 flex items-center justify-between z-40">
        <div className="flex items-center">
          <span className="font-bold tracking-tight text-text-primary text-base">VendorBridge</span>
        </div>
        <div className="flex items-center gap-3">
          {renderNotificationBell()}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-border-default p-5 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64 shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center pb-5 border-b border-border-default">
            <span className="text-lg font-bold tracking-tight text-brand-primary font-display">VendorBridge</span>
          </div>

          {/* User Widget */}
          <div className="bg-slate-50 p-4 rounded border border-border-default space-y-2">
            <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Logged in as</div>
            <div className="font-bold text-text-primary text-sm truncate">{user?.name}</div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase">
              {user?.role.replace(/_/g, " ")}
            </div>
            {user?.vendorStatus && (
              <div className="text-[11px] text-text-secondary block">
                Status: <span className="font-medium text-brand-success">{user.vendorStatus}</span>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center justify-between py-2 px-3 rounded text-sm transition font-medium group
                    ${isActive 
                      ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary pl-2.5" 
                      : "text-text-secondary hover:text-text-primary hover:bg-slate-50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-text-secondary/40 group-hover:text-text-secondary ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100 transition'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Block */}
        <div className="space-y-1.5 pt-4 border-t border-border-default">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 py-2 px-3 rounded text-sm transition font-medium group
              ${location.pathname === "/settings"
                ? "bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary pl-2.5"
                : "text-text-secondary hover:text-text-primary hover:bg-slate-50"}
            `}
          >
            <User className={`w-4 h-4 transition-colors ${location.pathname === "/settings" ? 'text-brand-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
            <span>Update Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2 px-3 rounded text-sm text-brand-danger font-medium hover:bg-red-50 transition w-full text-left"
          >
            <LogOut className="w-4 h-4 text-brand-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-bg-card border-b border-border-default h-14 items-center justify-between px-8 z-10 shrink-0">
          <div className="text-sm font-semibold text-text-secondary">
            Enterprise Procurement Suite
          </div>
          <div className="flex items-center gap-5 text-sm">
            {renderNotificationBell()}
            <div className="h-4 w-px bg-border-default"></div>
            <span className="text-text-secondary">Welcome, <strong className="text-text-primary">{user?.name}</strong></span>
            <div className="h-4 w-px bg-border-default"></div>
            <span className="text-[11px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded uppercase">
              {user?.role.replace(/_/g, " ")}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

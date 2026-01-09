import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, ShoppingBag, Tag, User, Target, Badge, Image, Globe,
  Building, BarChart3, Settings, ChevronRight, ChevronDown, Store, Plus, PlusCircle, Menu, X, LogOut, Loader2, Megaphone
} from 'lucide-react';
import { useAuth } from '../context/authContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const { user, signOut } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'A';
    return user.email.charAt(0).toUpperCase();
  };

  // Define your main navigation items
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Orders', icon: ShoppingBag, path: '/orders' },
    { name: 'Products', icon: Tag, path: '/products' },
    { name: 'Add Product', icon: PlusCircle, path: '/products/create' },
    { name: 'Customers', icon: User, path: '/customers' },
    {
      name: 'Marketing',
      icon: Megaphone,
      path: '/marketing', // This path acts as an ID for expansion
      children: [
        { name: 'Email', path: '/marketing/email' },
        { name: 'Facebook', path: '/marketing/facebook' },
        { name: 'TikTok', path: '/marketing/tiktok' },
      ]
    },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  const toggleSubmenu = (path) => {
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // A small internal component for the buttons to keep things clean
  const NavItem = ({ name, icon: Icon, path, children, onClick }) => {
    // Check if the current URL matches the path (or sub-paths) to highlight it
    const isMainActive = location.pathname === path;
    const isChildActive = children?.some(child => location.pathname === child.path);
    const isActive = isMainActive || isChildActive;

    // Check if this menu is expanded
    const isExpanded = expandedMenus[path];

    const handleClick = () => {
      if (children) {
        toggleSubmenu(path);
      } else {
        navigate(path);
        if (onClick) onClick();
      }
    };

    return (
      <div className="w-full">
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] transition-colors ${isActive && !children // Only highlight main if it's a direct link or if we assume parent highlights with child (design choice)
              ? 'bg-white text-[#303030] font-medium shadow-sm'
              : 'text-[#303030] hover:bg-[#ECECEC]'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} strokeWidth={2} />
            <span className="text-[15px] font-medium">{name}</span>
          </div>
          {children && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </button>

        {/* Sub-menu items */}
        {children && isExpanded && (
          <div className="mt-1 ml-4 space-y-1">
            {children.map((child) => {
              const isChildActive = location.pathname === child.path;
              return (
                <button
                  key={child.path}
                  onClick={() => {
                    navigate(child.path);
                    if (onClick) onClick();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[8px] transition-colors ${isChildActive
                      ? 'bg-white text-[#303030] font-medium shadow-sm'
                      : 'text-[#6D6D6D] hover:bg-[#ECECEC]'
                    }`}
                >
                  <span className="text-[14px]">{child.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SectionLabel = ({ children }) => (
    <div className="flex items-center justify-between mt-5 mb-2 px-3">
      <span className="text-[13px] font-medium text-[#6D6D6D]">{children}</span>
      <ChevronRight size={14} className="text-[#6D6D6D]" />
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed position at top left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[270px] h-screen bg-[#F6F6F7] px-4 py-3 flex flex-col border-r border-[#E1E1E1]
        fixed md:relative z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="flex-1 flex flex-col space-y-1 mt-12 md:mt-0 overflow-y-auto">

          {/* Main Menu */}
          {navItems.map((item) => (
            <NavItem key={item.name} {...item} onClick={() => setIsOpen(false)} />
          ))}

          {/* Sales Channels Section */}
          <SectionLabel>Manage My Store</SectionLabel>
          <NavItem name="Online Store" icon={Store} path="/store" onClick={() => setIsOpen(false)} />
          <NavItem name="Store Editor" icon={Image} path="/store/editor" onClick={() => setIsOpen(false)} />

          {/* Apps Section */}
          <SectionLabel>Apps</SectionLabel>
          <NavItem name="Add" icon={Plus} path="/apps" onClick={() => setIsOpen(false)} />

        </nav>

        {/* Bottom Section: Settings & User Profile */}
        <div className="mt-auto pt-4 space-y-3 border-t border-[#E1E1E1]">
          {/* Settings */}
          <NavItem name="Settings" icon={Settings} path="/settings" onClick={() => setIsOpen(false)} />

          {/* User Profile & Logout */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E1E1E1]">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {getUserInitials()}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#303030] truncate">
                  {user?.email || 'Admin'}
                </p>
                <p className="text-xs text-[#6D6D6D]">Administrator</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
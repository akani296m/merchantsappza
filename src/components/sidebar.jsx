import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, ShoppingBag, Tag, User, Target, Badge, Image, Globe,
  Building, BarChart3, Settings, ChevronRight, Store, Plus, PlusCircle, Menu, X
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Define your main navigation items
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Orders', icon: ShoppingBag, path: '/orders' },
    { name: 'Products', icon: Tag, path: '/products' },
    // UPDATE THIS LINE:
    { name: 'Add Product', icon: PlusCircle, path: '/products/create' },
    { name: 'Customers', icon: User, path: '/customers' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  // A small internal component for the buttons to keep things clean
  const NavItem = ({ name, icon: Icon, path, onClick }) => {
    // Check if the current URL matches the path to highlight it
    const isActive = location.pathname === path;

    const handleClick = () => {
      navigate(path);
      if (onClick) onClick();
    };

    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${isActive
          ? 'bg-white text-[#303030] font-medium shadow-sm'
          : 'text-[#303030] hover:bg-[#ECECEC]'
          }`}
      >
        <Icon size={20} strokeWidth={2} />
        <span className="text-[15px] font-medium">{name}</span>
      </button>
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
        <nav className="flex-1 flex flex-col space-y-1 mt-12 md:mt-0">

          {/* Main Menu */}
          {navItems.map((item) => (
            <NavItem key={item.name} {...item} onClick={() => setIsOpen(false)} />
          ))}

          {/* Sales Channels Section */}
          <SectionLabel>Sales channels</SectionLabel>
          <NavItem name="Online Store" icon={Store} path="/store" onClick={() => setIsOpen(false)} />

          {/* Apps Section */}
          <SectionLabel>Apps</SectionLabel>
          <NavItem name="Add" icon={Plus} path="/apps" onClick={() => setIsOpen(false)} />

        </nav>

        {/* Bottom Settings Button */}
        <div className="mt-auto pt-4">
          <NavItem name="Settings" icon={Settings} path="/settings" onClick={() => setIsOpen(false)} />
        </div>
      </aside>
    </>
  );
}
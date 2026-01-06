import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingBag, Tag, User, Target, Badge, Image, Globe, 
  Building, BarChart3, Settings, ChevronRight, Store, Plus ,PlusCircle  
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const NavItem = ({ name, icon: Icon, path }) => {
    // Check if the current URL matches the path to highlight it
    const isActive = location.pathname === path;
    
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${
          isActive 
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
    <aside className="w-[270px] h-screen bg-[#F6F6F7] px-4 py-3 flex flex-col border-r border-[#E1E1E1]">
      <nav className="flex-1 flex flex-col space-y-1">
        
        {/* Main Menu */}
        {navItems.map((item) => (
          <NavItem key={item.name} {...item} />
        ))}

        {/* Sales Channels Section */}
        <SectionLabel>Sales channels</SectionLabel>
        <NavItem name="Online Store" icon={Store} path="/store" />

        {/* Apps Section */}
        <SectionLabel>Apps</SectionLabel>
        <NavItem name="Add" icon={Plus} path="/apps" />

      </nav>

      {/* Bottom Settings Button */}
      <div className="mt-auto pt-4">
        <NavItem name="Settings" icon={Settings} path="/settings" />
      </div>
    </aside>
  );
}
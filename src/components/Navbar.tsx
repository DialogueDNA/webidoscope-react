
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Here you would add your actual logout logic
    console.log("User logged out");
    navigate('/');
  };

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-black dark:bg-white rounded-full"></div>
        <span className="font-semibold text-lg">EmotionAI Tool</span>
      </div>
      
      <div className="flex items-center space-x-8">
        <NavLink href="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
        <NavLink href="/sessions" active={isActive('/sessions')}>Sessions</NavLink>
        <NavLink href="/settings" active={isActive('/settings')}>Settings</NavLink>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
}

const NavLink = ({ href, children, active }: NavLinkProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "text-sm font-medium transition-colors hover:text-black dark:hover:text-white relative",
        active 
          ? "text-black dark:text-white after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-black dark:after:bg-white after:bottom-[-8px] after:left-0" 
          : "text-gray-600 dark:text-gray-300"
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;

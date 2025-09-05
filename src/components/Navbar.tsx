import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/**
 * Navbar component displays the top navigation bar with links and logout functionality.
 * It highlights the active page and provides feedback using toast notifications.
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  /**
   * Checks if the given path matches the current location.
   * @param path - The path to check.
   * @returns True if the path is active.
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Handles user logout by calling signOut, showing a toast, and redirecting.
   */
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been logged out",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  /**
   * Shows a toast indicating the Live Dashboard feature is not yet available.
   */
  const handleLiveDashboardClick = () => {
    toast({
      title: "Coming Soon",
      description: "Live Dashboard feature is currently under development",
    });
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-6 py-4 flex items-center justify-between bg-card/95 backdrop-blur-sm border-b border-border shadow-soft sticky top-0 z-50"
    >
      {/* Logo and app name */}
      <div className="flex items-center space-x-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="h-8 w-8 bg-primary rounded-full shadow-sm"
        />
        <span className="font-heading text-xl font-medium text-foreground">EmotionAI Tool</span>
      </div>

      {/* Navigation links and actions */}
      <div className="flex items-center space-x-8">
        {/* Disabled Live Dashboard button with tooltip */}
        <button
          onClick={handleLiveDashboardClick}
          className="text-sm font-medium transition-colors text-muted-foreground cursor-not-allowed relative group"
          disabled
        >
          Live Dashboard
          <div className="absolute bottom-[-32px] left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft">
            Coming Soon
          </div>
        </button>
        {/* Navigation links */}
        <NavLink href="/sessions" active={isActive('/sessions')}>Sessions</NavLink>
        <NavLink href="/settings" active={isActive('/settings')}>Settings</NavLink>
        {/* Logout button */}
        <motion.div
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground creative-focus-ring"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

/**
 * NavLink component renders a styled navigation link.
 * @param href - The target path.
 * @param children - The link label.
 * @param active - Whether the link is active.
 */
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
        "text-sm font-medium transition-all duration-300 hover:text-foreground relative creative-focus-ring",
        active
          ? "text-foreground" 
          : "text-muted-foreground"
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeNavUnderline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

export default Navbar;
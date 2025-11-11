import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, User } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: null },
    { to: "/submit", label: "Submit", icon: FileText },
    { to: "/track", label: "Track", icon: BarChart3 },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 shadow-soft"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-bold text-sm">EN</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              Ethereal Nexus
            </span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;

              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant="ghost"
                    className={`relative transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

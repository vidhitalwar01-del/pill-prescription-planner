import { useNavigate, useLocation } from "react-router-dom";
import { Home, Pill, Activity, Heart, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home, isRoute: true },
    { to: "/add-medication", label: "Medications", icon: Pill, isRoute: true },
    { to: "#statistics", label: "Progress", icon: Activity, isRoute: false },
    { to: "#wellness", label: "Wellness", icon: Heart, isRoute: false },
    { to: "#email-settings", label: "Reports", icon: FileText, isRoute: false },
    { to: "#calendar-sync", label: "Profile", icon: User, isRoute: false },
  ];

  const handleClick = (to: string, isRoute: boolean) => {
    if (isRoute) {
      navigate(to);
    } else {
      const element = document.querySelector(to);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const isActive = (to: string, isRoute: boolean) => {
    if (isRoute) {
      return location.pathname === to;
    }
    return false; // Hash-based items don't show as active
  };

  return (
    <nav className="flex items-center gap-1 md:gap-2" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <button
          key={item.to}
          onClick={() => handleClick(item.to, item.isRoute)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isActive(item.to, item.isRoute)
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          aria-label={item.label}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;

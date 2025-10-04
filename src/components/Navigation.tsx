import { NavLink } from "react-router-dom";
import { Home, Pill, Activity, Heart, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/add-medication", label: "Medications", icon: Pill },
    { to: "/dashboard#progress", label: "Progress", icon: Activity },
    { to: "/dashboard#wellness", label: "Wellness", icon: Heart },
    { to: "/dashboard#reports", label: "Reports", icon: FileText },
    { to: "/dashboard#profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="flex items-center gap-1 md:gap-2" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
          aria-label={item.label}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;

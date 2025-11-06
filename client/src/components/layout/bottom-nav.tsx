import { Home, Users, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/community", icon: Users, label: "커뮤니티" },
    { path: "/my", icon: User, label: "MY" },
  ];

  return (
    <nav className="marketplace-bottom-nav">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "marketplace-nav-item",
                  isActive && "active"
                )}
                data-testid={`nav-${item.label}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

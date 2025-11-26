import { Home, MessageSquare, Users, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/community", icon: MessageSquare, label: "자유게시판" },
    { path: "/meetings", icon: Users, label: "모임방" },
    { path: "/my", icon: User, label: "MY" },
  ];

  return (
    <nav className="marketplace-bottom-nav fixed bottom-0 w-full bg-white border-t border-gray-200 py-2">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "marketplace-nav-item flex flex-col items-center px-2 py-1 text-[10px]",
                  isActive ? "text-gray-900 font-semibold" : "text-gray-400"
                )}
                data-testid={`nav-${item.label}`}
              >
                <Icon className={cn("h-5 w-5 mb-1", isActive && "stroke-[2.5px]")} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
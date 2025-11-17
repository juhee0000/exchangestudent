import { Home, MessageSquare, Users, User, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // 읽지 않은 알림 개수 조회
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  const unreadCount = unreadData?.count || 0;

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/community", icon: MessageSquare, label: "자유게시판" },
    { path: "/notifications", icon: Bell, label: "알림", badge: unreadCount },
    { path: "/meetings", icon: Users, label: "모임방" },
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
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

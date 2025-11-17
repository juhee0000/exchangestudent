import { User, Settings, MessageSquare, Package, Star, LogOut, Edit, FileText, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// 추가된 타입 정의
interface UserStats {
  sellingStat: number;
  soldStat: number;
  purchasedStat: number;
}

export default function MyPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // useQuery에 <UserStats> 타입 명시
  const { data: stats, isLoading: isStatsLoading } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.profileImage || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user.username?.charAt(0) || user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{user.username || user.fullName}</h1>
           
            <p className="text-sm text-gray-500">{user.country} • {user.school}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            <Edit className="w-4 h-4 mr-2" />
            편집
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
       
        {/* 메뉴 */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              <MenuItem
                icon={FileText}
                title="내가 쓴 글"
                description="작성한 커뮤니티 글 보기"
                onClick={() => navigate("/my/posts")}
              />
              <MenuItem
                icon={MessageCircle}
                title="댓글 쓴 글"
                description="댓글 단 글 보기"
                onClick={() => navigate("/my/commented")}
                isLast
              />
            </div>
          </CardContent>
        </Card>

        {/* 설정 */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              <MenuItem
                icon={Settings}
                title="설정"
                description="알림, 문의하기"
                onClick={() => navigate("/settings")}
              />
              <MenuItem
                icon={LogOut}
                title="로그아웃"
                description="계정에서 로그아웃"
                onClick={handleLogout}
                isLast
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  isLast?: boolean;
}

function MenuItem({ icon: Icon, title, description, onClick, isLast }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 transition-colors ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
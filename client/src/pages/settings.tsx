import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  ChevronRight, 
  Trash2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    chat: true,
    marketing: false,
  });
  const [language, setLanguage] = useState("ko");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    location: "",
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "로그아웃되었습니다",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await apiRequest("DELETE", "/api/user/account");
      const result = await response.json();
      
      toast({
        title: "계정이 삭제되었습니다",
        variant: "default",
      });
      
      // 강제 로그아웃 처리는 이미 API에서 처리됨
      if (result.forceLogout) {
        await logout();
      }
    } catch (error) {
      toast({
        title: "계정 삭제 실패",
        description: "문제가 발생했습니다. 고객센터에 문의해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await apiRequest("PUT", "/api/user/profile", profileData);
      toast({
        title: "프로필이 업데이트되었습니다",
        variant: "default",
      });
      setShowProfileEdit(false);
    } catch (error) {
      toast({
        title: "프로필 업데이트 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    try {
      const newNotifications = { ...notifications, [key]: value };
      setNotifications(newNotifications);
      await apiRequest("PUT", "/api/user/notifications", newNotifications);
      toast({
        title: "알림 설정이 변경되었습니다",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "설정 변경 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto flex items-center">
          <Link to="/my">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold ml-3">설정</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        

        {/* 기타 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">기타</h3>

          {/* 세로 버튼 그룹 + 버튼 사이 간격 space-y */}
          <div className="flex flex-col space-y-2">
            {/* 1번째 버튼: 문의하기 */}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = 'mailto:park36470805@gmail.com?subject=문의사항'}
              data-testid="button-contact"
            >
              문의하기
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>

            {/* 2번째 버튼: 이용약관 */}
            <Link to="/terms">
              <Button variant="outline" className="w-full justify-start">
                서비스 이용약관
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>

            {/* 3번째 버튼: 개인정보 처리방침 */}
            <Link to="/privacy">
              <Button variant="outline" className="w-full justify-start">
                개인정보 처리방침
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 계정 관리 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">계정 관리</h3>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  회원탈퇴
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>회원탈퇴를 하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    탈퇴하면 계정 정보와 개인 데이터는 모두 삭제되며 복구할 수 없습니다.
                    작성했던 게시글과 댓글은 서비스 운영 및 안전한 거래 기록 보존을 위해
                    작성자 정보만 ‘탈퇴한 사용자’로 변경된 상태로 유지됩니다.
                    
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    회원탈퇴
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </main>
    </div>
  );
}
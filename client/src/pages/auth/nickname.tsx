import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function NicknamePage() {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkMessage, setCheckMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Handle OAuth callback parameters - do NOT call login yet
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (tokenParam && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setToken(tokenParam);
        setUserData(user);
        
        // If username is already set (not kakao_), pre-fill it and mark as available
        if (user.username && !user.username.startsWith('kakao_')) {
          setUsername(user.username);
          setIsAvailable(true);
          setCheckMessage("사용 가능한 닉네임입니다");
        }
        
        // Store token for API calls but don't log in yet
        localStorage.setItem('token', tokenParam);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth/login');
      }
    } else if (!token) {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        navigate('/auth/login');
      } else {
        setToken(storedToken);
      }
    }
  }, [navigate]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setIsAvailable(null);
    setCheckMessage("");
  };

  const checkUsernameAvailability = async () => {
    if (!username.trim()) {
      setCheckMessage("닉네임을 입력해주세요.");
      setIsAvailable(false);
      return;
    }

    // Validate format
    const usernameRegex = /^[가-힣a-zA-Z0-9]{1,8}$/;
    if (!usernameRegex.test(username)) {
      setCheckMessage("한글, 영문, 숫자만 사용 가능하며 8자 이내여야 합니다.");
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAvailable(data.available);
        setCheckMessage(data.message);
      } else {
        setIsAvailable(false);
        setCheckMessage(data.error || '닉네임 확인에 실패했습니다.');
      }
    } catch (error) {
      setIsAvailable(false);
      setCheckMessage('닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAvailable) {
      toast({
        title: "닉네임 확인 필요",
        description: "사용 가능한 닉네임을 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "인증 오류",
        description: "로그인 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      // Check if username is already set (not changed)
      const isUsernameAlreadySet = userData?.username && !userData.username.startsWith('kakao_') && userData.username === username;
      
      let updatedUser = userData;
      
      // Only call API if username changed or not yet set
      if (!isUsernameAlreadySet) {
        const response = await fetch('/api/auth/update-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '닉네임 설정에 실패했습니다.');
        }

        const data = await response.json();
        updatedUser = data.user;
      }
      
      // Navigate to complete registration with token/user params
      // Do NOT call login() yet - keep onboardingComplete check active until final completion
      const userPayload = encodeURIComponent(JSON.stringify(updatedUser));
      navigate(`/auth/complete-registration?token=${token}&user=${userPayload}`);
    } catch (error: any) {
      toast({
        title: "닉네임 설정 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/auth/login')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-medium text-gray-700">닉네임 설정</h1>
        <div className="w-8"></div>
      </div>

      {/* 진행률 표시 */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">1/3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
            style={{ width: '33%' }}
          ></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            환영합니다!
          </h2>
          <p className="text-gray-600">
            사용하실 닉네임을 정해주세요
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-blue-500 font-medium">
              닉네임
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="한글, 영문, 숫자 8자 이내"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="flex-1 border-2 border-blue-200 rounded-xl p-4 text-base focus:border-blue-500 focus:ring-0"
                maxLength={8}
                data-testid="input-nickname"
              />
              <Button
                type="button"
                onClick={checkUsernameAvailability}
                disabled={isChecking || !username.trim()}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                data-testid="button-check-nickname"
              >
                {isChecking ? "확인 중..." : "중복확인"}
              </Button>
            </div>
            
            {checkMessage && (
              <div className={`flex items-center gap-2 text-sm ${
                isAvailable ? 'text-green-600' : 'text-red-600'
              }`}>
                {isAvailable ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>{checkMessage}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
           
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isAvailable || isLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-base font-medium rounded-xl flex items-center justify-center gap-2"
            data-testid="button-next"
          >
            {isLoading ? (
              "처리 중..."
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

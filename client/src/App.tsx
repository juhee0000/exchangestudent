import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { WebSocketProvider } from "./hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useEffect, lazy, Suspense } from "react";
import { initAmplitude } from "./lib/amplitude";

import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/layout/bottom-nav";

const Chat = lazy(() => import("@/pages/chat"));
const ChatRoom = lazy(() => import("@/pages/chat-room"));
const Community = lazy(() => import("@/pages/community"));
const Meetings = lazy(() => import("@/pages/meetings"));
const MyPage = lazy(() => import("@/pages/my"));
const Profile = lazy(() => import("@/pages/profile"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const CompleteRegistration = lazy(() => import("@/pages/auth/complete-registration"));
const NicknamePage = lazy(() => import("@/pages/auth/nickname"));
const CreateItem = lazy(() => import("@/pages/items/create"));
const EditItem = lazy(() => import("@/pages/items/edit"));
const ItemDetail = lazy(() => import("@/pages/items/detail"));
const SearchPage = lazy(() => import("@/pages/search"));
const SearchResults = lazy(() => import("@/pages/search-results"));
const ItemsSearch = lazy(() => import("@/pages/search/items"));
const CommunitySearch = lazy(() => import("@/pages/search/community"));
const MeetingsSearch = lazy(() => import("@/pages/search/meetings"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const CommunityCreate = lazy(() => import("@/pages/community-create"));
const MeetingCreate = lazy(() => import("@/pages/meeting-create"));
const MeetingEdit = lazy(() => import("@/pages/meeting-edit"));
const CommunityDetail = lazy(() => import("@/pages/community-detail"));
const MeetingDetail = lazy(() => import("@/pages/meeting-detail"));
const CommunityEdit = lazy(() => import("@/pages/community-edit"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const MyItems = lazy(() => import("@/pages/my/items"));
const MyReviews = lazy(() => import("@/pages/my/reviews"));
const MyPosts = lazy(() => import("@/pages/my/posts"));
const MyCommentedPosts = lazy(() => import("@/pages/my/commented"));
const SettingsPage = lazy(() => import("@/pages/settings"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  const [location, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const isAuthPage = location.startsWith('/auth');
  const isItemDetailPage = location.startsWith('/items/') && location !== '/items/create' && !location.includes('/edit');
  const isSearchPage = location === '/search' || location.startsWith('/search/');
  const isProfilePage = location === '/profile';
  const isNotificationsPage = location === '/notifications';
  const isAdminPage = location.startsWith('/admin');

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // 온보딩 미완료 시 항상 닉네임 페이지부터 시작
        if (user.onboardingComplete === false) {
          // 닉네임 또는 complete-registration 페이지가 아니면 닉네임 페이지로 리다이렉트
          if (!location.startsWith('/auth/nickname') && !location.startsWith('/auth/complete-registration')) {
            window.history.replaceState({}, document.title, `/auth/nickname?token=${token}&user=${encodeURIComponent(userStr)}`);
            navigate(`/auth/nickname?token=${token}&user=${encodeURIComponent(userStr)}`);
          }
          // 더 이상 진행하지 않음 (login 호출 방지)
          return;
        }
        
        // 온보딩 완료되었지만 school/country가 비어있는 경우 (백업 체크)
        const needsInfo = !user.school || !user.country || user.school === '' || user.country === '';
        
        if (needsInfo) {
          // Clear URL parameters and navigate to complete-registration
          window.history.replaceState({}, document.title, `/auth/complete-registration?token=${token}&user=${encodeURIComponent(userStr)}`);
          navigate(`/auth/complete-registration?token=${token}&user=${encodeURIComponent(userStr)}`);
          return;
        }
        
        // 모든 정보가 완료되었으면 로그인 후 메인 페이지로 이동
        login(token, user);
        
        // Clear URL parameters and navigate to home
        window.history.replaceState({}, document.title, '/');
        navigate('/');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "로그인 오류",
          description: "소셜 로그인 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  }, [login, toast, navigate, location]);

  return (
    <div className={isAdminPage ? "bg-gray-50 min-h-screen" : "max-w-md mx-auto bg-white min-h-screen relative"}>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/nickname" component={NicknamePage} />
          <Route path="/auth/complete-registration" component={CompleteRegistration} />
          
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchPage} />
          <Route path="/search/:query" component={SearchResults} />
          <Route path="/search/items/:query?" component={ItemsSearch} />
          <Route path="/search/community/:query?" component={CommunitySearch} />
          <Route path="/search/meetings/:query?" component={MeetingsSearch} />
          <Route path="/chat" component={Chat} />
          <Route path="/chat/:roomId" component={ChatRoom} />
          <Route path="/community" component={Community} />
          <Route path="/meetings/create" component={MeetingCreate} />
          <Route path="/meetings/:id/edit" component={MeetingEdit} />
          <Route path="/meetings/:id" component={MeetingDetail} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/community-create" component={CommunityCreate} />
          <Route path="/community/post/:id/edit" component={CommunityEdit} />
          <Route path="/community/post/:id" component={CommunityDetail} />
          <Route path="/community/create" component={CommunityCreate} />
          <Route path="/my/items" component={MyItems} />
          <Route path="/my/reviews" component={MyReviews} />
          <Route path="/my/posts" component={MyPosts} />
          <Route path="/my/commented" component={MyCommentedPosts} />
          <Route path="/my" component={MyPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/profile" component={Profile} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/items/create" component={CreateItem} />
          <Route path="/items/:id/edit" component={EditItem} />
          <Route path="/items/:id" component={ItemDetail} />
          <Route path="/admin" component={AdminLogin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      
      {!isAuthPage && !isItemDetailPage && !isSearchPage && !isProfilePage && !isNotificationsPage && !isAdminPage && <BottomNav />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize Amplitude as early as possible
    initAmplitude().catch(error => {
      console.error('Failed to initialize Amplitude:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WebSocketProvider>
            <Toaster />
            <Router />
          </WebSocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

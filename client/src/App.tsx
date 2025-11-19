import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { WebSocketProvider } from "./hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useEffect, lazy } from "react";
import { initAmplitude } from "./lib/amplitude";

import Home from "@/pages/home";
import Chat from "@/pages/chat";
import ChatRoom from "@/pages/chat-room";
import Community from "@/pages/community";
import Meetings from "@/pages/meetings";
import MyPage from "@/pages/my";
import Profile from "@/pages/profile";
import Login from "@/pages/auth/login";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import CompleteRegistration from "@/pages/auth/complete-registration";
import NicknamePage from "@/pages/auth/nickname";
import CreateItem from "@/pages/items/create";
import EditItem from "@/pages/items/edit";
import ItemDetail from "@/pages/items/detail";
import SearchPage from "@/pages/search";
import SearchResults from "@/pages/search-results";
import ItemsSearch from "@/pages/search/items";
import CommunitySearch from "@/pages/search/community";
import MeetingsSearch from "@/pages/search/meetings";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import CommunityCreate from "@/pages/community-create";
import MeetingCreate from "@/pages/meeting-create";
import MeetingEdit from "@/pages/meeting-edit";
import CommunityDetail from "@/pages/community-detail";
import MeetingDetail from "@/pages/meeting-detail";
import CommunityEdit from "@/pages/community-edit";
import NotificationsPage from "@/pages/notifications";
import MyItems from "@/pages/my/items";
import MyReviews from "@/pages/my/reviews";
import MyPosts from "@/pages/my/posts";
import MyCommentedPosts from "@/pages/my/commented";
import SettingsPage from "@/pages/settings";

import BottomNav from "@/components/layout/bottom-nav";

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

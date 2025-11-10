import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { WebSocketProvider } from "./hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useEffect, lazy } from "react";

import Home from "@/pages/home";
import Chat from "@/pages/chat";
import ChatRoom from "@/pages/chat-room";
import Community from "@/pages/community";
import Meetings from "@/pages/meetings";
import MyPage from "@/pages/my";
import Profile from "@/pages/profile";
import Login from "@/pages/auth/login";
import EmailLogin from "@/pages/auth/email-login";
import Register from "@/pages/auth/register";
import CompleteRegistration from "@/pages/auth/complete-registration";
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
import CommunityEdit from "@/pages/community-edit";
import NotificationsPage from "@/pages/notifications";
import MyItems from "@/pages/my/items";
import MyReviews from "@/pages/my/reviews";
import SettingsPage from "@/pages/settings";

import BottomNav from "@/components/layout/bottom-nav";

function Router() {
  const [location] = useLocation();
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
        
        // 추가 정보가 필요한지 우선 확인
        if (user.needsAdditionalInfo) {
          // 로그인하지 않고 complete-registration 페이지로 이동
          window.history.replaceState({}, document.title, '/auth/complete-registration');
          window.location.href = `/auth/complete-registration?token=${token}&user=${encodeURIComponent(userStr)}`;
          return;
        }
        
        // needsAdditionalInfo가 false이면 로그인 후 메인 페이지로 이동
        login(token, user);
        
        // 성공 팝업 제거 - 소셜 로그인 성공 시 toast 제거
        
        // Clear URL parameters and navigate to home
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = '/';
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "로그인 오류",
          description: "소셜 로그인 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  }, [login, toast]);

  return (
    <div className={isAdminPage ? "bg-gray-50 min-h-screen" : "max-w-md mx-auto bg-white min-h-screen relative"}>
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/email-login" component={EmailLogin} />
        <Route path="/auth/register" component={Register} />
        <Route path="/register" component={Register} />
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
        <Route path="/meetings" component={Meetings} />
        <Route path="/community-create" component={CommunityCreate} />
        <Route path="/community/post/:id/edit" component={CommunityEdit} />
        <Route path="/community/post/:id" component={CommunityDetail} />
        <Route path="/community/create" component={CommunityCreate} />
        <Route path="/meetings/create" component={MeetingCreate} />
        <Route path="/meetings/:id/edit" component={MeetingEdit} />
        <Route path="/my" component={MyPage} />
        <Route path="/my/items" component={MyItems} />
        <Route path="/my/reviews" component={MyReviews} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/items/create" component={CreateItem} />
        <Route path="/items/:id/edit" component={EditItem} />
        <Route path="/items/:id" component={ItemDetail} />
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
      
      {!isAuthPage && !isItemDetailPage && !isSearchPage && !isProfilePage && !isNotificationsPage && !isAdminPage && <BottomNav />}
    </div>
  );
}

function App() {
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

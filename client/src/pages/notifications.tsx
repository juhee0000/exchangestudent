import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // 링크가 있으면 해당 페이지로 이동
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString('ko-KR');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-900">알림</h1>
      </div>

      {/* 알림 목록 */}
      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
              data-testid={`notification-${notification.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      !notification.isRead ? 'bg-blue-500' : 'bg-transparent'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

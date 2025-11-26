import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Share, Eye, MapPin, Flag, MoreVertical, X, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useExchangeRates } from "@/hooks/use-exchange";
import { apiRequest } from "@/lib/queryClient";
import type { ItemWithSeller } from "@shared/schema";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/amplitude";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "방금 전";
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
  return `${Math.floor(diffInHours / 168)}주 전`;
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { rates } = useExchangeRates();
  const queryClient = useQueryClient();
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { toast } = useToast();

  const { data: item, isLoading } = useQuery<ItemWithSeller>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });

  // Image navigation functions
  const nextImage = useCallback(() => {
    if (!item?.images?.length) return;
    setCurrentImageIndex(prev => (prev + 1) % (item.images?.length || 1));
  }, [item?.images?.length]);

  const prevImage = useCallback(() => {
    if (!item?.images?.length) return;
    setCurrentImageIndex(prev => prev === 0 ? (item.images?.length || 1) - 1 : prev - 1);
  }, [item?.images?.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && (item?.images?.length || 0) > 1) {
      nextImage();
    }
    if (isRightSwipe && (item?.images?.length || 0) > 1) {
      prevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Helper function to get high resolution image URL
  const getHighResImageUrl = (imageUrl: string) => {
    if (imageUrl.includes('unsplash.com')) {
      // Remove size parameters for original size or use larger dimensions
      return imageUrl.split('?')[0] + '?w=1200&h=1200&fit=crop&q=80';
    }
    // For other image sources, return as-is (assuming they're already high-res)
    return imageUrl;
  };

  // Fullscreen handlers
  const openFullscreen = () => setShowFullscreen(true);
  const closeFullscreen = () => setShowFullscreen(false);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?.id]);

  // Track item view
  useEffect(() => {
    if (item) {
      trackEvent('Item Viewed', {
        item_id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency || 'KRW',
        status: getItemStatus(item),
        country: item.country,
        school: item.school,
        is_own_item: item.sellerId === user?.id,
      });
    }
  }, [item?.id]);

  // 상품 상태 확인
  const getItemStatus = (item: ItemWithSeller) => {
    if (item.status === "거래완료") return "거래완료";
    if (item.status === "기간만료") return "기간만료";
    
    // 거래 기간 만료 자동 확인
    if (item.availableTo) {
      const now = new Date();
      const availableTo = new Date(item.availableTo);
      if (now > availableTo) {
        return "기간만료";
      }
    }
    
    return "거래가능";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "거래완료":
        return "bg-gray-500 text-white";
      case "기간만료":
        return "bg-red-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const createChatRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/rooms", { itemId: id });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "채팅방 생성됨",
        description: "판매자와의 채팅방이 생성되었습니다."
      });
      navigate(`/chat/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Chat room creation error:", error);
      toast({
        title: "채팅방 생성 실패",
        description: "채팅방을 생성할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/items/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "상품 상태 변경됨",
        description: "상품 상태가 성공적으로 변경되었습니다."
      });
      // Invalidate item list for homepage and item detail
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items", id] });
    },
    onError: (error: any) => {
      console.error("Status update error:", error);
      toast({
        title: "상태 변경 실패",
        description: "상품 상태를 변경할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const reportItemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/items/${id}/report`, {
        reason: reportReason,
        description: reportDescription
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "신고가 접수되었습니다",
        description: "신고가 성공적으로 접수되었습니다. 검토 후 조치하겠습니다."
      });
      setShowReportDialog(false);
      setReportReason("");
      setReportDescription("");
    },
    onError: (error: any) => {
      console.error("Report error:", error);
      toast({
        title: "신고 접수 실패",
        description: "신고를 접수할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/items/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items", id] });
      toast({
        title: "상품이 삭제되었습니다",
        description: "상품이 성공적으로 삭제되었습니다."
      });
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({
        title: "상품 삭제 실패",
        description: "상품을 삭제할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const handleChatStart = () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    
    if (!item) return;
    
    // 자신의 상품인 경우 채팅을 시작할 수 없음
    if (item.sellerId === user.id) {
      toast({
        title: "알림",
        description: "자신의 상품에는 채팅을 시작할 수 없습니다.",
        variant: "destructive"
      });
      return;
    }
    
    createChatRoomMutation.mutate();
  };

  const handleReportSubmit = () => {
    if (!reportReason) {
      toast({
        title: "신고 사유 필요",
        description: "신고 사유를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    reportItemMutation.mutate();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: item?.title,
          text: item?.description,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "링크가 복사되었습니다",
          description: "링크를 공유해보세요!"
        });
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    deleteItemMutation.mutate();
  };

  const handleEdit = () => {
    try {
      console.log("🧩 Edit 버튼 클릭됨. id 값:", id);
      navigate(`/items/${id}/edit`);
    } catch (error) {
      console.error("🚨 handleEdit 실행 중 오류:", error);
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로
          </Button>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {user && user.id === item.sellerId ? (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      수정하기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share className="w-4 h-4 mr-2" />
                      공유하기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제하기
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="w-4 h-4 mr-2" />
                      신고하기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share className="w-4 h-4 mr-2" />
                      공유하기
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Image Gallery */}
        <div 
          className="relative bg-white cursor-pointer flex items-center justify-center"
          style={{ height: '320px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={openFullscreen}
        >
          <img
            src={item.images[currentImageIndex] || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
            alt={`${item.title} - ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ imageRendering: 'auto' }}
          />
          {item.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {item.images.length}
            </div>
          )}
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Item Info */}
          <Card className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                {user && user.id === item.sellerId ? (
                  <Select 
                    value={getItemStatus(item)} 
                    onValueChange={(value) => updateItemStatusMutation.mutate(value)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="거래가능">거래가능</SelectItem>
                      <SelectItem value="거래완료">거래완료</SelectItem>
                      <SelectItem value="기간만료">기간만료</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusBadgeColor(getItemStatus(item))}>
                    {getItemStatus(item)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {item.views}
                </span>
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <p className="text-3xl font-bold text-primary mb-3">
              {(() => {
                const currency = (item as any).currency || 'KRW';
                const price = parseFloat(item.price);
                
                if (currency === 'KRW') {
                  return `₩${price.toLocaleString()}`;
                } else {
                  const rate = rates[currency] || 1;
                  const krwPrice = Math.round(price * rate);
                  const currencySymbols: Record<string, string> = {
                    'USD': '$', 'EUR': '€', 'JPY': '¥', 'CNY': '¥', 
                    'GBP': '£', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'Fr'
                  };
                  const symbol = currencySymbols[currency] || currency;
                  return `${symbol}${price.toLocaleString()}(₩${krwPrice.toLocaleString()})`;
                }
              })()}
            </p>
            
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{item.country}, {item.school}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(new Date(item.createdAt))}</span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">상품 설명</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="border-t pt-4 mt-4 text-sm">
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-500 w-28 flex-shrink-0">거래 가능 기간</span>
                <p className="font-medium">
                  {item.availableFrom && item.availableTo 
                    ? `${new Date(item.availableFrom).toLocaleDateString()} ~ ${new Date(item.availableTo).toLocaleDateString()}`
                    : '-'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Seller Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">판매자 정보</h3>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{item.seller?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium" data-testid="text-seller-username">
                  {item.seller?.status === 'deleted' ? '(탈퇴한 사용자)' : (item.seller?.username || '판매자')}
                </p>
                <p className="text-sm text-gray-600">{item.school}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button 
            size="lg"
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-full"
            onClick={() => {
              // ✅ 1️⃣ 비로그인 상태일 경우 로그인 페이지로 이동
              if (!user) {
                toast({
                  title: "로그인이 필요합니다",
                  description: "오픈채팅을 이용하려면 로그인해주세요.",
                  variant: "destructive"
                });
                navigate("/auth/login");
                return;
              }

              // ✅ 2️⃣ 로그인 상태일 때만 오픈채팅 링크로 이동
              if (item.openChatLink) {
                window.open(item.openChatLink, '_blank');
              } else {
                toast({
                  title: "오픈채팅 링크 없음",
                  description: "판매자가 오픈채팅 링크를 등록하지 않았습니다.",
                  variant: "destructive"
                });
              }
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            오픈채팅 하러가기
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 신고하기</DialogTitle>
            <DialogDescription>
              부적절한 상품을 신고해주세요. 신고된 내용은 검토 후 조치됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">신고 사유</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="신고 사유를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="부적절한 내용">부적절한 내용</SelectItem>
                  <SelectItem value="사기 의심">사기 의심</SelectItem>
                  <SelectItem value="스팸/광고">스팸/광고</SelectItem>
                  <SelectItem value="가격 조작">가격 조작</SelectItem>
                  <SelectItem value="중복 게시">중복 게시</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">상세 설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="신고 사유를 자세히 설명해주세요."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={reportItemMutation.isPending || !reportReason}
            >
              {reportItemMutation.isPending ? "신고 중..." : "신고하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            {(item?.images?.length || 0) > 1 && (
              <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white text-lg px-3 py-2 rounded-full">
                {currentImageIndex + 1} / {item?.images?.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {(item?.images?.length || 0) > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div 
              className="w-full h-full flex items-center justify-center p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={item?.images?.[currentImageIndex] ? getHighResImageUrl(item.images[currentImageIndex]) : "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"}
                alt={`${item?.title} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Eye, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useExchangeRates } from "@/hooks/use-exchange";
import type { Item } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  variant?: "default" | "grid"; // grid variant for search results
  onItemClick?: () => void;
}



const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "방금 전";
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
  return `${Math.floor(diffInHours / 168)}주 전`;
};


export default function ItemCard({ item, variant = "default", onItemClick }: ItemCardProps) {
  const [, navigate] = useLocation();
  const { rates } = useExchangeRates();
  
  // 가격 표시 (원화 환산 포함)
  const currency = (item as any).currency || 'KRW';
  const price = parseFloat(item.price);
  
  let displayPrice = '';
  if (currency === 'KRW') {
    displayPrice = `₩${price.toLocaleString()}`;
  } else {
    const rate = rates[currency] || 1;
    const krwPrice = Math.round(price * rate);
    const currencySymbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'JPY': '¥', 'CNY': '¥', 
      'GBP': '£', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'Fr'
    };
    const symbol = currencySymbols[currency] || currency;
    displayPrice = `${symbol}${price.toLocaleString()}(₩${krwPrice.toLocaleString()})`;
  }

  // 상품 상태 확인
  const getItemStatus = (item: Item) => {
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

  const itemStatus = getItemStatus(item);
  const isInactive = itemStatus !== "거래가능";

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

  const handleCardClick = () => {
    onItemClick?.();
    navigate(`/items/${item.id}`);
  };


  // Grid variant for search results
  if (variant === "grid") {
    return (
      <Card className={cn(
        "marketplace-card cursor-pointer hover:shadow-md transition-shadow"
      )} onClick={handleCardClick}>
        <div className="p-4">
          {/* 상단 이미지 */}
          <div className="relative mb-3">
            <img
              src={item.images[0] || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"}
              alt={item.title}
              className="w-full h-56 object-cover rounded-lg"
            />
          </div>

          {/* 하단 정보 */}
          <div className="flex flex-col h-full">
            {/* 제목 */}
            <h3 className="font-semibold text-gray-900 text-xs mb-2 line-clamp-2 leading-tight">{item.title}</h3>
            
            {/* 위치 정보 */}
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <MapPin className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
              <span className="text-primary font-medium text-xs">
                {item.school ? `${item.country}, ${item.school}` : item.country}
              </span>
            </div>
            
            {/* 상태 배지가 없을 때: 가격을 위치 정보 아래에 */}
            {itemStatus === "거래가능" && (
              <p className="text-base font-bold text-gray-900 mb-2">{displayPrice}</p>
            )}
            
            {/* 상태 배지가 있을 때: 배지만 표시 */}
            {itemStatus !== "거래가능" && (
              <div className="mb-2">
                <Badge className={cn(
                  "text-xs px-2 py-0.5",
                  getStatusBadgeColor(itemStatus)
                )}>
                  {itemStatus}
                </Badge>
              </div>
            )}
            
            {/* 상태 배지가 있을 때: 가격을 아래에 */}
            {itemStatus !== "거래가능" && (
              <p className="text-base font-bold text-gray-900 mb-2">{displayPrice}</p>
            )}
            
            {/* 메타 정보 - 오른쪽 아래에 고정 */}
            <div className="flex items-center justify-end space-x-2 text-gray-500 text-xs mt-auto">
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {item.views}
              </span>
              <span>{formatTimeAgo(new Date(item.createdAt || new Date()))}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant for home page
  return (
    <div className="px-4 mb-3">
      <Card className={cn(
        "marketplace-card cursor-pointer hover:shadow-md transition-shadow"
      )} onClick={handleCardClick}>
        <div className="p-4">
          <div className="flex space-x-4">
            {/* 왼쪽 이미지 */}
            <div className="relative flex-shrink-0">
              <img
                src={item.images[0] || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"}
                alt={item.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>

            {/* 오른쪽 정보 */}
            <div className="flex-1 min-w-0 flex flex-col h-32">
              {/* 제목 */}
              <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.title}</h3>
              
              {/* 위치 정보 */}
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <MapPin className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                <span className="truncate text-xs">
                  {item.school ? `${item.country}, ${item.school}` : item.country}
                </span>
              </div>
              
              {/* 상태 배지가 없을 때: 가격을 위치 정보 아래에 */}
              {itemStatus === "거래가능" && (
                <p className="text-base font-bold text-gray-900 mb-2">{displayPrice}</p>
              )}
              
              {/* 상태 배지가 있을 때: 배지만 표시 */}
              {itemStatus !== "거래가능" && (
                <div className="mb-2">
                  <Badge className={cn(
                    "text-xs px-2 py-0.5",
                    getStatusBadgeColor(itemStatus)
                  )}>
                    {itemStatus}
                  </Badge>
                </div>
              )}
              
              {/* 상태 배지가 있을 때: 가격을 아래에 */}
              {itemStatus !== "거래가능" && (
                <p className="text-base font-bold text-gray-900 mb-2">{displayPrice}</p>
              )}
              
              {/* 하단 메타 정보 - 오른쪽 아래에 고정 */}
              <div className="flex items-center justify-end space-x-2 text-gray-500 text-xs mt-auto">
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {item.views}
                </span>
                <span>{formatTimeAgo(new Date(item.createdAt))}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

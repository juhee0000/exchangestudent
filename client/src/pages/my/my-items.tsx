import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ItemCard from "@/components/items/item-card";
import { useEffect } from "react";
import type { Item } from "@shared/schema";

export default function MyItemsPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/auth/login";
    }
  }, [user]);

  const { data: items, isLoading, isError, error } = useQuery<Item[], Error>({
    queryKey: ["/api/users/items"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/users/items", {
        headers,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="내 판매 글 관리" showSearch={false} showNotifications={true} />
      
      <main className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 px-6">
            <p className="text-red-600 mb-4">
              판매 중인 물품을 불러오는데 실패했습니다.
            </p>
            <p className="text-sm text-gray-500">
              {error?.message || "다시 시도해주세요."}
            </p>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-600 mb-4">
              판매 중인 물품이 없습니다.
            </p>
            <p className="text-sm text-gray-500">
              첫 번째 물품을 등록해보세요!
            </p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
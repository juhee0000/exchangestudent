import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import FilterBar from "@/components/items/filter-bar";
import ItemCard from "@/components/items/item-card";
import type { Item } from "@shared/schema";
import { trackEvent } from "@/lib/amplitude";

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showSchoolPrompt, setShowSchoolPrompt] = useState(false);

  // 국가별 필터 선택 시 사용자 국가를 디폴트로 설정
  useEffect(() => {
    if (filter === "country") {
      if (user?.country) {
        setSelectedCountry(user.country);
      } else {
        setSelectedCountry("all");
      }
    }
  }, [filter, user?.country]);

  // Track search events
  useEffect(() => {
    if (searchKeyword.trim()) {
      const timer = setTimeout(() => {
        trackEvent('Item Search', {
          search_query: searchKeyword,
          filter_type: filter,
          country: filter === 'country' ? selectedCountry : undefined,
          school: filter === 'school' ? user?.school : undefined,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [searchKeyword, filter, selectedCountry, user?.school]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["/api/items", filter, user?.school, selectedCountry, searchKeyword],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (filter === "school" && user?.school) params.append("school", user.school);
      if (filter === "country" && selectedCountry !== "all") params.append("country", selectedCountry);
      if (searchKeyword.trim()) params.append("search", searchKeyword.trim());
      params.append("page", pageParam.toString());
      params.append("limit", "10");
      
      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    // Keep previous data while fetching to prevent flicker
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2분 동안 캐시 데이터 유지
  });

  // Flatten pages and deduplicate items by ID to prevent key conflicts
  const allItems = data?.pages.flat().reduce((acc: Item[], item: Item) => {
    if (!acc.some(existingItem => existingItem.id === item.id)) {
      acc.push(item);
    }
    return acc;
  }, []) || [];

  // Client-side filtering for "거래가능" (available items only)
  const items = onlyAvailable 
    ? allItems.filter((item: Item) => item.status === '거래가능')
    : allItems;

  // 스크롤 위치 저장 및 복원
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('homeScrollPosition');
      }, 100);
    }
  }, []);

  // 스크롤 위치 저장
  const saveScrollPosition = () => {
    sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
  };

  // Infinite scroll implementation
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCreatePost = () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    navigate("/items/create");
  };

  const handleFilterChange = (newFilter: string) => {
    // "내 학교" 필터 클릭 시 로직
    if (newFilter === "school") {
      if (!user) {
        // 로그인 전: 로그인 페이지로 이동
        navigate("/auth/login");
        return;
      } else if (!user.school) {
        // 로그인 후 학교명 없음: 프롬프트 표시
        setShowSchoolPrompt(true);
        return;
      }
    }
    
    // Track filter change
    trackEvent('Filter Changed', {
      filter_type: newFilter,
      previous_filter: filter,
      country: newFilter === 'country' ? selectedCountry : undefined,
      school: newFilter === 'school' ? user?.school : undefined,
    });
    
    setFilter(newFilter);
    setShowSchoolPrompt(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">상품을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900 mb-3">교환링크</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg"
            data-testid="input-search"
          />
        </div>
      </header>
      <FilterBar 
        filter={filter} 
        onFilterChange={handleFilterChange}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        onlyAvailable={onlyAvailable}
        onToggleAvailable={setOnlyAvailable}
        user={user}
      />
      
      <main className="pb-20 pt-4">
        {showSchoolPrompt ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-700 text-lg mb-6">
              학교명을 입력하고<br />
              내 학교 물품들만 편하게 보세요!
            </p>
            <Button 
              onClick={() => navigate("/my")} 
              className="marketplace-button-primary"
            >
              학교명 입력하러 가기
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 상품이 없습니다</p>
            <Button onClick={handleCreatePost} className="marketplace-button-primary">
              첫 번째 상품 등록하기
            </Button>
          </div>
        ) : (
          <>
            {items.map((item: Item) => (
              <ItemCard
                key={item.id}
                item={item}
                onItemClick={saveScrollPosition}
              />
            ))}
            
            {/* Loading indicator at bottom */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">상품을 불러오고 있습니다...</span>
              </div>
            )}
            
            {!hasNextPage && items.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>모든 상품을 확인했습니다</p>
              </div>
            )}
          </>
        )}
      </main>

      <Button 
        onClick={handleCreatePost}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

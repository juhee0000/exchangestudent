import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import FilterBar from "@/components/items/filter-bar";
import ItemCard from "@/components/items/item-card";
import SearchBar from "@/components/common/search-bar";
import type { Item } from "@shared/schema";

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchText, setSearchText] = useState("");
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["/api/items", filter, user?.school, selectedCountry, onlyAvailable, searchText],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (filter === "school" && user?.school) params.append("school", user.school);
      if (filter === "country" && selectedCountry !== "all") params.append("country", selectedCountry);
      if (onlyAvailable) params.append("onlyAvailable", "true");
      if (searchText.trim()) params.append("search", searchText.trim());
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
  });

  // Flatten pages and deduplicate items by ID to prevent key conflicts
  const items = data?.pages.flat().reduce((acc: Item[], item: Item) => {
    if (!acc.some(existingItem => existingItem.id === item.id)) {
      acc.push(item);
    }
    return acc;
  }, []) || [];

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
    <>
      <Header title="교환마켓" showSearch={false} />
      <FilterBar 
        filter={filter} 
        onFilterChange={handleFilterChange}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        onlyAvailable={onlyAvailable}
        onToggleAvailable={setOnlyAvailable}
        user={user}
      />
      <SearchBar 
        placeholder="상품을 검색하세요"
        onSearchChange={setSearchText}
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
        className="marketplace-floating-button"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Search, Loader2, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { CommunityPost } from "@shared/schema";

export default function CommunitySearch() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/search/community/:query?");
  const activeQuery = params?.query ? decodeURIComponent(params.query) : "";
  const [searchInput, setSearchInput] = useState(activeQuery);

  // Sync search input with route param
  useEffect(() => {
    setSearchInput(activeQuery);
  }, [activeQuery]);

  // Fetch search results based on route param only
  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "search", activeQuery],
    queryFn: async () => {
      if (!activeQuery.trim()) return [];
      const params = new URLSearchParams();
      params.append("category", "자유게시판");
      params.append("search", activeQuery.trim());
      
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/community/posts?${params}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to search posts");
      return response.json();
    },
    enabled: !!activeQuery.trim(),
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search/community/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return `${Math.floor(diffInHours / 168)}주 전`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 h-16">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/community")}
            className="text-gray-600 p-1"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="게시글을 검색하세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 w-full"
              autoFocus
              data-testid="input-search-community"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="text-primary hover:text-primary/80 px-3"
            data-testid="button-search-community-submit"
          >
            검색
          </Button>
        </div>
      </header>

      {/* Search query display */}
      {activeQuery.trim() && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-600">
            '<span className="font-medium text-gray-900">{activeQuery}</span>' 검색 결과
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm mt-4">검색 중...</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm">검색 중 오류가 발생했습니다.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
            data-testid="button-retry"
          >
            다시 시도
          </Button>
        </div>
      )}

      {/* Results */}
      {!isLoading && !isError && activeQuery.trim() && (
        <>
          {posts.length > 0 ? (
            <>
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-sm text-gray-600">
                  총 {posts.length}개의 게시글
                </p>
              </div>
              <div className="pb-20">
                {posts.map((post) => (
                  <Card 
                    key={post.id}
                    className="mx-4 mb-3 p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary"
                    onClick={() => navigate(`/community/post/${post.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-base line-clamp-2 flex-1">{post.title}</h3>
                    </div>
                    
                    {post.content && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                    )}

                    {post.images && post.images.length > 0 && (
                      <div className="mb-3">
                        <img 
                          src={post.images[0]} 
                          alt={post.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          <span>{post.commentsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>
              <p className="text-gray-400 text-xs mt-1">
                다른 검색어로 시도해보세요
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state when no search input */}
      {!activeQuery.trim() && !isLoading && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">검색어를 입력하세요</p>
          <p className="text-gray-400 text-xs mt-1">게시글을 찾아보세요</p>
        </div>
      )}
    </div>
  );
}

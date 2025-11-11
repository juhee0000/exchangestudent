import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Search, Loader2, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { CommunityPost } from "@shared/schema";

export default function MeetingsSearch() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/search/meetings/:query?");
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
    queryKey: ["/api/community/posts", "meetings-search", activeQuery],
    queryFn: async () => {
      if (!activeQuery.trim()) return [];
      const params = new URLSearchParams();
      params.append("category", "모임방");
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
      navigate(`/search/meetings/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCountryColor = (country: string) => {
    const colorMap: { [key: string]: string } = {
      "독일": "bg-red-200 text-red-800",
      "영국": "bg-green-200 text-green-800", 
      "미국": "bg-blue-200 text-blue-800",
      "일본": "bg-orange-200 text-orange-800",
      "중국": "bg-purple-200 text-purple-800",
      "한국": "bg-pink-200 text-pink-800",
      "프랑스": "bg-indigo-200 text-indigo-800",
      "스페인": "bg-yellow-200 text-yellow-800",
    };
    return colorMap[country] || "bg-gray-200 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 h-16">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meetings")}
            className="text-gray-600 p-1"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="모임을 검색하세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 w-full"
              autoFocus
              data-testid="input-search-meetings"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="text-primary hover:text-primary/80 px-3"
            data-testid="button-search-meetings-submit"
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
                  총 {posts.length}개의 모임
                </p>
              </div>
              <div className="pb-20 px-4">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {posts.map((post) => (
                    <Card 
                      key={post.id}
                      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                      onClick={() => navigate(`/meetings/${post.id}`)}
                      data-testid={`card-meeting-${post.id}`}
                    >
                      {post.images && post.images.length > 0 ? (
                        <div className="relative">
                          <img 
                            src={post.images[0]} 
                            alt={post.title}
                            className="w-full h-32 object-cover"
                          />
                          {post.country && (
                            <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${getCountryColor(post.country)}`}>
                              {post.country}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 h-32 flex items-center justify-center">
                          <Users className="h-12 w-12 text-primary/30" />
                          {post.country && (
                            <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${getCountryColor(post.country)}`}>
                              {post.country}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 h-10">
                          {post.title}
                        </h3>
                        
                        {post.semester && (
                          <p className="text-xs text-gray-500 mb-2">
                            {post.semester}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium truncate">{post.school}</span>
                          <div className="flex items-center ml-2">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
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
          <p className="text-gray-400 text-xs mt-1">모임을 찾아보세요</p>
        </div>
      )}
    </div>
  );
}

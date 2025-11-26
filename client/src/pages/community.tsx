import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MessageSquare, Search, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { CommunityPost } from "@shared/schema";
import { COUNTRIES } from "@/lib/countries";

export default function Community() {
  const [selectedCountry, setSelectedCountry] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading, isFetching } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "자유게시판", selectedCountry, searchKeyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("category", "자유게시판");
      if (selectedCountry !== "전체") {
        params.append("country", selectedCountry);
      }
      if (searchKeyword.trim()) {
        params.append("search", searchKeyword.trim());
      }
      
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/community/posts?${params}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2분 동안 캐시 데이터 유지
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return `${Math.floor(diffInHours / 168)}주 전`;
  };

  const handleCreatePost = () => {
    navigate("/community/create?category=자유게시판");
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">자유게시판</h1>
        </div>
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

      <div className="px-4 py-3 bg-white border-b overflow-hidden">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide -mr-4 pr-8">
          <button
            onClick={() => setSelectedCountry("전체")}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCountry === "전체" 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-700"
            }`}
          >
            전체
          </button>
          {COUNTRIES.slice(0, 10).map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCountry === country 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {country}
            </button>
          ))}
          <button
            onClick={() => setSelectedCountry("기타")}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCountry === "기타" 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-700"
            }`}
          >
            기타
          </button>
        </div>
      </div>

      <main className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              아직 자유게시판에 게시글이 없습니다
            </p>
            <Button onClick={handleCreatePost} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="button-create-first">
              첫 번째 게시글 작성하기
            </Button>
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  onClick={() => navigate(`/community/post/${post.id}`)}
                  className="p-4 bg-white cursor-pointer hover:bg-gray-50"
                  data-testid={`card-story-${post.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">{post.title}</h3>
                    {post.images && post.images.length > 0 && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg ml-3 flex-shrink-0">
                        <img 
                          src={post.images[0]} 
                          alt="Post image" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.commentsCount || 0}</span>
                      
                      <span>{formatTimeAgo(new Date(post.createdAt))}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{post.views || 0}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button 
        onClick={handleCreatePost}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MessageSquare, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { CommunityPost } from "@shared/schema";
import { COUNTRIES } from "@/lib/countries";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function Meetings() {
  const [selectedCountry, setSelectedCountry] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading, isFetching } = useQuery<CommunityPost[]>({
    queryKey: ["/api/meeting/posts", selectedCountry, searchKeyword],
    queryFn: async () => {
      const params = new URLSearchParams();
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
      
      const response = await fetch(`/api/meeting/posts?${params}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const handleCreatePost = () => {
    navigate("/meetings/create");
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  const formatTimeAgo = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const timeAgo = formatDistanceToNow(dateObj, { 
        addSuffix: true,
        locale: ko 
      });
      return timeAgo.replace('약 ', '');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">모임방</h1>
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
            data-testid="filter-전체"
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
              data-testid={`filter-${country}`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      <main className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              아직 모임방에 게시글이 없습니다
            </p>
            <Button onClick={handleCreatePost} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="button-create-first">
              첫 번째 게시글 작성하기
            </Button>
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  onClick={() => navigate(`/meetings/${post.id}`)}
                  className={`cursor-pointer hover:shadow-md transition-shadow relative ${post.country && post.country !== '' ? getCountryColor(post.country) : 'bg-gray-100'}`}
                  data-testid={`card-meeting-${post.id}`}
                >
                  <div className="p-4">
                    {post.country && post.country !== '' && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-80">
                        {post.country}
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 text-xs text-gray-600">
                      {formatTimeAgo(post.createdAt)}
                    </div>

                    <div className="mt-8 mb-2">
                      <h3 className="font-semibold text-base mb-2 line-clamp-1">{post.title}</h3>
                      <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Button 
        onClick={handleCreatePost}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg z-50"
        data-testid="button-create-post"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

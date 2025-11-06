import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MessageSquare, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { CommunityPost } from "@shared/schema";
import { COUNTRIES } from "@/lib/countries";

export default function Meetings() {
  const [selectedCountry, setSelectedCountry] = useState("전체");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "모임방", selectedCountry],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("category", "모임방");
      if (selectedCountry !== "전체") {
        params.append("country", selectedCountry);
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
  });

  const handleCreatePost = () => {
    navigate("/community/create?category=모임방");
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 h-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">모임방</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary" data-testid="button-search">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-2 overflow-x-auto">
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
                  onClick={() => navigate(`/community/post/${post.id}`)}
                  className={`cursor-pointer hover:shadow-md transition-shadow relative ${getCountryColor(post.country)}`}
                  data-testid={`card-meeting-${post.id}`}
                >
                  <div className="p-4">
                    <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-80">
                      {post.country}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.commentsCount || 0}</span>
                    </div>

                    <div className="mt-8 mb-2">
                      <div className="text-sm font-medium mb-1">{post.semester || "25-2"}</div>
                      <div className="text-sm text-gray-700 mb-1">{post.school}</div>
                      <h3 className="font-semibold text-sm">{post.title}</h3>
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

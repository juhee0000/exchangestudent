import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, ExternalLink, Send, MoreVertical, Edit, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Comment } from "@shared/schema";

export default function CommunityDetail() {
  const [, params] = useRoute("/community/post/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const postId = params?.id;
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["/api/community/posts", postId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/community/posts/${postId}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch post");
      return response.json();
    },
    enabled: !!postId, // 모든 사용자가 글을 볼 수 있도록 함
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/community/posts", postId, "comments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          // 로그인이 필요한 경우
          return [];
        }
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
    enabled: !!postId, // 글이 있으면 댓글도 시도해보되, 실패하면 빈 배열
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/community/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId] });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 작성 실패", 
        description: error.message || "댓글을 작성하는데 실패했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        title: "댓글 내용을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    createCommentMutation.mutate(commentText.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
          <Button onClick={() => navigate("/community")}>커뮤니티로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const getCountryColor = (country: string) => {
    const colors: Record<string, string> = {
      "대한민국": "bg-red-100 text-red-800 border-red-200",
      "일본": "bg-blue-100 text-blue-800 border-blue-200", 
      "중국": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "미국": "bg-purple-100 text-purple-800 border-purple-200",
      "캐나다": "bg-green-100 text-green-800 border-green-200",
      "호주": "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[country] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const isAuthor = user?.id === post.authorId;

  const handleShare = async () => {
    const url = `${window.location.origin}/community/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100),
          url: url,
        });
        toast({
          title: "공유 완료",
          description: "게시글이 공유되었습니다.",
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast({
            title: "공유 실패",
            description: "공유하는데 실패했습니다.",
            variant: "destructive"
          });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "링크 복사 완료",
          description: "링크가 클립보드에 복사되었습니다.",
        });
      } catch {
        toast({
          title: "복사 실패",
          description: "링크를 복사하는데 실패했습니다.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/community?tab=${post.category}`)}
              className="p-2 absolute left-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {post.category}
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor && (
                <DropdownMenuItem onClick={() => navigate(`/community/post/${postId}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  수정하기
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                URL 공유하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Post Header */}
        <div className="mb-4">
          {/* Country Tag */}
          <div className="mb-3">
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCountryColor(post.country)}`}>
              {post.country}
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h1>
          
          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {post.category === "모임방" && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">모임</span>
                </div>
              )}
              {post.semester && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {post.semester}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
          </div>
        </div>


        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Open Chat Link for 모임방 */}
        {post.category === "모임방" && post.openChatLink && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 mb-1">오픈 카톡방</h3>
                <p className="text-sm text-blue-700">아래 링크를 클릭하여 참여하세요</p>
              </div>
              <Button
                onClick={() => window.open(post.openChatLink, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                참여하기
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-end py-4">
          <div className="text-sm text-gray-500">
            조회 {post.views || 0}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            댓글 {comments.length}개
          </h3>
          
          {/* Comment List */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {comment.authorFullName?.charAt(0)?.toUpperCase() || comment.authorUsername?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {comment.authorFullName || comment.authorUsername || '알 수 없음'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>아직 댓글이 없습니다</p>
              <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}

          {/* Comment Form */}
          {user ? (
            <div className="mt-6">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="flex-1">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="댓글을 입력해주세요"
                    className="min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={createCommentMutation.isPending}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || createCommentMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      {createCommentMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      댓글 작성
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">댓글을 보거나 작성하려면 로그인이 필요합니다</p>
              <Button 
                onClick={() => {
                  toast({
                    title: "로그인이 필요합니다",
                    description: "댓글 기능을 사용하려면 로그인해주세요",
                    variant: "destructive"
                  });
                  navigate("/auth/login");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                로그인하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
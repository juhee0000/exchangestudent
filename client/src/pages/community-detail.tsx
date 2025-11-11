import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, MoreVertical, Edit, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { Comment, CommunityPost } from "@shared/schema";

// Post 타입 정의
interface DetailedPost extends CommunityPost {}

export default function CommunityDetail() {
  const [, params] = useRoute("/community/post/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth(); // 항상 로그인 상태
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const postId = params?.id;
  const [commentText, setCommentText] = useState("");

  // 게시글 조회
  const { data: post, isLoading } = useQuery<DetailedPost>({
    queryKey: ["/api/community/posts", postId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/community/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("게시글을 불러오는데 실패했습니다");
      return response.json();
    },
    enabled: !!postId, 
  });

  // 댓글 조회
  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/community/posts", postId, "comments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("댓글을 불러오는데 실패했습니다");
      return response.json();
    },
    enabled: !!postId, 
  });

  // 댓글 작성
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => apiRequest('POST', `/api/community/posts/${postId}/comments`, { content }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId] });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 작성 실패",
        description: error.message || "댓글 작성 중 오류가 발생했습니다",
        variant: "destructive"
      });
    }
  });

  // 댓글 삭제
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => apiRequest('DELETE', `/api/community/comments/${commentId}`),
    onSuccess: () => {
      toast({ title: "댓글 삭제 완료", description: "댓글이 성공적으로 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId] });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 삭제 실패",
        description: error.message?.includes('403') ? "본인의 댓글만 삭제할 수 있습니다." : "댓글 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // 게시글 삭제
  const deletePostMutation = useMutation({
    mutationFn: async () => apiRequest('DELETE', `/api/community/posts/${postId}`),
    onSuccess: () => {
      toast({ title: "게시글 삭제 완료", description: "게시글이 삭제되었습니다." });
      navigate("/community");
    },
    onError: (error: any) => {
      toast({
        title: "게시글 삭제 실패",
        description: error.message?.includes('403') ? "작성자만 삭제할 수 있습니다." : "게시글 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast({ title: "댓글 내용을 입력해주세요", variant: "destructive" });
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  };

  const isAuthor = user?.id === post?.authorId;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/community/post/${postId}`);
      toast({ title: "URL 주소가 복사되었습니다" });
    } catch {
      toast({ title: "복사 실패", description: "URL을 복사하지 못했습니다", variant: "destructive" });
    }
  };

  const getCountryColor = (country: string) => {
    const colors: Record<string, string> = {
      "대한민국": "bg-red-100 text-red-800 border-red-200",
      "일본": "bg-blue-100 text-blue-800 border-blue-200",
      "중국": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "미국": "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[country] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">로딩중...</div>;
  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p>게시글을 찾을 수 없습니다</p>
      <Button onClick={() => navigate("/community")}>커뮤니티로 돌아가기</Button>
    </div>
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center relative">
            <Button variant="ghost" size="sm" className="absolute left-0" onClick={() => navigate("/community")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">{post.category}</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><MoreVertical /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/community/post/${postId}/edit`)}><Edit />수정하기</DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Trash2 />삭제하기</DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                        <AlertDialogDescription>게시글과 댓글이 모두 삭제됩니다.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePostMutation.mutate()} className="bg-red-500 hover:bg-red-600">삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <DropdownMenuItem onClick={handleShare}><Share2 />URL 공유하기</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Post Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCountryColor(post.country)}`}>
              {post.country}
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
          </div>
          <h1 className="text-xl font-bold mb-2">{post.title}</h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex justify-end py-4 text-sm text-gray-500">
          조회 {post.views || 0}
        </div>

        {/* Comments Section */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h3>

          {commentsLoading ? (
            <div className="text-center py-4 animate-spin">로딩중...</div>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => {
                const canDelete = user.id === comment.authorId;
                return (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {comment.authorFullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-gray-900">{comment.authorFullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}</span>
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6"><Trash2 /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                                <AlertDialogDescription>댓글이 삭제됩니다.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCommentMutation.mutate(comment.id)} className="bg-red-500 hover:bg-red-600">삭제</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Form */}
          <div className="mt-6 flex space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
              {user.fullName?.charAt(0)?.toUpperCase() || 'M'}
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
                  <Send className="w-4 h-4 mr-1" /> 댓글 작성
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
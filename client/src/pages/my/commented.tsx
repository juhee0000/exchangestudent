import { ArrowLeft, MessageSquare, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentWithPost {
  comment: {
    id: string;
    content: string;
    createdAt: string;
  };
  post: {
    id: string;
    title: string;
    content: string;
    category: string;
    images?: string[];
    views: number;
    commentsCount: number;
    createdAt: string;
  };
  postType: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "모임방":
      return "bg-blue-100 text-blue-800";
    case "자유게시판":
    case "이야기방":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function MyCommentedPosts() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useRequireAuth();

  const navigateToPost = (postId: string, postType: string, category: string) => {
    if (postType === "meeting" || category === "모임방") {
      sessionStorage.setItem('communityScrollPosition', window.scrollY.toString());
      navigate(`/meetings/${postId}`);
    } else {
      sessionStorage.setItem('communityScrollPosition', window.scrollY.toString());
      navigate(`/community/post/${postId}`);
    }
  };

  const { 
    data: comments = [], 
    isLoading,
    isError,
    refetch,
  } = useQuery<CommentWithPost[], Error>({
    queryKey: ["/api/comments/my"], 
    enabled: !!user,
  });

  if (isAuthLoading || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white p-4">
        <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/my")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">댓글 쓴 글</h1>
          </div>
        </header>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">댓글을 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => refetch()} variant="outline">다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">댓글 쓴 글</h1>
        </div>
      </header>

      <div className="p-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">댓글 단 글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((item) => (
              <div
                key={item.comment.id}
                onClick={() => navigateToPost(item.post.id, item.postType, item.post.category)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`comment-item-${item.comment.id}`}
              >
                <div className="flex space-x-3">
                  <div className="flex-1 min-w-0">
                    {/* 카테고리 배지 */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.post.category)}`}>
                        {item.post.category}
                      </span>
                    </div>

                    {/* 게시글 제목 */}
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2" data-testid={`post-title-${item.post.id}`}>
                      {item.post.title}
                    </h3>

                    {/* 내가 쓴 댓글 내용 */}
                    <div className="bg-gray-50 border-l-2 border-blue-500 pl-3 py-2 mb-2">
                      <p className="text-xs text-gray-500 mb-1">내가 쓴 댓글</p>
                      <p className="text-sm text-gray-700 line-clamp-2" data-testid={`comment-content-${item.comment.id}`}>
                        {item.comment.content}
                      </p>
                    </div>

                    {/* 하단 메타 정보 */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {item.post.views}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {item.post.commentsCount}
                      </span>
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(item.comment.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 이미지 썸네일 */}
                  {item.post.images && item.post.images.length > 0 && (
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.post.images[0]}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/d1d5db/4b5563?text=Image'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

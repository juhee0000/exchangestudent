import { ArrowLeft, MessageSquare, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { CommunityPost } from "@shared/schema";

// 카테고리별 색상 클래스를 반환하는 헬퍼 함수
const getCategoryColor = (category: string) => {
  switch (category) {
    case "모임방":
      // 기존의 파란색 계열 유지
      return "bg-blue-100 text-blue-800";
    case "자유게시판":
    case "이야기방":
      // 자유게시판 및 이야기방에 붉은색 계열 적용
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function MyCommentedPosts() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useRequireAuth();

  // 스크롤 위치 저장 함수
  const saveScrollPosition = (postId: string) => {
    sessionStorage.setItem('communityScrollPosition', window.scrollY.toString());
    navigate(`/community/post/${postId}`);
  };

  const { 
    data: posts = [], 
    isLoading: isPostsLoading,
    isError,
    refetch,
  } = useQuery<CommunityPost[], Error>({
    // 이 경로(queryKey)는 백엔드 routes.ts에 정의되어 있습니다.
    queryKey: ["/api/community/posts/commented"], 
    enabled: !!user,
  });

  if (isAuthLoading || !user) {
    return null; // 인증 로딩 중이거나 사용자가 없으면 렌더링하지 않음
  }

  if (isPostsLoading) {
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
          <p className="text-red-500 mb-4">게시글을 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => refetch()} variant="outline">다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
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

      {/* Content */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">댓글 단 글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => saveScrollPosition(post.id)} // 수정된 부분
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex space-x-3">
                  {/* 왼쪽: 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {/* 카테고리 색상 적용 */}
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.country && post.country !== "전체" && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {post.country}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {post.content}
                    </p>

                    {/* 하단 메타 정보 */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-3">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {post.views}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {post.commentsCount}
                      </span>
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 이미지 썸네일 */}
                  {post.images && post.images.length > 0 && (
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={post.images[0]}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover"
                        // 로딩 오류 시 대체 이미지
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
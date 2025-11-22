// client/src/pages/my/posts.tsx (수정된 전체 내용)

import { ArrowLeft, MessageSquare, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { CommunityPost, Item } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

// 카테고리별 색상 클래스를 반환하는 헬퍼 함수
const getCategoryColor = (category: string) => {
  switch (category) {
    case "모임방":
      return "bg-blue-100 text-blue-800";
    case "자유게시판":
    case "이야기방":
      return "bg-red-100 text-red-800";
    case "물품 판매":
    case "물품": // Item이 "물품"으로 인식될 경우를 대비하여 회색으로 통일 (이전 요청)
      return "bg-gray-200 text-gray-800"; 
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 통합된 게시글 타입
type UnifiedPost = (CommunityPost | Item) & {
  postType: "community" | "item";
};


export default function MyPosts() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useRequireAuth();

  // 스크롤 위치 저장 및 네비게이션 함수
  const navigateToCommunityPost = (postId: string, category: string) => {
    sessionStorage.setItem('communityScrollPosition', window.scrollY.toString());
    if (category === "모임방") {
      navigate(`/meetings/${postId}`);
    } else {
      navigate(`/community/post/${postId}`);
    }
  };

  // 커뮤니티 글 가져오기 (자유게시판)
  const { 
    data: communityPosts = [], 
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useQuery<CommunityPost[], Error>({
    queryKey: ["/api/community/posts/my"],
    enabled: !!user,
  });

  // 모임방 글 가져오기
  const { 
    data: meetingPosts = [], 
    isLoading: isMeetingLoading,
    isError: isMeetingError,
    refetch: refetchMeeting,
  } = useQuery<CommunityPost[], Error>({
    queryKey: ["/api/meeting/posts/my"],
    enabled: !!user,
  });

  // 물품 판매 글 가져오기
  const { 
    data: items = [], 
    isLoading: isItemsLoading,
    isError: isItemsError,
    refetch: refetchItems,
  } = useQuery<Item[], Error>({
    queryKey: ["/api/users/items"],
    enabled: !!user,
  });

  // 세 종류의 글을 하나로 합치기
  const allPosts: UnifiedPost[] = [
    ...communityPosts.map(post => ({ ...post, postType: "community" as const })),
    ...meetingPosts.map(post => ({ ...post, postType: "community" as const })),
    ...items.map(item => ({ ...item, postType: "item" as const }))
  ].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // 최신순 정렬
  });

  const isLoading = isPostsLoading || isMeetingLoading || isItemsLoading;
  const isError = isPostsError || isMeetingError || isItemsError;
  const refetch = () => {
    refetchPosts();
    refetchMeeting();
    refetchItems();
  };

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
             <h1 className="text-lg font-semibold text-gray-900">내가 쓴 글</h1>
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
    <div className="min-h-screen bg-gray-50 pb-20">
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
          <h1 className="text-lg font-semibold text-gray-900">내가 쓴 글</h1>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {allPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">작성한 글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allPosts.map((post) => {
              const isCommunityPost = post.postType === "community";
              const communityPost = isCommunityPost ? (post as CommunityPost) : null;
              const itemPost = !isCommunityPost ? (post as Item) : null;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    if (isCommunityPost) {
                      navigateToCommunityPost(post.id, communityPost!.category);
                    } else {
                      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
                      navigate(`/items/${post.id}`);
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex space-x-3">
                    {/* 왼쪽: 콘텐츠 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {/* 타입 배지 */}
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(isCommunityPost ? communityPost!.category : "물품 판매")}`}>
                          {isCommunityPost ? communityPost!.category : "물품 판매"}
                        </span>
                        {/* 국가 배지 (삭제됨) */}
                        {/* {isCommunityPost && communityPost!.country && communityPost!.country !== "전체" && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                            {communityPost!.country}
                          </span>
                        )} */}
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {post.title}
                      </h3>
                      {/* 물품 글인 경우 가격 표시, 커뮤니티 글인 경우 내용 표시 */}
                      {isCommunityPost ? (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {communityPost!.content}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(Number(itemPost!.price), itemPost!.currency || 'KRW')}
                        </p>
                      )}

                      {/* 하단 메타 정보 */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-3">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views || 0}
                        </span>
                        {isCommunityPost && (
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {communityPost!.commentsCount || 0}
                          </span>
                        )}
                        <span className="ml-auto">
                          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          }) : '날짜 없음'}
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
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/d1d5db/4b5563?text=Image'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
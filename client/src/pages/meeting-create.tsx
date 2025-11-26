import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertCommunityPostSchema } from "@shared/schema";
import { z } from "zod";
import { trackEvent } from "@/lib/amplitude";

const createMeetingPostSchema = insertCommunityPostSchema.omit({
  id: true,
  authorId: true,
  views: true,
  commentsCount: true,
  createdAt: true,
}).extend({
  country: z.string().optional(),
  images: z.array(z.string()).max(5, "최대 5장까지만 업로드할 수 있습니다").optional(),
  semester: z.string().optional(),
  openChatLink: z.string({
      required_error: "오픈채팅 주소는 필수 입력 항목입니다.",
    }).min(1, "오픈채팅 주소를 입력해주세요."),
});

type CreateMeetingPostForm = z.infer<typeof createMeetingPostSchema>;

export default function MeetingCreate() {
  const [, navigate] = useLocation();
  const { user } = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateMeetingPostForm>({
    resolver: zodResolver(createMeetingPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "모임방",
      country: "전체",
      school: user?.school || "",
      images: [],
      semester: "",
      openChatLink: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreateMeetingPostForm) => {
      const postData = {
        title: data.title,
        content: data.content,
        category: "모임방",
        country: data.country || "",
        school: data.school || user!.school,
        images: [],
        semester: data.semester,
        openChatLink: data.openChatLink,
      };
      
      const response = await apiRequest("POST", "/api/meeting/posts", postData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting/posts"] });
      
      trackEvent('Meeting Post Created', {
        title: data.title,
        category: '모임방',
        country: data.country,
        school: data.school,
        semester: data.semester,
        has_open_chat: !!data.openChatLink,
      });
      
      navigate("/meetings");
    },
    onError: (error: any) => {
      let errorMessage = "게시글을 작성하는데 실패했습니다.";
      
      if (error.message) {
        if (error.message.includes("401")) {
          errorMessage = "로그인이 만료되었습니다. 다시 로그인해주세요.";
        } else if (error.message.includes("403")) {
          errorMessage = "권한이 없습니다. 다시 로그인해주세요.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "게시글 작성 실패",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateMeetingPostForm) => {
    if (!data.title?.trim()) {
      toast({
        title: "제목을 입력해주세요",
        description: "제목은 필수 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.content?.trim()) {
      toast({
        title: "내용을 입력해주세요", 
        description: "내용은 필수 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/meetings")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">모임방 만들기</h1>
          </div>
          
          <Button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const formData = form.getValues();
              const isValid = await form.trigger();
              
              if (isValid) {
                onSubmit(formData);
              } else {
                toast({
                  title: "입력 오류",
                  description: "필수 항목을 모두 입력해주세요.",
                  variant: "destructive"
                });
              }
            }}
            disabled={createPostMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
          >
            {createPostMutation.isPending ? "작성중..." : "완료"}
          </Button>
        </div>
      </header>

      {/* Form */}
      <div className="p-4 pb-20">
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-6"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-base font-normal ${form.formState.errors.title ? 'text-red-600' : 'text-gray-900'}`}>모임 이름</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ex)26-2 000대학교 준비방"
                      {...field} 
                      className="text-sm bg-gray-50 border-gray-300 placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country Selection (Optional) */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal text-gray-900">어느 국가와 관련된 모임인가요?(선택)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "전체"}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-300">
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="미국">미국</SelectItem>
                      <SelectItem value="독일">독일</SelectItem>
                      <SelectItem value="스페인">스페인</SelectItem>
                      <SelectItem value="프랑스">프랑스</SelectItem>
                      <SelectItem value="영국">영국</SelectItem>
                      <SelectItem value="호주">호주</SelectItem>
                      <SelectItem value="일본">일본</SelectItem>
                      <SelectItem value="중국">중국</SelectItem>
                      <SelectItem value="이탈리아">이탈리아</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-base font-normal ${form.formState.errors.content ? 'text-red-600' : 'text-gray-900'}`}>간단한 설명</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ex)000 대학교로 교환가시는 분들 같이 준비해요!"
                      className="min-h-[200px] text-sm resize-none bg-gray-50 border-gray-300 placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Open Chat Link */}
            <FormField
              control={form.control}
              name="openChatLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-base font-normal ${form.formState.errors.openChatLink ? 'text-red-600' : 'text-gray-900'}`}>오픈채팅 주소</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://open.kakao.com/o/..."
                      {...field} 
                      className="text-sm bg-gray-50 border-gray-300 placeholder:text-gray-400"
                      data-testid="input-openchat-link"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">모임방으로 이용할 오픈채팅방 링크를 입력하세요</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}

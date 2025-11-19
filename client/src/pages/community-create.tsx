import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, X, Image as ImageIcon } from "lucide-react";
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

const createPostSchema = insertCommunityPostSchema.omit({
  id: true,
  authorId: true,
  views: true,
  commentsCount: true,
  createdAt: true,
}).extend({
  images: z.array(z.string()).max(5, "최대 5장까지만 업로드할 수 있습니다").optional(),
  semester: z.string().optional(),
  openChatLink: z.string().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CommunityCreate() {
  const [, navigate] = useLocation();
  const { user } = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "자유게시판",
      country: "전체",
      school: user?.school || "",
      images: [],
      semester: "",
      openChatLink: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const postData = {
        title: data.title,
        content: data.content,
        category: "자유게시판",
        country: data.country || user!.country,
        school: data.school || user!.school,
        images: uploadedImages,
        semester: undefined,
        openChatLink: undefined,
      };
      
      const response = await apiRequest("POST", "/api/community/posts", postData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      
      trackEvent('Community Post Created', {
        title: data.title,
        category: '자유게시판',
        country: data.country,
        school: data.school,
        has_images: (uploadedImages?.length || 0) > 0,
        image_count: uploadedImages?.length || 0,
      });
      
      navigate("/community");
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

  const onSubmit = (data: CreatePostForm) => {
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

    if (!data.country?.trim()) {
      toast({
        title: "국가를 선택해주세요",
        description: "국가는 필수 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.5): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        let currentQuality = quality;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        let sizeInBytes = (compressedDataUrl.length * 3) / 4;
        
        while (sizeInBytes > 200 * 1024 && currentQuality > 0.05) {
          currentQuality *= 0.7;
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          sizeInBytes = (compressedDataUrl.length * 3) / 4;
        }
        
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "이미지 업로드 제한",
        description: "최대 5장까지만 업로드할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          toast({
            title: "이미지 처리 중",
            description: "고화질 이미지를 압축하고 있습니다...",
          });
          
          const compressedImage = await compressImage(file);
          setUploadedImages(prev => [...prev, compressedImage]);
          
          toast({
            title: "이미지 추가 완료",
            description: "이미지가 성공적으로 추가되었습니다.",
          });
        } catch (error) {
          console.error('Error compressing image:', error);
          toast({
            title: "이미지 처리 실패",
            description: "이미지를 처리하는데 실패했습니다.",
            variant: "destructive"
          });
        }
      }
    }
    
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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
              onClick={() => navigate("/community")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">자유게시판 글 쓰기</h1>
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
            {/* Country Selection */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-base font-normal ${form.formState.errors.country ? 'text-red-600' : 'text-gray-700'}`}>어느 국가와 관련된 내용인가요?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="국가를 선택하세요" />
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

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-base font-normal ${form.formState.errors.title ? 'text-red-600' : 'text-gray-700'}`}>제목</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="제목을 입력하세요"
                      {...field} 
                      className="text-base border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-400"
                    />
                  </FormControl>
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
                  <FormLabel className={`text-base font-normal ${form.formState.errors.content ? 'text-red-600' : 'text-gray-700'}`}>내용</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="내용을 입력하세요"
                      className="min-h-[250px] text-sm resize-none border-0 px-0 focus-visible:ring-0"
                      {...field} 
                    />
                  </FormControl>
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

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertInquiry } from "@shared/schema";

export default function Contact() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const submitInquiryMutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      return apiRequest('POST', '/api/inquiries', data);
    },
    onSuccess: () => {
      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 답변드리겠습니다.",
      });
      setSubject("");
      setContent("");
      navigate("/settings");
    },
    onError: (error: any) => {
      toast({
        title: "문의 접수 실패",
        description: error.message || "문의 접수에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const inquiryData: InsertInquiry = {
      userId: user?.id || null,
      email: user?.email || "",
      subject: subject.trim(),
      content: content.trim(),
      status: "pending",
    };

    submitInquiryMutation.mutate(inquiryData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className="text-gray-600 absolute left-0"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로
          </Button>
          <h1 className="text-lg font-semibold">문의하기</h1>
        </div>
      </header>

      <main className="pb-20 pt-6 px-4">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  이메일
                </label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="문의 제목을 입력하세요"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={submitInquiryMutation.isPending}
                  data-testid="input-subject"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  내용 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="문의 내용을 상세히 입력해주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  disabled={submitInquiryMutation.isPending}
                  data-testid="textarea-content"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={submitInquiryMutation.isPending || !subject.trim() || !content.trim()}
                data-testid="button-submit"
              >
                {submitInquiryMutation.isPending ? "제출 중..." : "완료"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

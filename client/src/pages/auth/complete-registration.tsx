import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES } from "@/lib/countries";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 학교명 약칭 → 정식명칭 매핑
const SCHOOL_NAME_MAPPING: Record<string, string> = {
  "서울대": "서울대학교",
  "연세대": "연세대학교",
  "고려대": "고려대학교",
  "성균관대": "성균관대학교",
  "경희대": "경희대학교",
  "중앙대": "중앙대학교",
  "한양대": "한양대학교",
  "이화여대": "이화여자대학교",
  "홍익대": "홍익대학교",
  "건국대": "건국대학교",
  "동국대": "동국대학교",
  "국민대": "국민대학교",
  "숙명여대": "숙명여자대학교",
  "서강대": "서강대학교",
  "카이스트": "한국과학기술원",
  "KAIST": "한국과학기술원",
  "포스텍": "포항공과대학교",
  "POSTECH": "포항공과대학교",
  "도쿄대": "도쿄대학교",
  "교토대": "교토대학교",
  "와세다대": "와세다대학교",
  "게이오대": "게이오대학교",
  "베이징대": "베이징대학교",
  "칭화대": "칭화대학교"
};

// 학교명 정규화 함수
const normalizeSchoolName = (input: string): string => {
  if (!input) return "";
  
  // 1. 띄어쓰기와 특수문자 제거
  let normalized = input.replace(/[\s\-_.,;:!?()[\]{}'"]/g, "");
  
  // 2. 약칭 → 정식명칭 변환 (대소문자 구분 없이)
  const upperNormalized = normalized.toUpperCase();
  for (const [key, value] of Object.entries(SCHOOL_NAME_MAPPING)) {
    if (key.toUpperCase() === upperNormalized || key === normalized) {
      normalized = value;
      break;
    }
  }
  
  // 3. 한글만 남기기 (정규화 후에는 한글만 저장)
  normalized = normalized.replace(/[^가-힣]/g, "");
  
  return normalized;
};

// 대학교 입력 단계별 스키마
const schoolSchema = z.object({
  school: z.string().min(1, "학교명을 입력해주세요"),
});

// 국가 선택 단계별 스키마  
const countrySchema = z.object({
  country: z.string().min(1, "국가를 선택해주세요"),
});

type RegisterStep = 'school' | 'country';

interface FormData {
  school?: string;
  country?: string;
}

export default function CompleteRegistration() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('country');
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const [schoolInput, setSchoolInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 자주 입력된 학교명 조회
  const { data: popularSchools = [] } = useQuery<string[]>({
    queryKey: ['/api/schools/popular'],
    enabled: currentStep === 'school',
  });

  const stepOrder: RegisterStep[] = ['country', 'school'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const isLastStep = currentStepIndex === stepOrder.length - 1;

  // 각 단계별 폼 설정
  const schoolForm = useForm({
    resolver: zodResolver(schoolSchema),
    defaultValues: { school: formData.school || "" },
    mode: "onChange"
  });

  const countryForm = useForm({
    resolver: zodResolver(countrySchema),
    defaultValues: { country: formData.country || "" },
    mode: "onChange"
  });

  // 단계별 폼 초기화
  useEffect(() => {
    switch (currentStep) {
      case 'school':
        schoolForm.reset({ school: formData.school || "" });
        break;
      case 'country':
        countryForm.reset({ country: formData.country || "" });
        break;
    }
  }, [currentStep]);

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        login(token, userData);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth/login');
      }
    } else if (!user) {
      // If no OAuth data and no existing user, redirect to login
      navigate('/auth/login');
    }
  }, [login, navigate, user]);

  const handleNext = async (data: any) => {
    // 현재 단계 데이터만 저장
    const newData = { ...formData };
    
    switch (currentStep) {
      case 'school':
        newData.school = data.school;
        break;
      case 'country':
        newData.country = data.country;
        break;
    }
    
    setFormData(newData);
    
    if (isLastStep) {
      await handleSubmit(newData);
    } else {
      setCurrentStep(stepOrder[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    } else {
      navigate('/auth/login');
    }
  };

  const handleSubmit = async (finalFormData?: Partial<FormData>) => {
    if (!user) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const submitData = finalFormData || formData;
    
    // 학교명 정규화 처리
    const normalizedSchool = submitData.school ? normalizeSchoolName(submitData.school) : "";
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/complete-oauth-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          school: normalizedSchool,
          country: submitData.country || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '회원가입 완료에 실패했습니다.');
      }

      const updatedUser = await response.json();
      
      // Update user in auth context
      login(localStorage.getItem('token')!, updatedUser.user);
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "회원가입 완료 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 자동완성 필터링
  const getFilteredSuggestions = () => {
    if (!schoolInput || !popularSchools) return [];
    return popularSchools.filter(school => 
      school.includes(schoolInput) || schoolInput.includes(school.substring(0, 2))
    ).slice(0, 5);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'school': return '해외 교환학교 선택';
      case 'country': return '국가 선택';
      default: return '';
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 'school': return '학교/대학교';
      case 'country': return '거주 국가';
      default: return '';
    }
  };

  const getStepPlaceholder = () => {
    switch (currentStep) {
      case 'school': return '예: 서울대학교, Seoul National University';
      case 'country': return '국가를 선택하세요';
      default: return '';
    }
  };

  const getCurrentForm = () => {
    switch (currentStep) {
      case 'school':
        const filteredSuggestions = getFilteredSuggestions();
        return (
          <Form {...schoolForm}>
            <form onSubmit={schoolForm.handleSubmit(handleNext)} className="space-y-8">
              <FormField
                control={schoolForm.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-500 font-medium">{getStepLabel()}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={getStepPlaceholder()}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            setSchoolInput(value);
                            setShowSuggestions(value.length > 0);
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          onFocus={() => {
                            if (schoolInput.length > 0) setShowSuggestions(true);
                          }}
                          className="border-2 border-blue-200 rounded-xl p-4 text-base focus:border-blue-500 focus:ring-0"
                          data-testid="input-school"
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                            {filteredSuggestions.map((school, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  field.onChange(school);
                                  setSchoolInput(school);
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                              >
                                {school}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      한글명으로 작성해주세요
                    </p>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );

      case 'country':
        return (
          <Form {...countryForm}>
            <form onSubmit={countryForm.handleSubmit(handleNext)} className="space-y-8">
              <FormField
                control={countryForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-500 font-medium">{getStepLabel()}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-blue-200 rounded-xl p-4 text-base focus:border-blue-500 focus:ring-0">
                          <SelectValue placeholder={getStepPlaceholder()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-medium text-gray-700">{getStepTitle()}</h1>
        <div className="w-8"></div>
      </div>

      {/* 진행률 표시 */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">{currentStepIndex + 1}/{stepOrder.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            환영합니다, {user.fullName}님!
          </h2>
          {currentStep === 'country' && (
            <p className="text-gray-600">
              어느 나라로 교환학생을 가시나요?
            </p>
          )}
          {currentStep === 'school' && (
            <p className="text-gray-600">
              학교를 입력하면, 같은 학교 교환학생들이 올린 물품을 쉽게 확인할 수 있어요!
            </p>
          )}
        </div>

        {getCurrentForm()}

        {/* 버튼 영역 */}
        <div className="mt-8">
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => {
              const currentForm = currentStep === 'school' ? schoolForm : countryForm;
              currentForm.handleSubmit(handleNext)();
            }}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "처리 중..."
            ) : isLastStep ? (
              <>
                회원가입 완료
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
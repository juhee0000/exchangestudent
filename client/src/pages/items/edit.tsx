import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, Camera, Folder, X, Star, Move, CalendarIcon } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertItemSchema, type InsertItem, type Item } from "@shared/schema";
import { COUNTRIES, CURRENCIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { useExchangeRates } from "@/hooks/use-exchange";



const deliveryMethods = [
  "직거래",
  "택배",
  "대리전달",
  "기타",
];

const statusOptions = [
  "거래가능",
  "거래완료",
  "거래기간만료",
];

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [priceValue, setPriceValue] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("");
  const [customDeliveryMethod, setCustomDeliveryMethod] = useState("");
  const [itemStatus, setItemStatus] = useState("거래가능");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useRequireAuth();
  const { formatPrice } = useExchangeRates();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: item, isLoading: isLoadingItem } = useQuery<Item>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (item && user) {
      if (item.sellerId !== user.id) {
        toast({
          title: "권한 없음",
          description: "이 상품을 수정할 권한이 없습니다.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setImages(item.images || []);
      setPriceValue(item.price?.toString() || "");
      setItemStatus(item.status || "거래가능");
      setSelectedDeliveryMethod(item.deliveryMethod || "");
      setCustomDeliveryMethod(item.customDeliveryMethod || "");

      const currency = CURRENCIES.find(c => c.code === item.currency) || CURRENCIES[0];
      setSelectedCurrency(currency);
      
      form.reset({
        title: item.title || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        images: item.images || [],
        sellerId: item.sellerId,
        school: item.school || "",
        country: item.country || "",
        location: item.location || "",
        deliveryMethod: item.deliveryMethod || "",
        customDeliveryMethod: item.customDeliveryMethod || "",
        openChatLink: item.openChatLink || "",
        availableFrom: item.availableFrom ? new Date(item.availableFrom) : undefined,
        availableTo: item.availableTo ? new Date(item.availableTo) : undefined,
        status: item.status || "거래가능",
        isAvailable: item.isAvailable ?? true,
        currency: currency.code,
      });
    }
  }, [item, user, navigate, toast]);

  const convertedPrice = priceValue && selectedCurrency ? formatPrice(parseFloat(priceValue), selectedCurrency.code) : "";

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      images: [],
      sellerId: user?.id || "",
      school: user?.school || "",
      country: user?.country || "",
      location: user?.school || "",
      deliveryMethod: "",
      customDeliveryMethod: "",
      openChatLink: "",
      availableFrom: undefined,
      availableTo: undefined,
      status: "거래가능",
      isAvailable: true,
    },
  });

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

  const handleImageUpload = async (files: FileList | null, isCamera: boolean = false) => {
    if (!files) return;
    
    setIsLoading(true);
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const compressedImage = await compressImage(file);
          setImages(prev => [...prev, compressedImage]);
          const currentImages = form.getValues('images') || [];
          form.setValue('images', [...currentImages, compressedImage]);
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
    
    setIsLoading(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue('images', newImages);
  };

  const makePrimaryImage = (index: number) => {
    const newImages = [...images];
    const primaryImage = newImages.splice(index, 1)[0];
    newImages.unshift(primaryImage);
    setImages(newImages);
    form.setValue('images', newImages);
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    form.setValue('images', newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    if (priceValue && selectedCurrency) {
      form.setValue('price', priceValue);
      form.setValue('currency', selectedCurrency.code);
    } else {
      form.setValue('price', '');
    }
  }, [priceValue, selectedCurrency, form]);

  const updateItemMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
      }
      const res = await apiRequest("PUT", `/api/items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/items"], 
        exact: false 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users/stats"]
      });
      
      toast({
        title: "상품 수정 완료",
        description: "성공적으로 수정되었습니다.",
      });
      
      navigate(`/items/${id}`);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (error.message.includes("401") || error.message.includes("Invalid token") || error.message.includes("Unauthorized")) {
        toast({
          title: "인증 오류",
          description: "로그인이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        navigate("/auth/login");
      } else {
        toast({
          variant: "destructive",
          title: "상품 수정 실패",
          description: error.message || "수정 중 오류가 발생했습니다.",
        });
      }
    },
  });

  const onSubmit = async (data: InsertItem) => {
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "사진을 업로드해주세요",
        description: "최소 1장의 사진이 필요합니다.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        sellerId: user?.id || data.sellerId,
        images,
        price: priceValue,
        school: user?.school || "",
        country: user?.country || "",
        location: data.location || user?.school || "",
        deliveryMethod: data.deliveryMethod || "",
        customDeliveryMethod: data.deliveryMethod === "기타" ? data.customDeliveryMethod : "",
        openChatLink: data.openChatLink || "",
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        availableTo: data.availableTo ? new Date(data.availableTo) : null,
        currency: selectedCurrency.code,
        status: itemStatus,
      };
      updateItemMutation.mutate(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (isLoadingItem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/items/${id}`)}
            className="text-gray-600 absolute left-0"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로
          </Button>
          <h1 className="text-lg font-semibold">내 물품 수정하기</h1>
        </div>
      </header>

      <main className="pb-20 pt-4 px-4">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                

                <div className="space-y-2">
                  <label className="text-sm font-medium">상품 사진 <span className="text-red-500">*</span></label>
                  
                  {images.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">사진을 업로드하세요</p>
                      <div className="flex gap-2 justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" data-testid="button-upload-image">
                              <Upload className="h-4 w-4 mr-2" />
                              사진 추가
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => cameraInputRef.current?.click()}>
                              <Camera className="h-4 w-4 mr-2" />
                              카메라로 촬영
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                              <Folder className="h-4 w-4 mr-2" />
                              폴더에서 선택
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">최대 10장까지 가능</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((image, index) => (
                          <div 
                            key={index} 
                            className={`relative group cursor-move transition-transform ${
                              draggedIndex === index ? 'scale-105 rotate-2 z-10' : 'hover:scale-102'
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <img
                              src={image}
                              alt={`상품 사진 ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg transition-all ${
                                draggedIndex === index ? 'opacity-60' : ''
                              }`}
                            />
                            
                            {index === 0 && (
                              <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0">
                                <Star className="h-3 w-3 mr-1" />
                                대표
                              </Badge>
                            )}
                            
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
                              <Move className="h-6 w-6 text-white" />
                            </div>
                            
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {index !== 0 && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 w-6 p-0 bg-white hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      makePrimaryImage(index);
                                    }}
                                    data-testid={`button-make-primary-${index}`}
                                  >
                                    <Star className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                  }}
                                  data-testid={`button-remove-image-${index}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {images.length < 10 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors" data-testid="button-add-more-images">
                                <Upload className="h-6 w-6 text-gray-400" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => cameraInputRef.current?.click()}>
                                <Camera className="h-4 w-4 mr-2" />
                                카메라로 촬영
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                <Folder className="h-4 w-4 mr-2" />
                                폴더에서 선택
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• 첫 번째 사진이 대표 사진으로 설정됩니다</p>
                        
                      
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files, true)}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제목 <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="상품 제목을 입력하세요" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명 <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="상품에 대한 자세한 설명을 입력하세요"
                          rows={4}
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">가격 <span className="text-red-500">*</span></label>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedCurrency.code}
                      onValueChange={(value) => {
                        const currency = CURRENCIES.find(c => c.code === value);
                        if (currency) setSelectedCurrency(currency);
                      }}
                    >
                      <SelectTrigger className="w-32" data-testid="select-currency">
                        <SelectValue>
                          {selectedCurrency.symbol} {selectedCurrency.code}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.code}</span>
                              <span className="text-xs text-gray-500">{currency.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="0"
                      type="number"
                      step="0.01"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      className="flex-1"
                      data-testid="input-price"
                    />
                  </div>
                  
                  {selectedCurrency.code !== "KRW" && (
                    <>
                      <div className="flex gap-2">
                        <div className="w-32 flex items-center justify-center bg-gray-100 rounded-md px-3 py-2">
                          <span className="text-sm font-medium text-gray-600">₩ KRW</span>
                        </div>
                        <Input
                          placeholder="0"
                          type="text"
                          value={priceValue ? formatPrice(parseFloat(priceValue), selectedCurrency.code) : ""}
                          readOnly
                          className="flex-1 bg-gray-50 text-gray-600"
                        />
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        원화로 자동 환산되어 보여집니다
                      </p>
                    </>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>해당 국가 <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="거래할 국가를 선택하세요" />
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

                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>해당 학교</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="학교를 입력하세요"
                          {...field} 
                          data-testid="input-school"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>거래 희망 장소</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="거래를 희망하는 장소를 입력하세요"
                          {...field} 
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>거래 방법</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDeliveryMethod(value);
                          if (value !== "기타") {
                            setCustomDeliveryMethod("");
                            form.setValue("customDeliveryMethod", "");
                          }
                        }} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-delivery-method">
                            <SelectValue placeholder="거래 방법을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deliveryMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedDeliveryMethod === "기타" && (
                  <FormField
                    control={form.control}
                    name="customDeliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>기타 거래 방법 상세</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="기타 거래 방법을 입력하세요"
                            {...field}
                            value={customDeliveryMethod || ""}
                            onChange={(e) => {
                              setCustomDeliveryMethod(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            data-testid="input-custom-delivery"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="openChatLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>오픈채팅 링크 <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="오픈채팅 링크를 입력하세요"
                          {...field}
                          data-testid="input-openchat-link"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <label className="text-sm font-medium">거래 가능 기간</label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal justify-start",
                            (!form.watch("availableFrom") && !form.watch("availableTo")) && "text-muted-foreground"
                          )}
                          data-testid="button-select-date-range"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {(() => {
                            const fromDate = form.watch("availableFrom");
                            const toDate = form.watch("availableTo");
                            
                            if (fromDate && toDate) {
                              return `${format(fromDate, "yyyy-MM-dd")} ~ ${format(toDate, "yyyy-MM-dd")}`;
                            } else if (fromDate) {
                              return `${format(fromDate, "yyyy-MM-dd")} ~ 종료일 선택`;
                            } else {
                              return "거래 가능 기간 선택";
                            }
                          })()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={form.watch("availableFrom") || new Date()}
                          selected={{
                            from: form.watch("availableFrom") || undefined,
                            to: form.watch("availableTo") || undefined
                          } as DateRange}
                          onSelect={(range: DateRange | undefined) => {
                            if (!range) {
                              form.setValue("availableFrom", undefined);
                              form.setValue("availableTo", undefined);
                              return;
                            }
                            
                            if (range.from) {
                              form.setValue("availableFrom", range.from);
                            }
                            
                            if (range.to) {
                              form.setValue("availableTo", range.to);
                              const popoverTrigger = document.querySelector('[data-state="open"]');
                              if (popoverTrigger) {
                                setTimeout(() => {
                                  (popoverTrigger as HTMLElement).click();
                                }, 100);
                              }
                            } else {
                              form.setValue("availableTo", undefined);
                            }
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          numberOfMonths={1}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-gray-500">
                    거래 가능 기간을 설정하지 않을 경우 계속 거래 가능한 상태로 유지됩니다.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full marketplace-button-primary"
                  disabled={isLoading || updateItemMutation.isPending}
                  data-testid="button-submit"
                >
                  {isLoading || updateItemMutation.isPending ? "수정 중..." : "수정 완료"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

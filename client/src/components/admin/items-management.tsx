import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Edit, Trash2, MoreHorizontal, Plus, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Item, User } from "@shared/schema";
import { COUNTRIES } from "@/lib/countries";

export default function ItemsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "EUR",
    category: "",
    condition: "중고",
    country: "",
    school: "",
    sellerId: "",
    openChatLink: "",
    availableFrom: "",
    availableTo: "",
    status: "거래가능",
  });

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/admin/items?${params}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "성공",
        description: "상품이 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({
        title: "성공",
        description: "상품이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({
        title: "성공",
        description: "상품이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      currency: "EUR",
      category: "",
      condition: "중고",
      country: "",
      school: "",
      sellerId: "",
      openChatLink: "",
      availableFrom: "",
      availableTo: "",
      status: "거래가능",
    });
    setUploadedImages([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          newImages.push(result.url);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setUploadedImages([...uploadedImages, ...newImages]);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleCreateItem = () => {
    if (!formData.title || !formData.sellerId) {
      toast({
        title: "오류",
        description: "제목과 판매자를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      ...formData,
      price: formData.price || "0",
      images: uploadedImages,
      availableFrom: formData.availableFrom || null,
      availableTo: formData.availableTo || null,
    });
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      price: item.price?.toString() || "",
      currency: item.currency || "EUR",
      category: item.category || "",
      condition: item.condition || "중고",
      country: item.country || "",
      school: item.school || "",
      sellerId: item.sellerId,
      openChatLink: item.openChatLink || "",
      availableFrom: item.availableFrom ? new Date(item.availableFrom).toISOString().split('T')[0] : "",
      availableTo: item.availableTo ? new Date(item.availableTo).toISOString().split('T')[0] : "",
      status: item.status || "거래가능",
    });
    setUploadedImages(item.images || []);
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    updateItemMutation.mutate({
      id: editingItem.id,
      data: {
        ...formData,
        price: formData.price || "0",
        images: uploadedImages,
        availableFrom: formData.availableFrom || null,
        availableTo: formData.availableTo || null,
      },
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "전자기기": "bg-blue-100 text-blue-800",
      "도서": "bg-green-100 text-green-800",
      "가구": "bg-purple-100 text-purple-800",
      "가전": "bg-orange-100 text-orange-800",
      "운동/레저": "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const ItemFormContent = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>상품 사진</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative w-20 h-20">
              <img src={url} alt={`상품 이미지 ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="상품 제목"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellerId">판매자 *</Label>
          <Select value={formData.sellerId} onValueChange={(value) => setFormData({ ...formData, sellerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="판매자 선택" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="상품 설명"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">가격</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">통화</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="KRW">KRW (₩)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="거래가능">거래가능</SelectItem>
              <SelectItem value="거래완료">거래완료</SelectItem>
              <SelectItem value="거래기간만료">거래기간만료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">국가</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">학교</Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            placeholder="학교명"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전자기기">전자기기</SelectItem>
              <SelectItem value="도서">도서</SelectItem>
              <SelectItem value="가구">가구</SelectItem>
              <SelectItem value="가전">가전</SelectItem>
              <SelectItem value="운동/레저">운동/레저</SelectItem>
              <SelectItem value="생활용품">생활용품</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">상품 상태</Label>
          <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="새상품">새상품</SelectItem>
              <SelectItem value="중고">중고</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="availableFrom">거래 시작일</Label>
          <Input
            id="availableFrom"
            type="date"
            value={formData.availableFrom}
            onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableTo">거래 종료일</Label>
          <Input
            id="availableTo"
            type="date"
            value={formData.availableTo}
            onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openChatLink">오픈채팅 링크</Label>
        <Input
          id="openChatLink"
          value={formData.openChatLink}
          onChange={(e) => setFormData({ ...formData, openChatLink: e.target.value })}
          placeholder="https://open.kakao.com/..."
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>상품 관리</CardTitle>
            <CardDescription>플랫폼에 등록된 모든 상품을 관리합니다</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            상품 등록
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="상품 제목, 설명, 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>판매자</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>조회수</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.images?.[0] || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-600 truncate max-w-[200px]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category || "")}>
                        {item.category || "미분류"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.currency === "EUR" ? "€" : item.currency === "USD" ? "$" : item.currency === "GBP" ? "£" : "₩"}
                      {parseFloat(item.price?.toString() || "0").toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.sellerId}</p>
                        <p className="text-xs text-gray-600">{item.school}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(item.createdAt?.toString() || new Date().toISOString())}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{item.views}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {items?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                등록된 상품이 없습니다
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 상품 등록</DialogTitle>
            <DialogDescription>관리자로서 새 상품을 직접 등록합니다.</DialogDescription>
          </DialogHeader>
          <ItemFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateItem} disabled={createItemMutation.isPending}>
              {createItemMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>상품 수정</DialogTitle>
            <DialogDescription>상품 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <ItemFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateItem} disabled={updateItemMutation.isPending}>
              {updateItemMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

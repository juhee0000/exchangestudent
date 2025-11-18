import { useLocation } from "wouter";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [, navigate] = useLocation();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          서비스 준비 중입니다 :)
        </h3>
        <Button 
          onClick={handleClose}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          data-testid="button-close-notifications"
        >
          <X className="w-4 h-4 mr-2" />
          닫기
        </Button>
      </div>
    </div>
  );
}

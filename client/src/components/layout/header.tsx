import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
}

export default function Header({ 
  title, 
  showSearch = true, 
  onSearchClick
}: HeaderProps) {
  const [, navigate] = useLocation();

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate("/search");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 h-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-primary"
              onClick={handleSearchClick}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

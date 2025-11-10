import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearchChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "검색어를 입력하세요",
  onSearchChange,
  open,
  onOpenChange,
  className = "",
}: SearchBarProps) {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = open !== undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, onSearchChange]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open && isControlled) {
      setSearchText("");
    }
  }, [open, isControlled]);

  const handleClear = () => {
    setSearchText("");
    onSearchChange("");
  };

  if (!open && isControlled) {
    return null;
  }

  return (
    <div className={`px-4 py-2 bg-white border-b ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10 pr-10"
          data-testid="input-search"
        />
        {searchText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export { SearchBar };

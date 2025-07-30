import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAreas } from "@/hooks/useAreas";

interface AreaSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearchChange?: (value: string) => void;
  searchTerm?: string;
}

interface AreaSuggestion {
  id: string;
  nome: string;
  descricao?: string;
  path: string;
}

export function AreaSearchBar({ 
  placeholder = "Buscar área...", 
  className = "",
  onSearchChange,
  searchTerm = ""
}: AreaSearchBarProps) {
  const [value, setValue] = useState(searchTerm);
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState<AreaSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { data: areas } = useAreas();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearchChange]);

  // Generate area suggestions
  const generateSuggestions = (): AreaSuggestion[] => {
    if (!areas) return [];
    
    return areas.map(area => ({
      id: area.id,
      nome: area.nome,
      descricao: area.descricao,
      path: `/areas/${area.id}`
    }));
  };

  useEffect(() => {
    if (debouncedValue.length >= 2) {
      const allSuggestions = generateSuggestions();
      const searchTerm = debouncedValue.toLowerCase();
      
      const filtered = allSuggestions.filter(area => {
        const nameMatch = area.nome.toLowerCase().includes(searchTerm);
        const descMatch = area.descricao?.toLowerCase().includes(searchTerm) || false;
        return nameMatch || descMatch;
      });
      
      setSuggestions(filtered.slice(0, 6)); // Limit to 6 suggestions
      setOpen(filtered.length > 0);
      
      console.log("🔍 Area search suggestions:", { 
        debouncedValue, 
        searchTerm,
        totalAreas: allSuggestions.length, 
        filteredAreas: filtered.length,
        suggestions: filtered.slice(0, 3)
      });
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedValue, areas]);

  const handleSelect = (suggestion: AreaSuggestion) => {
    setValue(suggestion.nome);
    setOpen(false);
    navigate(suggestion.path);
  };

  const handleSearch = () => {
    if (value.trim()) {
      setOpen(false);
      // Navigate to areas page with search term
      navigate(`/por-area?busca=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    if (debouncedValue.length >= 2 && suggestions.length > 0) {
      setOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="pl-10 pr-10 bg-muted/50 border-muted focus:bg-card transition-smooth"
              autoComplete="off"
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                  inputRef.current?.focus();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        {open && (
          <PopoverContent 
            className="w-[400px] p-0" 
            align="start"
            sideOffset={4}
          >
            <div className="max-h-[300px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors"
                      onClick={() => handleSelect(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">🏢</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {suggestion.nome}
                          </div>
                          {suggestion.descricao && (
                            <div className="text-sm text-muted-foreground truncate">
                              {suggestion.descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <p>Nenhuma área encontrada</p>
                  <p className="text-sm">Tente outro termo de busca</p>
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
} 
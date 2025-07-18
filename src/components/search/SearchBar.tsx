import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

interface SearchSuggestion {
  id: string;
  type: "produto" | "subprocesso" | "processo" | "area";
  title: string;
  subtitle: string;
  path: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function SearchBar({ 
  placeholder = "Buscar serviços, processos, áreas...", 
  className = "",
  showSuggestions = true 
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();

  // Mock suggestions - in real app, this would come from API
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: "1",
      type: "produto",
      title: "Abertura de Conta PJ",
      subtitle: "Onboarding > Recursos Humanos",
      path: "/servicos/1"
    },
    {
      id: "2", 
      type: "processo",
      title: "Onboarding",
      subtitle: "Recursos Humanos",
      path: "/areas/rh/processos/onboarding"
    },
    {
      id: "3",
      type: "area",
      title: "Recursos Humanos",
      subtitle: "23 serviços disponíveis",
      path: "/areas/rh"
    },
    {
      id: "4",
      type: "produto",
      title: "Processamento de Folha",
      subtitle: "Folha de Pagamento > Recursos Humanos",
      path: "/servicos/4"
    }
  ];

  useEffect(() => {
    if (value.length >= 2) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = mockSuggestions.filter(
          suggestion => 
            suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
            suggestion.subtitle.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setOpen(showSuggestions && filtered.length > 0);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [value, showSuggestions]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    setValue(suggestion.title);
    setOpen(false);
    navigate(suggestion.path);
  };

  const handleSearch = () => {
    if (value.trim()) {
      setOpen(false);
      navigate(`/servicos?busca=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "produto": return "📋";
      case "processo": return "⚙️";
      case "area": return "🏢";
      case "subprocesso": return "🔧";
      default: return "📄";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 bg-muted/50 border-muted focus:bg-card transition-smooth"
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setValue("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        {showSuggestions && (
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup heading="Sugestões">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      value={suggestion.title}
                      onSelect={() => handleSelect(suggestion)}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
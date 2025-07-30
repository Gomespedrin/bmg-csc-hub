import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";

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
  
  const { data: servicos } = useServicos();
  const { data: areas } = useAreas();

  // Generate suggestions from real data
  const generateSuggestions = (): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];

    // Add services
    if (servicos) {
      servicos.forEach(servico => {
        allSuggestions.push({
          id: servico.id,
          type: "produto",
          title: servico.produto,
          subtitle: `${servico.subprocesso.nome} > ${servico.subprocesso.processo.nome} > ${servico.subprocesso.processo.area.nome}`,
          path: `/servicos/${servico.id}`
        });
      });
    }

    // Add areas
    if (areas) {
      areas.forEach(area => {
        allSuggestions.push({
          id: area.id,
          type: "area",
          title: area.nome,
          subtitle: `${area.processos?.length || 0} processos disponíveis`,
          path: `/areas/${area.id}`
        });
      });
    }

    // Add processes from areas
    if (areas) {
      areas.forEach(area => {
        area.processos?.forEach(processo => {
          allSuggestions.push({
            id: processo.id,
            type: "processo",
            title: processo.nome,
            subtitle: area.nome,
            path: `/areas/${area.id}/processos/${processo.id}`
          });
        });
      });
    }

    // Add subprocesses from services
    if (servicos) {
      const uniqueSubprocesses = new Map();
      servicos.forEach(servico => {
        const key = servico.subprocesso.id;
        if (!uniqueSubprocesses.has(key)) {
          uniqueSubprocesses.set(key, {
            id: servico.subprocesso.id,
            type: "subprocesso" as const,
            title: servico.subprocesso.nome,
            subtitle: `${servico.subprocesso.processo.nome} > ${servico.subprocesso.processo.area.nome}`,
            path: `/processos/${servico.subprocesso.processo.id}/subprocessos/${servico.subprocesso.id}`
          });
        }
      });
      uniqueSubprocesses.forEach(subprocesso => {
        allSuggestions.push(subprocesso);
      });
    }

    return allSuggestions;
  };

  useEffect(() => {
    if (value.length >= 2) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        const allSuggestions = generateSuggestions();
        const filtered = allSuggestions.filter(
          suggestion => 
            suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
            suggestion.subtitle.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
        setOpen(showSuggestions && filtered.length > 0);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [value, showSuggestions, servicos, areas]);

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
                      value={suggestion.title || suggestion.id}
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
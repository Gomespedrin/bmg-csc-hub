import { useState, useEffect, useRef } from "react";
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
  onSearchChange?: (value: string) => void;
}

export function SearchBar({ 
  placeholder = "Buscar serviços, processos, áreas...", 
  className = "",
  showSuggestions = true,
  onSearchChange
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [debouncedValue, setDebouncedValue] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: servicosData } = useServicos();
  const { data: areas } = useAreas();

  // Debounce do valor de pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Notificar componente pai sobre mudança (apenas quando necessário)
  useEffect(() => {
    if (onSearchChange && debouncedValue !== value) {
      onSearchChange(debouncedValue);
    }
  }, [debouncedValue, onSearchChange]);

  // Generate suggestions from real data
  const generateSuggestions = (): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];

    try {
      // Add services
      const servicos = (servicosData as any)?.services || [];
      if (servicos.length > 0) {
        servicos.forEach((servico: any) => {
          // Verificar se o serviço tem a estrutura esperada
          if (servico && servico.subprocesso && servico.subprocesso.processo && servico.subprocesso.processo.area) {
            allSuggestions.push({
              id: servico.id,
              type: "produto",
              title: servico.produto,
              subtitle: `${servico.subprocesso.nome} > ${servico.subprocesso.processo.nome} > ${servico.subprocesso.processo.area.nome}`,
              path: `/servicos/${servico.id}`
            });
          }
        });
      }

      // Add areas
      if (areas && Array.isArray(areas)) {
        areas.forEach(area => {
          if (area && area.id && area.nome) {
            allSuggestions.push({
              id: area.id,
              type: "area",
              title: area.nome,
              subtitle: `${area.processos?.length || 0} processos disponíveis`,
              path: `/areas/${area.id}`
            });
          }
        });
      }

      // Add processes from areas
      if (areas && Array.isArray(areas)) {
        areas.forEach(area => {
          if (area && area.processos && Array.isArray(area.processos)) {
            area.processos.forEach(processo => {
              if (processo && processo.id && processo.nome) {
                allSuggestions.push({
                  id: processo.id,
                  type: "processo",
                  title: processo.nome,
                  subtitle: area.nome,
                  path: `/areas/${area.id}/processos/${processo.id}`
                });
              }
            });
          }
        });
      }

      // Add subprocesses from services
      if (servicos.length > 0) {
        const uniqueSubprocesses = new Map();
        servicos.forEach((servico: any) => {
          // Verificar se o serviço tem a estrutura esperada
          if (servico && servico.subprocesso && servico.subprocesso.processo && servico.subprocesso.processo.area) {
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
          }
        });
        uniqueSubprocesses.forEach(subprocesso => {
          allSuggestions.push(subprocesso);
        });
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões de busca:', error);
    }

    return allSuggestions;
  };

  useEffect(() => {
    if (debouncedValue.length >= 2) {
      const allSuggestions = generateSuggestions();
      const searchTerm = debouncedValue.toLowerCase();
      
      const filtered = allSuggestions.filter(suggestion => {
        const titleMatch = suggestion.title.toLowerCase().includes(searchTerm);
        const subtitleMatch = suggestion.subtitle.toLowerCase().includes(searchTerm);
        return titleMatch || subtitleMatch;
      });
      
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setOpen(showSuggestions && filtered.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedValue, showSuggestions, servicosData, areas]);

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
        
        {showSuggestions && open && (
          <PopoverContent 
            className="w-[400px] p-0" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
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
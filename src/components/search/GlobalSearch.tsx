import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useServicos } from "@/hooks/useServicos";
import { useAreas, useProcessos, useSubprocessos } from "@/hooks/useAreas";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: "servico" | "area" | "processo" | "subprocesso";
  title: string;
  subtitle: string;
  path: string;
  icon: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onSearchChange?: (value: string) => void;
}

export function GlobalSearch({ 
  placeholder = "Buscar serviços, processos, áreas...", 
  className = "",
  onSearchChange
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: servicosData } = useServicos();
  const { data: areas } = useAreas();
  const { data: processos } = useProcessos();
  const { data: subprocessos } = useSubprocessos();
  
  // Gerar resultados de busca
  const generateSearchResults = (): SearchResult[] => {
    const allResults: SearchResult[] = [];

    try {
      // Adicionar serviços
      const servicos = (servicosData as any)?.services || [];
      servicos.forEach((servico: any) => {
        if (servico && servico.produto) {
          allResults.push({
            id: servico.id,
            type: "servico",
            title: servico.produto,
            subtitle: servico.subprocesso?.nome || 'Serviço',
            path: `/servicos/${servico.id}`,
            icon: "📋"
          });
        }
      });

      // Adicionar áreas
      if (areas && Array.isArray(areas)) {
        areas.forEach(area => {
          if (area && area.id && area.nome) {
            allResults.push({
              id: area.id,
              type: "area",
              title: area.nome,
              subtitle: `${area.processos?.length || 0} processos disponíveis`,
              path: `/areas/${area.id}`,
              icon: "🏢"
            });
          }
        });
      }

      // Adicionar processos
      if (processos && Array.isArray(processos)) {
        processos.forEach(processo => {
          if (processo && processo.id && processo.nome && processo.area) {
            allResults.push({
              id: processo.id,
              type: "processo",
              title: processo.nome,
              subtitle: processo.area.nome,
              path: `/processos/${processo.id}`,
              icon: "⚙️"
            });
          }
        });
      }

      // Adicionar subprocessos
      if (subprocessos && Array.isArray(subprocessos)) {
        subprocessos.forEach(subprocesso => {
          if (subprocesso && subprocesso.id && subprocesso.nome && subprocesso.processo) {
            allResults.push({
              id: subprocesso.id,
              type: "subprocesso",
              title: subprocesso.nome,
              subtitle: `${subprocesso.processo.nome} > ${subprocesso.processo.area?.nome || ''}`,
              path: `/processos/${subprocesso.processo.id}/subprocessos/${subprocesso.id}`,
              icon: "🔧"
            });
          }
        });
      }
    } catch (error) {
      console.error('Erro ao gerar resultados de busca:', error);
    }

    return allResults;
  };

  // Filtrar resultados baseado no termo de busca
  useEffect(() => {
    if (value.length >= 2) {
      const allResults = generateSearchResults();
      const searchTerm = value.toLowerCase();
      
      const filtered = allResults.filter(result => {
        const titleMatch = result.title.toLowerCase().includes(searchTerm);
        const subtitleMatch = result.subtitle.toLowerCase().includes(searchTerm);
        return titleMatch || subtitleMatch;
      });
      
      setResults(filtered.slice(0, 10)); // Limitar a 10 resultados
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [value, servicosData, areas, processos, subprocessos]);

  const handleSelect = (result: SearchResult) => {
    setValue(result.title);
    setOpen(false);
    navigate(result.path);
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
    if (value.length >= 2 && results.length > 0) {
      setOpen(true);
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      'servico': 'default',
      'area': 'secondary',
      'processo': 'outline',
      'subprocesso': 'destructive'
    } as const;

    const labels = {
      'servico': 'Serviço',
      'area': 'Área',
      'processo': 'Processo',
      'subprocesso': 'Subprocesso'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'} className="text-xs">
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
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
            className="w-[500px] p-0" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tente buscar por serviços, áreas, processos ou subprocessos
                    </p>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Resultados da Busca">
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <span className="text-lg">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                      </div>
                      {getTypeBadge(result.type)}
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
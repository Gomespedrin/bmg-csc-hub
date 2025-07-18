import { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: {
    areas: string[];
    processos: string[];
    subprocessos: string[];
    produto: string;
    demandaRotina: string;
    status: string[];
  };
  onFiltersChange: (filters: any) => void;
  resultCount: number;
}

export function FilterPanel({ isOpen, onToggle, filters, onFiltersChange, resultCount }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["area", "status"]);

  const mockAreas = [
    "Recursos Humanos",
    "Tecnologia da Informação", 
    "Financeiro",
    "Jurídico",
    "Compliance",
    "Operações"
  ];

  const mockProcessos = [
    "Onboarding",
    "Folha de Pagamento",
    "Desenvolvimento de Sistemas",
    "Infraestrutura",
    "Contratos",
    "Auditoria"
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked 
      ? [...filters.areas, area]
      : filters.areas.filter(a => a !== area);
    
    onFiltersChange({
      ...filters,
      areas: newAreas,
      processos: [], // Reset dependent filters
      subprocessos: []
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatus
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      areas: [],
      processos: [],
      subprocessos: [],
      produto: "",
      demandaRotina: "",
      status: []
    });
  };

  const activeFiltersCount = 
    filters.areas.length + 
    filters.processos.length + 
    filters.subprocessos.length + 
    (filters.produto ? 1 : 0) + 
    (filters.demandaRotina ? 1 : 0) + 
    filters.status.length;

  return (
    <div className={`transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
      <Card className="h-fit sticky top-20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
              {isOpen && (
                <>
                  <CardTitle className="text-base">Filtros</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {isOpen && activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Limpar
              </Button>
            )}
          </div>
          {isOpen && (
            <div className="text-sm text-muted-foreground">
              {resultCount} resultado{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
            </div>
          )}
        </CardHeader>

        {isOpen && (
          <CardContent className="space-y-4">
            {/* Área */}
            <Collapsible 
              open={expandedSections.includes("area")}
              onOpenChange={() => toggleSection("area")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-8 px-0">
                  <span className="font-medium">Área</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {mockAreas.map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={filters.areas.includes(area)}
                      onCheckedChange={(checked) => handleAreaChange(area, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`area-${area}`} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {area}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Processo */}
            {filters.areas.length > 0 && (
              <Collapsible 
                open={expandedSections.includes("processo")}
                onOpenChange={() => toggleSection("processo")}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 px-0">
                    <span className="font-medium">Processo</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {mockProcessos.map(processo => (
                    <div key={processo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`processo-${processo}`}
                        checked={filters.processos.includes(processo)}
                        onCheckedChange={(checked) => {
                          const newProcessos = checked 
                            ? [...filters.processos, processo]
                            : filters.processos.filter(p => p !== processo);
                          onFiltersChange({ ...filters, processos: newProcessos, subprocessos: [] });
                        }}
                      />
                      <Label 
                        htmlFor={`processo-${processo}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {processo}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Produto */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Produto</Label>
              <Input
                placeholder="Nome exato do produto"
                value={filters.produto}
                onChange={(e) => onFiltersChange({ ...filters, produto: e.target.value })}
                className="h-8"
              />
            </div>

            {/* Demanda ou Rotina */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <Select 
                value={filters.demandaRotina} 
                onValueChange={(value) => onFiltersChange({ ...filters, demandaRotina: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Demanda ou Rotina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Demanda">Demanda</SelectItem>
                  <SelectItem value="Rotina">Rotina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <Collapsible 
              open={expandedSections.includes("status")}
              onOpenChange={() => toggleSection("status")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-8 px-0">
                  <span className="font-medium">Status</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {["Ativo", "Inativo"].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`status-${status}`} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
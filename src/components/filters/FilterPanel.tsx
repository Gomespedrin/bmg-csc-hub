import { useState, useEffect } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAreas, useProcessos, useSubprocessos } from "@/hooks/useAreas";

interface FilterPanelProps {
  filters: {
    areas: string[];
    processos: string[];
    subprocessos: string[];
    produto: string;
    demandaRotina: string;
    status: string[];
  };
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export function FilterPanel({ filters, onFiltersChange, className = "" }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["area"]);
  
  const { data: areas } = useAreas();
  const { data: processos } = useProcessos();
  const { data: subprocessos } = useSubprocessos();

  // Debug logging
  useEffect(() => {
    console.log('🏢 Available areas:', areas?.map(a => a.nome));
    console.log('⚙️ Available processos:', processos?.map(p => p.nome));
    console.log('🔧 Available subprocessos:', subprocessos?.map(s => s.nome));
  }, [areas, processos, subprocessos]);

  useEffect(() => {
    console.log('🔍 Current filters:', filters);
  }, [filters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    console.log(`🏢 Area filter changed: ${area} -> ${checked}`);
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

  const handleProcessoChange = (processo: string, checked: boolean) => {
    console.log(`⚙️ Processo filter changed: ${processo} -> ${checked}`);
    const newProcessos = checked 
      ? [...filters.processos, processo]
      : filters.processos.filter(p => p !== processo);
    
    onFiltersChange({
      ...filters,
      processos: newProcessos,
      subprocessos: [] // Reset dependent filters
    });
  };

  const handleSubprocessoChange = (subprocesso: string, checked: boolean) => {
    console.log(`🔧 Subprocesso filter changed: ${subprocesso} -> ${checked}`);
    const newSubprocessos = checked 
      ? [...filters.subprocessos, subprocesso]
      : filters.subprocessos.filter(s => s !== subprocesso);
    
    onFiltersChange({
      ...filters,
      subprocessos: newSubprocessos
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    console.log(`📊 Status filter changed: ${status} -> ${checked}`);
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatus
    });
  };

  const clearAllFilters = () => {
    console.log('🧹 Clearing all filters');
    onFiltersChange({
      areas: [],
      processos: [],
      subprocessos: [],
      produto: "",
      demandaRotina: "todos",
      status: []
    });
  };

  const activeFiltersCount = 
    filters.areas.length + 
    filters.processos.length + 
    filters.subprocessos.length + 
    (filters.produto ? 1 : 0) + 
    (filters.demandaRotina !== "todos" ? 1 : 0) + 
    filters.status.length;

  return (
    <Card className={`${className} shadow-lg border-0 bg-card/95 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Produto - Always visible */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Nome do Produto</Label>
          <Input
            placeholder="Buscar por nome..."
            value={filters.produto}
            onChange={(e) => onFiltersChange({ ...filters, produto: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* Demanda/Rotina - Always visible */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Tipo de Demanda</Label>
          <Select
            value={filters.demandaRotina}
            onValueChange={(value) => onFiltersChange({ ...filters, demandaRotina: value })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Demanda">Demanda</SelectItem>
              <SelectItem value="Rotina">Rotina</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Área */}
        <Collapsible open={expandedSections.includes("area")} onOpenChange={() => toggleSection("area")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="text-xs font-medium text-muted-foreground">Área</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.includes("area") ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-2">
            {areas?.slice(0, 5).map(area => (
              <div key={area.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area.id}`}
                  checked={filters.areas.includes(area.nome)}
                  onCheckedChange={(checked) => handleAreaChange(area.nome, checked as boolean)}
                  className="h-3 w-3"
                />
                <Label htmlFor={`area-${area.id}`} className="text-xs cursor-pointer">
                  {area.nome}
                </Label>
              </div>
            ))}
            {areas && areas.length > 5 && (
              <div className="text-xs text-muted-foreground pt-1">
                +{areas.length - 5} mais áreas
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Status */}
        <Collapsible open={expandedSections.includes("status")} onOpenChange={() => toggleSection("status")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.includes("status") ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-ativo"
                checked={filters.status.includes("ativo")}
                onCheckedChange={(checked) => handleStatusChange("ativo", checked as boolean)}
                className="h-3 w-3"
              />
              <Label htmlFor="status-ativo" className="text-xs cursor-pointer">
                Ativo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-inativo"
                checked={filters.status.includes("inativo")}
                onCheckedChange={(checked) => handleStatusChange("inativo", checked as boolean)}
                className="h-3 w-3"
              />
              <Label htmlFor="status-inativo" className="text-xs cursor-pointer">
                Inativo
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Processo - Only show if areas are selected */}
        {filters.areas.length > 0 && (
          <Collapsible open={expandedSections.includes("processo")} onOpenChange={() => toggleSection("processo")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-xs font-medium text-muted-foreground">Processo</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.includes("processo") ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2">
              {processos?.slice(0, 5).map(processo => (
                <div key={processo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`processo-${processo.id}`}
                    checked={filters.processos.includes(processo.nome)}
                    onCheckedChange={(checked) => handleProcessoChange(processo.nome, checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor={`processo-${processo.id}`} className="text-xs cursor-pointer">
                    {processo.nome}
                  </Label>
                </div>
              ))}
              {processos && processos.length > 5 && (
                <div className="text-xs text-muted-foreground pt-1">
                  +{processos.length - 5} mais processos
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Subprocesso - Only show if processos are selected */}
        {filters.processos.length > 0 && (
          <Collapsible open={expandedSections.includes("subprocesso")} onOpenChange={() => toggleSection("subprocesso")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-xs font-medium text-muted-foreground">Subprocesso</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.includes("subprocesso") ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2">
              {subprocessos?.slice(0, 5).map(subprocesso => (
                <div key={subprocesso.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subprocesso-${subprocesso.id}`}
                    checked={filters.subprocessos.includes(subprocesso.nome)}
                    onCheckedChange={(checked) => handleSubprocessoChange(subprocesso.nome, checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor={`subprocesso-${subprocesso.id}`} className="text-xs cursor-pointer">
                    {subprocesso.nome}
                  </Label>
                </div>
              ))}
              {subprocessos && subprocessos.length > 5 && (
                <div className="text-xs text-muted-foreground pt-1">
                  +{subprocessos.length - 5} mais subprocessos
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
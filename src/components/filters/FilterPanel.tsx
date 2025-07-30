import { useState, useEffect, useMemo } from "react";
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
  
  const { data: allAreas } = useAreas();
  const { data: allProcessos } = useProcessos();
  const { data: allSubprocessos } = useSubprocessos();

  // Filtrar processos baseado nas áreas selecionadas
  const availableProcessos = useMemo(() => {
    if (!allProcessos || filters.areas.length === 0) {
      return allProcessos || [];
    }
    
    return allProcessos.filter(processo => 
      filters.areas.includes(processo.area?.nome)
    );
  }, [allProcessos, filters.areas]);

  // Filtrar subprocessos baseado nos processos selecionados
  const availableSubprocessos = useMemo(() => {
    if (!allSubprocessos || filters.processos.length === 0) {
      return allSubprocessos || [];
    }
    
    return allSubprocessos.filter(subprocesso => 
      filters.processos.includes(subprocesso.processo?.nome)
    );
  }, [allSubprocessos, filters.processos]);

  // Debug logging
  useEffect(() => {
    console.log('🏢 Available areas:', allAreas?.map(a => a.nome));
    console.log('⚙️ Available processos (filtered):', availableProcessos?.map(p => p.nome));
    console.log('🔧 Available subprocessos (filtered):', availableSubprocessos?.map(s => s.nome));
  }, [allAreas, availableProcessos, availableSubprocessos]);

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
    
    // Se removemos uma área, também removemos processos e subprocessos dependentes
    let newProcessos = filters.processos;
    let newSubprocessos = filters.subprocessos;
    
    if (!checked) {
      // Encontrar processos que pertencem à área removida
      const processosToRemove = allProcessos?.filter(p => 
        p.area?.nome === area
      ).map(p => p.nome) || [];
      
      newProcessos = filters.processos.filter(p => !processosToRemove.includes(p));
      
      // Encontrar subprocessos que pertencem aos processos removidos
      const subprocessosToRemove = allSubprocessos?.filter(s => 
        processosToRemove.includes(s.processo?.nome)
      ).map(s => s.nome) || [];
      
      newSubprocessos = filters.subprocessos.filter(s => !subprocessosToRemove.includes(s));
    }
    
    onFiltersChange({
      ...filters,
      areas: newAreas,
      processos: newProcessos,
      subprocessos: newSubprocessos
    });
  };

  const handleProcessoChange = (processo: string, checked: boolean) => {
    console.log(`⚙️ Processo filter changed: ${processo} -> ${checked}`);
    const newProcessos = checked 
      ? [...filters.processos, processo]
      : filters.processos.filter(p => p !== processo);
    
    // Se removemos um processo, também removemos subprocessos dependentes
    let newSubprocessos = filters.subprocessos;
    
    if (!checked) {
      // Encontrar subprocessos que pertencem ao processo removido
      const subprocessosToRemove = allSubprocessos?.filter(s => 
        s.processo?.nome === processo
      ).map(s => s.nome) || [];
      
      newSubprocessos = filters.subprocessos.filter(s => !subprocessosToRemove.includes(s));
    }
    
    onFiltersChange({
      ...filters,
      processos: newProcessos,
      subprocessos: newSubprocessos
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
    <Card className={`${className} shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
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

      <CardContent className="space-y-4 pt-0">
        {/* Produto - Always visible */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Nome do Produto</Label>
          <Input
            placeholder="Buscar por nome..."
            value={filters.produto}
            onChange={(e) => onFiltersChange({ ...filters, produto: e.target.value })}
            className="h-8 text-sm bg-background/50"
          />
        </div>

        {/* Demanda/Rotina - Always visible */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Tipo de Demanda</Label>
          <Select
            value={filters.demandaRotina}
            onValueChange={(value) => onFiltersChange({ ...filters, demandaRotina: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background/50">
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
              <span className="text-xs font-medium text-muted-foreground">
                Área {filters.areas.length > 0 && `(${filters.areas.length})`}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform text-muted-foreground ${expandedSections.includes("area") ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div className="max-h-40 overflow-y-auto space-y-1">
              {allAreas?.map(area => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${area.id}`}
                    checked={filters.areas.includes(area.nome)}
                    onCheckedChange={(checked) => handleAreaChange(area.nome, checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor={`area-${area.id}`} className="text-xs cursor-pointer flex-1 text-foreground">
                    {area.nome}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Processo - Only show if areas are selected */}
        {filters.areas.length > 0 && (
          <Collapsible open={expandedSections.includes("processo")} onOpenChange={() => toggleSection("processo")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <span className="text-xs font-medium text-muted-foreground">
                  Processo {filters.processos.length > 0 && `(${filters.processos.length})`}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform text-muted-foreground ${expandedSections.includes("processo") ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {availableProcessos.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">
                  Nenhum processo disponível para as áreas selecionadas
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableProcessos.map(processo => (
                    <div key={processo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`processo-${processo.id}`}
                        checked={filters.processos.includes(processo.nome)}
                        onCheckedChange={(checked) => handleProcessoChange(processo.nome, checked as boolean)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={`processo-${processo.id}`} className="text-xs cursor-pointer flex-1 text-foreground">
                        {processo.nome}
                      </Label>
                    </div>
                  ))}
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
                <span className="text-xs font-medium text-muted-foreground">
                  Subprocesso {filters.subprocessos.length > 0 && `(${filters.subprocessos.length})`}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform text-muted-foreground ${expandedSections.includes("subprocesso") ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {availableSubprocessos.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">
                  Nenhum subprocesso disponível para os processos selecionados
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableSubprocessos.map(subprocesso => (
                    <div key={subprocesso.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subprocesso-${subprocesso.id}`}
                        checked={filters.subprocessos.includes(subprocesso.nome)}
                        onCheckedChange={(checked) => handleSubprocessoChange(subprocesso.nome, checked as boolean)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={`subprocesso-${subprocesso.id}`} className="text-xs cursor-pointer flex-1 text-foreground">
                        {subprocesso.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Status */}
        <Collapsible open={expandedSections.includes("status")} onOpenChange={() => toggleSection("status")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="text-xs font-medium text-muted-foreground">
                Status {filters.status.length > 0 && `(${filters.status.length})`}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform text-muted-foreground ${expandedSections.includes("status") ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-ativo"
                  checked={filters.status.includes("ativo")}
                  onCheckedChange={(checked) => handleStatusChange("ativo", checked as boolean)}
                  className="h-3 w-3"
                />
                <Label htmlFor="status-ativo" className="text-xs cursor-pointer text-foreground">
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
                <Label htmlFor="status-inativo" className="text-xs cursor-pointer text-foreground">
                  Inativo
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect, useMemo } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAreas, useProcessos, useSubprocessos } from "@/hooks/useAreas";

interface HorizontalFilterPanelProps {
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

export function HorizontalFilterPanel({ filters, onFiltersChange, className = "" }: HorizontalFilterPanelProps) {
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

  const handleAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked 
      ? [...filters.areas, area]
      : filters.areas.filter(a => a !== area);
    
    let newProcessos = filters.processos;
    let newSubprocessos = filters.subprocessos;
    
    if (!checked) {
      const processosToRemove = allProcessos?.filter(p => 
        p.area?.nome === area
      ).map(p => p.nome) || [];
      
      newProcessos = filters.processos.filter(p => !processosToRemove.includes(p));
      
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
    const newProcessos = checked 
      ? [...filters.processos, processo]
      : filters.processos.filter(p => p !== processo);
    
    let newSubprocessos = filters.subprocessos;
    
    if (!checked) {
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
    const newSubprocessos = checked 
      ? [...filters.subprocessos, subprocesso]
      : filters.subprocessos.filter(s => s !== subprocesso);
    
    onFiltersChange({
      ...filters,
      subprocessos: newSubprocessos
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
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-background/50 border border-border/50 rounded-lg ${className}`}>
      {/* Produto */}
      <div className="flex items-center space-x-2">
        <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Produto:</Label>
        <Input
          placeholder="Buscar por nome..."
          value={filters.produto}
          onChange={(e) => onFiltersChange({ ...filters, produto: e.target.value })}
          className="h-8 w-48 text-sm bg-background/50"
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Demanda/Rotina */}
      <div className="flex items-center space-x-2">
        <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tipo:</Label>
        <Select
          value={filters.demandaRotina}
          onValueChange={(value) => onFiltersChange({ ...filters, demandaRotina: value })}
        >
          <SelectTrigger className="h-8 w-32 text-sm bg-background/50">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Demanda">Demanda</SelectItem>
            <SelectItem value="Rotina">Rotina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Área */}
      <div className="flex items-center space-x-2">
        <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Área:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {filters.areas.length > 0 ? `${filters.areas.length} selecionada${filters.areas.length !== 1 ? 's' : ''}` : 'Todas'}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {allAreas?.map(area => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${area.id}`}
                    checked={filters.areas.includes(area.nome)}
                    onCheckedChange={(checked) => handleAreaChange(area.nome, checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor={`area-${area.id}`} className="text-xs cursor-pointer flex-1">
                    {area.nome}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Processo - Only show if areas are selected */}
      {filters.areas.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Processo:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {filters.processos.length > 0 ? `${filters.processos.length} selecionado${filters.processos.length !== 1 ? 's' : ''}` : 'Todos'}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                {availableProcessos.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2">
                    Nenhum processo disponível
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {availableProcessos.map(processo => (
                      <div key={processo.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`processo-${processo.id}`}
                          checked={filters.processos.includes(processo.nome)}
                          onCheckedChange={(checked) => handleProcessoChange(processo.nome, checked as boolean)}
                          className="h-3 w-3"
                        />
                        <Label htmlFor={`processo-${processo.id}`} className="text-xs cursor-pointer flex-1">
                          {processo.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

      {/* Subprocesso - Only show if processos are selected */}
      {filters.processos.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Subprocesso:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {filters.subprocessos.length > 0 ? `${filters.subprocessos.length} selecionado${filters.subprocessos.length !== 1 ? 's' : ''}` : 'Todos'}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                {availableSubprocessos.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2">
                    Nenhum subprocesso disponível
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {availableSubprocessos.map(subprocesso => (
                      <div key={subprocesso.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subprocesso-${subprocesso.id}`}
                          checked={filters.subprocessos.includes(subprocesso.nome)}
                          onCheckedChange={(checked) => handleSubprocessoChange(subprocesso.nome, checked as boolean)}
                          className="h-3 w-3"
                        />
                        <Label htmlFor={`subprocesso-${subprocesso.id}`} className="text-xs cursor-pointer flex-1">
                          {subprocesso.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

      {/* Status */}
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center space-x-2">
        <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {filters.status.length > 0 ? `${filters.status.length} selecionado${filters.status.length !== 1 ? 's' : ''}` : 'Todos'}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-2" align="start">
            <div className="space-y-1">
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
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </>
      )}

      {/* Active Filters Count */}
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20">
          {activeFiltersCount}
        </Badge>
      )}
    </div>
  );
} 
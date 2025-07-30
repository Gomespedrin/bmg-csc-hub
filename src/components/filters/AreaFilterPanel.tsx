import { useState, useEffect, useMemo } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAreas } from "@/hooks/useAreas";

interface AreaFilterPanelProps {
  filters: {
    areas: string[];
  };
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export function AreaFilterPanel({ filters, onFiltersChange, className = "" }: AreaFilterPanelProps) {
  const { data: allAreas } = useAreas();

  const handleAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked 
      ? [...filters.areas, area]
      : filters.areas.filter(a => a !== area);
    
    onFiltersChange({
      ...filters,
      areas: newAreas
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      areas: []
    });
  };

  const activeFiltersCount = filters.areas.length;

  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-background/50 border border-border/50 rounded-lg ${className}`}>
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
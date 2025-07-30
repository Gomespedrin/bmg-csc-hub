import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutGrid, List, Grid3X3, Square, Eye, EyeOff } from "lucide-react";

export type ViewMode = "grid" | "list" | "compact" | "detailed";

interface ViewOptionsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showDetails?: boolean;
  onShowDetailsChange?: (show: boolean) => void;
  showPreview?: boolean;
  onShowPreviewChange?: (show: boolean) => void;
}

export function ViewOptions({ 
  viewMode, 
  onViewModeChange, 
  showDetails = false, 
  onShowDetailsChange,
  showPreview = false,
  onShowPreviewChange
}: ViewOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const viewOptions = [
    {
      id: "grid" as ViewMode,
      label: "Grade",
      icon: LayoutGrid,
      description: "Exibição em grade"
    },
    {
      id: "list" as ViewMode,
      label: "Lista",
      icon: List,
      description: "Exibição em lista"
    },
    {
      id: "compact" as ViewMode,
      label: "Compacto",
      icon: Grid3X3,
      description: "Exibição compacta"
    },
    {
      id: "detailed" as ViewMode,
      label: "Detalhado",
      icon: Square,
      description: "Exibição detalhada"
    }
  ];

  const getCurrentViewIcon = () => {
    const currentView = viewOptions.find(option => option.id === viewMode);
    return currentView?.icon || LayoutGrid;
  };

  const CurrentViewIcon = getCurrentViewIcon();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <CurrentViewIcon className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* View Options */}
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium text-muted-foreground mb-2">Exibição</div>
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => {
                  onViewModeChange(option.id);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {viewMode === option.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Panel Options */}
        {(onShowDetailsChange || onShowPreviewChange) && (
          <div className="px-2 py-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-2">Painéis</div>
            
            {onShowDetailsChange && (
              <DropdownMenuItem
                onClick={() => {
                  onShowDetailsChange(!showDetails);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                {showDetails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <div className="flex-1">
                  <div className="text-sm">Painel de detalhes</div>
                  <div className="text-xs text-muted-foreground">
                    {showDetails ? "Ocultar" : "Mostrar"} informações detalhadas
                  </div>
                </div>
                {showDetails && <div className="w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
            )}

            {onShowPreviewChange && (
              <DropdownMenuItem
                onClick={() => {
                  onShowPreviewChange(!showPreview);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <div className="flex-1">
                  <div className="text-sm">Painel de visualização</div>
                  <div className="text-xs text-muted-foreground">
                    {showPreview ? "Ocultar" : "Mostrar"} prévia dos itens
                  </div>
                </div>
                {showPreview && <div className="w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
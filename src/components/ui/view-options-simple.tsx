import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Grid3X3, List, Eye } from "lucide-react";

type ViewMode = "grid" | "list" | "compact";

interface ViewOptionsSimpleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewOptionsSimple({ viewMode, onViewModeChange }: ViewOptionsSimpleProps) {
  const viewOptions = [
    { value: 'grid' as ViewMode, label: 'Grade', icon: Grid3X3 },
    { value: 'list' as ViewMode, label: 'Lista', icon: List },
    { value: 'compact' as ViewMode, label: 'Compacto', icon: Eye }
  ];

  const getCurrentViewIcon = () => {
    const currentView = viewOptions.find(option => option.value === viewMode);
    return currentView?.icon || Grid3X3;
  };

  const CurrentViewIcon = getCurrentViewIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <CurrentViewIcon className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onViewModeChange(option.value)}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{option.label}</span>
              {viewMode === option.value && (
                <div className="w-2 h-2 bg-primary rounded-full ml-auto" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
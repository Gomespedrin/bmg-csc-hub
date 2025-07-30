import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import {
  Home,
  Building2,
  Package,
  Plus,
  FileText,
  Settings,
  User,
  Shield,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export function Sidebar({ isOpen, onToggle, isPinned, onTogglePin }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  const menuItems = [
    {
      title: "Início",
      icon: Home,
      href: "/",
      badge: null
    },
    {
      title: "Por Área",
      icon: Building2,
      href: "/por-area",
      badge: null
    },
    {
      title: "Todos os Serviços",
      icon: Package,
      href: "/servicos",
      badge: null
    },
    {
      title: "Sugerir Serviço",
      icon: Plus,
      href: "/sugestoes/nova",
      badge: null
    },
    ...(user ? [{
      title: "Minhas Sugestões",
      icon: FileText,
      href: "/minhas-sugestoes",
      badge: null
    }] : []),
    ...(isAdmin ? [{
      title: "Admin - Sugestões",
      icon: Shield,
      href: "/admin/sugestoes",
      badge: "Admin"
    }, {
      title: "Admin - Catálogo",
      icon: Shield,
      href: "/admin/catalogo",
      badge: "Admin"
    }] : [])
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-gray-100 border-r border-gray-300 z-40",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-200">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CSC</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Portal CSC</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0 hover:bg-gray-300"
        >
          {isOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </Button>
      </div>

      {/* Conteúdo da Sidebar */}
      <div className="flex flex-col h-full">
        {/* Menu Principal */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-2 py-2 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer da Sidebar */}
        {user && isOpen && (
          <>
            <Separator className="mx-3" />
            <div className="p-3 space-y-1">
              <Link
                to="/perfil"
                className={cn(
                  "flex items-center space-x-3 px-2 py-2 rounded text-sm font-medium transition-colors",
                  location.pathname === "/perfil"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">Perfil</span>
              </Link>
              
              <Link
                to="/configuracoes"
                className={cn(
                  "flex items-center space-x-3 px-2 py-2 rounded text-sm font-medium transition-colors",
                  location.pathname === "/configuracoes"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">Configurações</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
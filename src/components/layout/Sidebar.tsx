import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  Home,
  Building2,
  Package,
  Plus,
  FileText,
  Shield,
  X,
  Pin,
  PinOff
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
      title: "Painel Administrativo",
      icon: Shield,
      href: "/admin",
      badge: "Admin"
    }] : [])
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isPinned ? "translate-x-0" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CSC</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Portal CSC</h2>
            <p className="text-xs text-gray-500">Centro de Serviços</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePin}
            className="h-8 w-8 p-0"
          >
            {isPinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Separator */}
      <Separator className="mx-4" />

      {/* User Info */}
      {user && (
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
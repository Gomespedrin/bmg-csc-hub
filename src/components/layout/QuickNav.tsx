import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  Building2,
  Package,
  Plus,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Settings,
  BarChart3
} from "lucide-react";

export function QuickNav() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  const quickActions = [
    {
      title: "Por Área",
      description: "Navegue pelos serviços organizados por área",
      icon: Building2,
      href: "/por-area",
      color: "bg-blue-500",
      badge: null
    },
    {
      title: "Todos os Serviços",
      description: "Catálogo completo de serviços disponíveis",
      icon: Package,
      href: "/servicos",
      color: "bg-green-500",
      badge: null
    },
    {
      title: "Sugerir Serviço",
      description: "Proponha um novo serviço para o catálogo",
      icon: Plus,
      href: "/sugestoes/nova",
      color: "bg-orange-500",
      badge: null
    },
    ...(user ? [{
      title: "Minhas Sugestões",
      description: "Acompanhe suas propostas de serviços",
      icon: FileText,
      href: "/minhas-sugestoes",
      color: "bg-purple-500",
      badge: null
    }] : []),
    ...(isAdmin ? [{
      title: "Admin - Sugestões",
      description: "Gerencie as sugestões de novos serviços",
      icon: Shield,
      href: "/admin/sugestoes",
      color: "bg-red-500",
      badge: "Admin"
    }, {
      title: "Admin - Catálogo",
      description: "Gerencie o catálogo de serviços",
      icon: Shield,
      href: "/admin/catalogo",
      color: "bg-indigo-500",
      badge: "Admin"
    }] : [])
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action) => {
        const Icon = action.icon;
        
        return (
          <Link key={action.href} to={action.href} className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group-hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
} 
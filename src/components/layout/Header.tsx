import { User, Settings, LogOut, Shield, Building2, Package, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useAdmin";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xs">CSC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-gray-800">Portal CSC</h1>
              <p className="text-xs text-gray-500">Centro de Serviços Compartilhados</p>
            </div>
          </Link>
        </div>

        {/* Menus Superiores */}
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-sm">Início</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/por-area" className="flex items-center space-x-1">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Por Área</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/servicos" className="flex items-center space-x-1">
              <Package className="h-4 w-4" />
              <span className="text-sm">Serviços</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sugestoes/nova" className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Sugerir</span>
            </Link>
          </Button>
          {user && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/minhas-sugestoes" className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Minhas Sugestões</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Barra de Busca */}
        <div className="flex-1 max-w-md mx-4">
          <GlobalSearch 
            placeholder="Buscar serviços, processos, áreas..."
            className="w-full"
          />
        </div>

        {/* Menu do Usuário */}
        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.nome} />
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      {profile?.nome?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/configuracoes" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Painel Administrativo</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
import { useState } from "react";
import { Search, User, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginDialog } from "@/components/auth/LoginDialog";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CSC</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-foreground">Portal CSC</h1>
              <p className="text-xs text-muted-foreground">Centro de Serviços Compartilhados</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/por-area" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
            >
              Por Área
            </Link>
            <Link 
              to="/servicos" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
            >
              Todos os Serviços
            </Link>
            <Link 
              to="/sugestoes/nova" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
            >
              Sugerir Serviço
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços, processos, áreas..."
              className="pl-10 bg-muted/50 border-muted focus:bg-card transition-smooth"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.nome || user.email}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/sugestoes">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin - Sugestões</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setLoginDialogOpen(true)}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
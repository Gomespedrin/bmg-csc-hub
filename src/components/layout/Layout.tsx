import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAuthPage && <Header />}
      
      {/* Conteúdo Principal */}
      <main className={`flex-1 ${isAuthPage ? "min-h-screen" : "min-h-[calc(100vh-3.5rem)]"}`}>
        {isAuthPage ? (
          children
        ) : (
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Rodapé - apenas para páginas não de autenticação */}
      {!isAuthPage && <Footer />}
    </div>
  );
} 
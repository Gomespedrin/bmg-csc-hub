import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Pages
import Index from "./pages/Index";
import Servicos from "./pages/Servicos";
import AreaDetalhe from "./pages/AreaDetalhe";
import ServicoDetalhe from "./pages/ServicoDetalhe";
import ProcessoDetalhe from "./pages/ProcessoDetalhe";
import SubprocessoDetalhe from "./pages/SubprocessoDetalhe";
import PorArea from "./pages/PorArea";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminSugestoes from "./pages/AdminSugestoes";
import AdminCatalogo from "./pages/AdminCatalogo";
import AdminPanel from "./pages/AdminPanel";
import MinhasSugestoes from "./pages/MinhasSugestoes";
import NovaSugestao from "./pages/NovaSugestao";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/areas/:slug" element={<AreaDetalhe />} />
              <Route path="/servicos/:slug" element={<ServicoDetalhe />} />
              <Route path="/processos/:processoId" element={<ProcessoDetalhe />} />
              <Route path="/processos/:processoId/subprocessos/:subprocessoId" element={<SubprocessoDetalhe />} />
              <Route path="/por-area" element={<PorArea />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
              <Route path="/admin/catalogo" element={<AdminCatalogo />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/minhas-sugestoes" element={<MinhasSugestoes />} />
              <Route path="/sugestoes/nova" element={<NovaSugestao />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

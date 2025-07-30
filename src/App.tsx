import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PorArea from "./pages/PorArea";
import Servicos from "./pages/Servicos";
import ServicoDetalhe from "./pages/ServicoDetalhe";
import AreaDetalhe from "./pages/AreaDetalhe";
import SubprocessoDetalhe from "./pages/SubprocessoDetalhe";
import ProcessoDetalhe from "./pages/ProcessoDetalhe";
import NovaSugestao from "./pages/NovaSugestao";
import AdminSugestoes from "./pages/AdminSugestoes";
import AdminCatalogo from "./pages/AdminCatalogo";
import MinhasSugestoes from "./pages/MinhasSugestoes";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/por-area" element={<PorArea />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/servicos/:slug" element={<ServicoDetalhe />} />
          <Route path="/areas/:slug" element={<AreaDetalhe />} />
          <Route path="/processos/:processoId" element={<ProcessoDetalhe />} />
          <Route path="/processos/:processoId/subprocessos/:subprocessoId" element={<SubprocessoDetalhe />} />
          <Route path="/sugestoes/nova" element={<NovaSugestao />} />
          <Route path="/minhas-sugestoes" element={<MinhasSugestoes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
          <Route path="/admin/catalogo" element={<AdminCatalogo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

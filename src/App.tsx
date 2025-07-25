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
import NovaSugestao from "./pages/NovaSugestao";
import AdminSugestoes from "./pages/AdminSugestoes";
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
          <Route path="/servicos/:id" element={<ServicoDetalhe />} />
          <Route path="/areas/:areaId" element={<AreaDetalhe />} />
          <Route path="/sugestoes/nova" element={<NovaSugestao />} />
          <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

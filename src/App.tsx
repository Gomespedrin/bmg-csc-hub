import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import PorArea from "@/pages/PorArea";
import AreaDetalhe from "@/pages/AreaDetalhe";
import Servicos from "@/pages/Servicos";
import ServicoDetalhe from "@/pages/ServicoDetalhe";
import NovaSugestao from "@/pages/NovaSugestao";
import SugestaoDetalhe from "@/pages/SugestaoDetalhe";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/por-area" element={<PorArea />} />
        <Route path="/areas/:areaId" element={<AreaDetalhe />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/servicos/:id" element={<ServicoDetalhe />} />
        <Route path="/sugestoes/nova" element={<NovaSugestao />} />
        <Route path="/sugestoes/:id" element={<SugestaoDetalhe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
export default App;

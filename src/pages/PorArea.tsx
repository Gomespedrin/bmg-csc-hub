import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AreaCard } from "@/components/areas/AreaCard";
import { SearchBar } from "@/components/search/SearchBar";
import { Building2, Users, Zap } from "lucide-react";

const mockAreas = [
  {
    id: "rh",
    nome: "Recursos Humanos",
    descricao: "Gestão de pessoas, onboarding, folha de pagamento e desenvolvimento organizacional.",
    quantidadeServicos: 23,
    processos: ["Onboarding", "Folha de Pagamento", "Treinamento", "Avaliação de Performance"]
  },
  {
    id: "ti", 
    nome: "Tecnologia da Informação",
    descricao: "Desenvolvimento de sistemas, infraestrutura, suporte técnico e segurança da informação.",
    quantidadeServicos: 31,
    processos: ["Desenvolvimento", "Infraestrutura", "Suporte", "Segurança"]
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    descricao: "Contabilidade, controladoria, planejamento financeiro e gestão de custos.",
    quantidadeServicos: 18,
    processos: ["Contabilidade", "Controladoria", "Planejamento", "Custos"]
  },
  {
    id: "juridico",
    nome: "Jurídico",
    descricao: "Contratos, compliance, consultoria jurídica e gestão de riscos legais.",
    quantidadeServicos: 15,
    processos: ["Contratos", "Compliance", "Consultoria", "Riscos"]
  },
  {
    id: "operacoes",
    nome: "Operações",
    descricao: "Processos operacionais, logística, qualidade e melhoria contínua.",
    quantidadeServicos: 27,
    processos: ["Logística", "Qualidade", "Melhoria Contínua", "Processos"]
  },
  {
    id: "comercial",
    nome: "Comercial",
    descricao: "Vendas, marketing, relacionamento com cliente e desenvolvimento de negócios.",
    quantidadeServicos: 19,
    processos: ["Vendas", "Marketing", "CRM", "Desenvolvimento"]
  }
];

export default function PorArea() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAreas = mockAreas.filter(area =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalServicos = mockAreas.reduce((sum, area) => sum + area.quantidadeServicos, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Serviços por Área
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore os serviços organizados por área de atuação. 
            Cada área contém processos específicos com seus respectivos serviços.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockAreas.length}</div>
              <div className="text-sm text-muted-foreground">Áreas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{totalServicos}</div>
              <div className="text-sm text-muted-foreground">Serviços</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">100%</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <SearchBar 
              placeholder="Buscar área..."
              showSuggestions={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map(area => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>

        {filteredAreas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma área encontrada
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os termos de busca para encontrar a área desejada.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
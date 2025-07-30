import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Send, FileText, Lightbulb } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCreateSugestao } from "@/hooks/useSugestoes";
import { useAreas } from "@/hooks/useAreas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function NovaSugestao() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const createSugestao = useCreateSugestao();
  const { data: areas, isLoading: areasLoading } = useAreas();
  
  const [tipoSugestao, setTipoSugestao] = useState("");
  const [formData, setFormData] = useState({
    produto: "",
    area: "",
    processo: "",
    subprocesso: "",
    demandaRotina: "Demanda",
    oQueE: "",
    quemPodeUtilizar: "",
    tempoMedio: "",
    unidadeMedida: "",
    sla: "",
    sli: "",
    requisitosOperacionais: "",
    observacoes: "",
    justificativa: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!tipoSugestao || !formData.produto || !formData.area || !formData.oQueE) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert numeric fields
      const dadosSugeridos = {
        ...formData,
        tempo_medio: formData.tempoMedio ? parseInt(formData.tempoMedio) : null,
        sla: formData.sla ? parseInt(formData.sla) : null,
        sli: formData.sli ? parseFloat(formData.sli) : null,
      };

      await createSugestao.mutateAsync({
        tipo: tipoSugestao,
        dados_sugeridos: dadosSugeridos,
        justificativa: formData.justificativa
      });

      toast({
        title: "Sugestão enviada!",
        description: "Sua sugestão foi enviada para análise e você receberá um retorno em breve.",
      });

      // Navigate back to home
      navigate('/');
      
    } catch (error) {
      toast({
        title: "Erro ao enviar sugestão",
        description: "Ocorreu um erro ao enviar sua sugestão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nova Sugestão</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Nova Sugestão
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contribua para a melhoria contínua dos nossos serviços. 
              Sugira novos serviços ou melhorias nos existentes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo de Sugestão */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Sugestão</CardTitle>
                <CardDescription>
                  Selecione o tipo da sua sugestão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={tipoSugestao} onValueChange={setTipoSugestao}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="novo" id="novo" />
                    <Label htmlFor="novo">Novo Serviço</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="melhoria" id="melhoria" />
                    <Label htmlFor="melhoria">Melhoria em Serviço Existente</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados fundamentais do serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="produto">Produto *</Label>
                    <Input
                      id="produto"
                      placeholder="Nome do produto/serviço"
                      value={formData.produto}
                      onChange={(e) => setFormData({...formData, produto: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área *</Label>
                    <Select value={formData.area} onValueChange={(value) => setFormData({...formData, area: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={areasLoading ? "Carregando..." : "Selecione a área"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areasLoading ? (
                          <SelectItem value="loading" disabled>Carregando áreas...</SelectItem>
                        ) : areas?.length ? (
                          areas.map(area => (
                            <SelectItem key={area.id} value={area.nome}>{area.nome}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-areas" disabled>Nenhuma área encontrada</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processo">Processo</Label>
                    <Input
                      id="processo"
                      placeholder="Nome do processo"
                      value={formData.processo}
                      onChange={(e) => setFormData({...formData, processo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subprocesso">Subprocesso</Label>
                    <Input
                      id="subprocesso"
                      placeholder="Nome do subprocesso"
                      value={formData.subprocesso}
                      onChange={(e) => setFormData({...formData, subprocesso: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demandaRotina">Tipo de Execução</Label>
                  <Select value={formData.demandaRotina} onValueChange={(value) => setFormData({...formData, demandaRotina: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Demanda ou Rotina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Demanda">Demanda</SelectItem>
                      <SelectItem value="Rotina">Rotina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Descrição do Serviço */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Serviço</CardTitle>
                <CardDescription>
                  Detalhe como o serviço funciona
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oQueE">O que é *</Label>
                  <Textarea
                    id="oQueE"
                    placeholder="Descreva o que é o serviço e qual seu objetivo..."
                    value={formData.oQueE}
                    onChange={(e) => setFormData({...formData, oQueE: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quemPodeUtilizar">Quem pode utilizar</Label>
                  <Textarea
                    id="quemPodeUtilizar"
                    placeholder="Defina quem pode solicitar ou utilizar este serviço..."
                    value={formData.quemPodeUtilizar}
                    onChange={(e) => setFormData({...formData, quemPodeUtilizar: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requisitosOperacionais">Requisitos Operacionais</Label>
                  <Textarea
                    id="requisitosOperacionais"
                    placeholder="Liste os requisitos necessários para executar o serviço..."
                    value={formData.requisitosOperacionais}
                    onChange={(e) => setFormData({...formData, requisitosOperacionais: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Acordos de Nível de Serviço */}
            <Card>
              <CardHeader>
                <CardTitle>Acordos de Nível de Serviço</CardTitle>
                <CardDescription>
                  Defina os compromissos de qualidade e tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempoMedio">Tempo Médio</Label>
                    <Input
                      id="tempoMedio"
                      placeholder="Ex: 2 dias"
                      value={formData.tempoMedio}
                      onChange={(e) => setFormData({...formData, tempoMedio: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sla">SLA</Label>
                    <Input
                      id="sla"
                      placeholder="Ex: 5 dias"
                      value={formData.sla}
                      onChange={(e) => setFormData({...formData, sla: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sli">SLI</Label>
                    <Input
                      id="sli"
                      placeholder="Ex: 95%"
                      value={formData.sli}
                      onChange={(e) => setFormData({...formData, sli: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                  <Input
                    id="unidadeMedida"
                    placeholder="Ex: dias úteis, horas, etc."
                    value={formData.unidadeMedida}
                    onChange={(e) => setFormData({...formData, unidadeMedida: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Observações e Justificativa */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Adicione observações importantes sobre o serviço..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificativa">Justificativa da Sugestão</Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Explique por que esta sugestão é importante e qual problema resolve..."
                    value={formData.justificativa}
                    onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
              <Button type="submit" className="glow-primary">
                <Send className="mr-2 h-4 w-4" />
                Enviar Sugestão
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
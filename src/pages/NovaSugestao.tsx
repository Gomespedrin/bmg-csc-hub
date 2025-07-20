import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Send, Lightbulb } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos permitidos de sugestão.
 * 'edicao' substitui o antigo 'melhoria'.
 */
type TipoSugestao = "novo" | "edicao";

/**
 * Estrutura de estado do formulário (campos visíveis para o usuário).
 */
interface FormData {
  produto: string;
  area: string;
  processo: string;
  subprocesso: string;
  demandaRotina: string;
  oQueE: string;
  quemPodeUtilizar: string;
  tempoMedioValor: string;
  tempoMedioUnidade: string;
  sla: string;
  sli: string;
  unidadeMedida: string;
  requisitosOperacionais: string;
  observacoes: string;
  justificativa: string;
}

const initialForm: FormData = {
  produto: "",
  area: "",
  processo: "",
  subprocesso: "",
  demandaRotina: "",
  oQueE: "",
  quemPodeUtilizar: "",
  tempoMedioValor: "",
  tempoMedioUnidade: "",
  sla: "",
  sli: "",
  unidadeMedida: "",
  requisitosOperacionais: "",
  observacoes: "",
  justificativa: ""
};

export default function NovaSugestao() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tipoSugestao, setTipoSugestao] = useState<TipoSugestao | "">("");
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Lista mock de áreas – depois podemos substituir via query.
   */
  const mockAreas = [
    "Recursos Humanos",
    "Tecnologia da Informação",
    "Financeiro",
    "Jurídico",
    "Compliance",
    "Operações"
  ];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const normalizeTipo = (t: string): TipoSugestao => {
    if (t === "melhoria") return "edicao";
    return t === "novo" ? "novo" : "edicao";
  };

  /**
   * Validação mínima.
   */
  const validate = (): string | null => {
    if (!tipoSugestao) return "Selecione o tipo.";
    if (!formData.produto.trim()) return "Informe o Produto/Serviço.";
    if (!formData.area.trim()) return "Selecione a Área.";
    if (!formData.oQueE.trim()) return "Preencha o campo 'O que é'.";
    return null;
  };

  const resetForm = () => {
    setTipoSugestao("");
    setFormData(initialForm);
  };

  /**
   * Monta o objeto JSON que será salvo em 'dados_sugeridos'.
   */
  const buildDadosSugeridos = () => {
    // Conversões numéricas seguras
    const slaNum = formData.sla.trim() ? Number(formData.sla.trim().replace(",", ".")) : null;
    const sliNum = formData.sli.trim() ? Number(formData.sli.trim().replace(",", ".")) : null;
    const tempoValorNum = formData.tempoMedioValor.trim()
      ? Number(formData.tempoMedioValor.trim().replace(",", "."))
      : null;

    return {
      produto: formData.produto.trim(),
      area: formData.area.trim(),
      processo: formData.processo.trim() || null,
      subprocesso: formData.subprocesso.trim() || null,
      demanda_rotina: formData.demandaRotina || null,
      descricao: formData.oQueE.trim(),
      quem_pode_utilizar: formData.quemPodeUtilizar.trim() || null,
      tempo_medio: tempoValorNum
        ? {
            valor: tempoValorNum,
            unidade: formData.tempoMedioUnidade.trim() || formData.unidadeMedida.trim() || null
          }
        : null,
      sla: slaNum,
      sli: sliNum,
      unidade_medida: formData.unidadeMedida.trim() || null,
      requisitos_operacionais: formData.requisitosOperacionais.trim() || null,
      observacoes: formData.observacoes.trim() || null,
      justificativa: formData.justificativa.trim() || null,
      versao_proposta: 1
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validate();
    if (errorMsg) {
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const tipoFinal = normalizeTipo(tipoSugestao);

    const dadosSugeridos = buildDadosSugeridos();

    try {
      /**
       * Insert na tabela 'sugestoes'.
       * Campos obrigatórios conforme schema:
       * - tipo (text)
       * - dados_sugeridos (json)
       * - justificativa (opcional)
       * - criado_por: definido via trigger/policy (ideal) ou enviar manual
       */
      const { error } = await supabase
        .from("sugestoes")
        .insert([
          {
            tipo: tipoFinal,
            justificativa: formData.justificativa.trim() || null,
            dados_sugeridos: dadosSugeridos
            // criado_por: <-- NÃO enviar se trigger cuidando. Se não tiver trigger e policy exigir, veremos depois.
          }
        ]);

      if (error) {
        console.error("Erro insert sugestao:", error);
        toast({
          title: "Erro ao enviar",
          description: "Não foi possível registrar a sugestão.",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: "Sugestão enviada!",
        description: "Sua sugestão foi registrada e está pendente de análise."
      });

      resetForm();
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro inesperado",
        description: "Falha inesperada ao enviar.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
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

        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Nova Sugestão</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sugira novos serviços ou a edição de um serviço existente. As informações
              serão avaliadas antes de publicação no catálogo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Sugestão *</CardTitle>
                <CardDescription>
                  Escolha entre criação de novo serviço ou edição de um existente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={tipoSugestao}
                  onValueChange={(val) => setTipoSugestao(normalizeTipo(val))}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="novo" id="novo" />
                    <Label htmlFor="novo">Novo Serviço</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="edicao" id="edicao" />
                    <Label htmlFor="edicao">Edição de Serviço Existente</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Básico */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Campos essenciais do serviço.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="produto">Produto / Serviço *</Label>
                    <Input
                      id="produto"
                      value={formData.produto}
                      placeholder="Ex: Cadastro de Novo Colaborador"
                      onChange={(e) => updateField("produto", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(v) => updateField("area", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAreas.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processo">Processo</Label>
                    <Input
                      id="processo"
                      value={formData.processo}
                      placeholder="Ex: Onboarding"
                      onChange={(e) => updateField("processo", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subprocesso">Subprocesso</Label>
                    <Input
                      id="subprocesso"
                      value={formData.subprocesso}
                      placeholder="Ex: Admissão"
                      onChange={(e) => updateField("subprocesso", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Execução</Label>
                  <Select
                    value={formData.demandaRotina}
                    onValueChange={(v) => updateField("demandaRotina", v)}
                  >
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

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oQueE">O que é *</Label>
                  <Textarea
                    id="oQueE"
                    className="min-h-[100px]"
                    placeholder="Explique o objetivo e escopo do serviço..."
                    value={formData.oQueE}
                    onChange={(e) => updateField("oQueE", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quemPodeUtilizar">Quem pode utilizar</Label>
                  <Textarea
                    id="quemPodeUtilizar"
                    value={formData.quemPodeUtilizar}
                    placeholder="Ex: Gestores de RH"
                    onChange={(e) => updateField("quemPodeUtilizar", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requisitosOperacionais">Requisitos Operacionais</Label>
                  <Textarea
                    id="requisitosOperacionais"
                    value={formData.requisitosOperacionais}
                    placeholder="Listar acessos, documentos necessários..."
                    onChange={(e) => updateField("requisitosOperacionais", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SLA / Métricas */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas e Acordos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempoMedioValor">Tempo Médio (valor)</Label>
                    <Input
                      id="tempoMedioValor"
                      value={formData.tempoMedioValor}
                      placeholder="Ex: 2"
                      onChange={(e) => updateField("tempoMedioValor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempoMedioUnidade">Tempo Médio (unidade)</Label>
                    <Input
                      id="tempoMedioUnidade"
                      value={formData.tempoMedioUnidade}
                      placeholder="Ex: dias"
                      onChange={(e) => updateField("tempoMedioUnidade", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidadeMedida">Unidade de Medida (geral)</Label>
                    <Input
                      id="unidadeMedida"
                      value={formData.unidadeMedida}
                      placeholder="Ex: dias úteis"
                      onChange={(e) => updateField("unidadeMedida", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sla">SLA</Label>
                    <Input
                      id="sla"
                      value={formData.sla}
                      placeholder="Ex: 5 (dias)"
                      onChange={(e) => updateField("sla", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sli">SLI (%)</Label>
                    <Input
                      id="sli"
                      value={formData.sli}
                      placeholder="Ex: 95"
                      onChange={(e) => updateField("sli", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações / Justificativas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    placeholder="Observações relevantes..."
                    onChange={(e) => updateField("observacoes", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="justificativa">Justificativa</Label>
                  <Textarea
                    id="justificativa"
                    className="min-h-[100px]"
                    value={formData.justificativa}
                    placeholder="Explique por que essa sugestão é importante..."
                    onChange={(e) => updateField("justificativa", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  navigate("/");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando..." : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Sugestão
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

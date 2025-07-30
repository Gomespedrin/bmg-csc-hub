import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAreas, useAreaById } from "@/hooks/useAreas";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCreateSugestao } from "@/hooks/useSugestoes";
import { useToast } from "@/hooks/use-toast";

type SugestaoMode = "novo" | "edicao";
type SugestaoScope = "area" | "processo" | "subprocesso" | "servico";

interface FormData {
  modo: "novo" | "edicao";
  escopo: "area" | "processo" | "subprocesso" | "servico";
  areaId?: string;
  processoId?: string;
  subprocessoId?: string;
  servicoId?: string;
  nome: string;
  descricao: string;
  justificativa: string;
  dadosAtuais?: any;
  // Campos avançados para serviços
  tempo_medio?: number;
  unidade_medida?: string;
  sla?: number;
  sli?: number;
  demanda_rotina?: string;
  requisitos_operacionais?: string;
  observacoes?: string;
  quem_pode_utilizar?: string;
}

export default function NovaSugestao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: areas } = useAreas();
  const createSugestao = useCreateSugestao();
  
  const [form, setForm] = useState<FormData>({
    modo: "novo",
    escopo: "area",
    nome: "",
    descricao: "",
    justificativa: ""
  });
  
  const { data: areaCompleta } = useAreaById(form.areaId || "");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isSubmitting = createSugestao.isPending;

  // Estados para dados hierárquicos
  const [processos, setProcessos] = useState<any[]>([]);
  const [subprocessos, setSubprocessos] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);

  // Carregar dados da URL quando a página for carregada
  useEffect(() => {
    const modo = searchParams.get('modo');
    const escopo = searchParams.get('escopo');
    const areaId = searchParams.get('area_id');
    const processoId = searchParams.get('processo_id');
    const subprocessoId = searchParams.get('subprocesso_id');
    const servicoId = searchParams.get('servico_id');
    const nome = searchParams.get('nome');
    const descricao = searchParams.get('descricao');
    const justificativa = searchParams.get('justificativa');
    const reenviar = searchParams.get('reenviar');

    if (reenviar === 'true' && modo && escopo) {
      setForm({
        modo: modo as SugestaoMode,
        escopo: escopo as SugestaoScope,
        areaId: areaId || undefined,
        processoId: processoId || undefined,
        subprocessoId: subprocessoId || undefined,
        servicoId: servicoId || undefined,
        nome: nome || "",
        descricao: descricao || "",
        justificativa: justificativa || ""
      });
    }
  }, [searchParams]);

  // Carregar dados hierárquicos baseado na seleção
  useEffect(() => {
    if (form.areaId && areaCompleta) {
      setProcessos(areaCompleta.processos || []);
    } else if (form.areaId && areas) {
      const area = areas.find(a => a.id === form.areaId);
      setProcessos(area?.processos || []);
    } else {
      setProcessos([]);
    }
  }, [form.areaId, areaCompleta, areas]);

  useEffect(() => {
    if (form.processoId && processos.length > 0) {
      const processo = processos.find(p => p.id === form.processoId);
      setSubprocessos(processo?.subprocessos || []);
    } else {
      setSubprocessos([]);
    }
  }, [form.processoId, processos]);

  useEffect(() => {
    if (form.subprocessoId && subprocessos.length > 0) {
      const subprocesso = subprocessos.find(s => s.id === form.subprocessoId);
      setServicos(subprocesso?.servicos || []);
    } else {
      setServicos([]);
    }
  }, [form.subprocessoId, subprocessos]);

  // Buscar dados atuais quando é edição
  useEffect(() => {
    if (form.modo === "edicao" && form.servicoId && servicos.length > 0) {
      const servicoAtual = servicos.find(s => s.id === form.servicoId);
      if (servicoAtual) {
        console.log("🔍 NovaSugestao - Serviço atual encontrado:", servicoAtual);
        setForm(prev => ({
          ...prev,
          dadosAtuais: {
            nome: servicoAtual.produto || servicoAtual.nome,
            descricao: servicoAtual.descricao || servicoAtual.o_que_e,
            quem_pode_utilizar: servicoAtual.quem_pode_utilizar,
            tempo_medio: servicoAtual.tempo_medio,
            unidade_medida: servicoAtual.unidade_medida,
            sla: servicoAtual.sla,
            sli: servicoAtual.sli,
            demanda_rotina: servicoAtual.demanda_rotina,
            requisitos_operacionais: servicoAtual.requisitos_operacionais,
            observacoes: servicoAtual.observacoes
          }
        }));
      }
    }
  }, [form.modo, form.servicoId, servicos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar uma sugestão.",
        variant: "destructive"
      });
      return;
    }

    console.log("Iniciando envio de sugestão...");
    console.log("Usuário:", user.id);
    console.log("Form:", form);

    try {
      // Buscar informações da área, processo, subprocesso e serviço selecionados
      const areaInfo = areas?.find(a => a.id === form.areaId);
      const processoInfo = processos.find(p => p.id === form.processoId);
      const subprocessoInfo = subprocessos.find(s => s.id === form.subprocessoId);
      const servicoInfo = servicos.find(s => s.id === form.servicoId);

      const sugestaoData = {
        tipo: form.modo === "novo" ? "novo" : "edicao",
        modo: form.modo,
        dados_sugeridos: {
          modo: form.modo,
          escopo: form.escopo,
          area_id: form.areaId,
          processo_id: form.processoId,
          subprocesso_id: form.subprocessoId,
          servico_id: form.servicoId,
          nome: form.nome,
          descricao: form.descricao,
          // Adicionar informações para exibição
          area: areaInfo?.nome || '',
          processo: processoInfo?.nome || '',
          subprocesso: subprocessoInfo?.nome || '',
          servico: servicoInfo?.nome || '',
          produto: form.nome, // Para compatibilidade com a exibição
          oQueE: form.descricao, // Para compatibilidade com a exibição
          dados_atuais: form.dadosAtuais
        },
        dados_atuais: form.dadosAtuais || {},
        justificativa: form.justificativa
      };

      console.log("Dados da sugestão:", sugestaoData);

      await createSugestao.mutateAsync(sugestaoData);
      console.log("Sugestão enviada com sucesso!");
      
      toast({
        title: "Sugestão enviada",
        description: "Sua sugestão foi enviada com sucesso e será analisada pelos administradores.",
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar sugestão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEscopoChange = (escopo: SugestaoScope) => {
    setForm(prev => ({
      ...prev,
      escopo,
      processoId: undefined,
      subprocessoId: undefined,
      servicoId: undefined,
      nome: "",
      descricao: "",
      dadosAtuais: undefined
    }));
  };

  const handleItemSelect = async (itemId: string, itemType: string) => {
    if (form.modo === "edicao") {
      // Carregar dados atuais do item selecionado
      try {
        let dadosAtuais;
        
        switch (itemType) {
          case "area":
            dadosAtuais = areas?.find(a => a.id === itemId);
            break;
          case "processo":
            dadosAtuais = processos.find(p => p.id === itemId);
            break;
          case "subprocesso":
            dadosAtuais = subprocessos.find(s => s.id === itemId);
            break;
          case "servico":
            dadosAtuais = servicos.find(s => s.id === itemId);
            break;
        }

        setForm(prev => ({
          ...prev,
          [`${itemType}Id`]: itemId,
          nome: dadosAtuais?.nome || "",
          descricao: dadosAtuais?.descricao || "",
          dadosAtuais
        }));
      } catch (error) {
        console.error("Erro ao carregar dados atuais:", error);
      }
    } else {
      setForm(prev => ({
        ...prev,
        [`${itemType}Id`]: itemId
      }));
    }
  };

  const getEscopoLabel = (escopo: SugestaoScope) => {
    switch (escopo) {
      case "area": return "Área";
      case "processo": return "Processo";
      case "subprocesso": return "Subprocesso";
      case "servico": return "Serviço";
      default: return escopo;
    }
  };

  const isFormValid = () => {
    const requiredFields = ["nome", "descricao", "justificativa"];
    const hasRequiredFields = requiredFields.every(field => 
      form[field as keyof FormData] && 
      String(form[field as keyof FormData]).trim() !== ""
    );

    if (form.modo === "novo") {
      // Para criação, verificar hierarquia baseada no escopo
      let hasRequiredHierarchy = true;
      
      if (form.escopo === "area") {
        // Para criar área, não precisa selecionar nada na hierarquia
        hasRequiredHierarchy = true;
      } else if (form.escopo === "processo") {
        // Para criar processo, precisa selecionar área
        hasRequiredHierarchy = !!form.areaId;
      } else if (form.escopo === "subprocesso") {
        // Para criar subprocesso, precisa selecionar área e processo
        hasRequiredHierarchy = !!form.areaId && !!form.processoId;
      } else if (form.escopo === "servico") {
        // Para criar serviço, precisa selecionar área, processo e subprocesso (NÃO serviço!)
        hasRequiredHierarchy = !!form.areaId && !!form.processoId && !!form.subprocessoId;
      }
      
      const isValid = hasRequiredFields && hasRequiredHierarchy;
      console.log("isFormValid - Criação:", { 
        hasRequiredFields, 
        hasRequiredHierarchy, 
        isValid,
        escopo: form.escopo,
        areaId: form.areaId,
        processoId: form.processoId,
        subprocessoId: form.subprocessoId
      });
      return isValid;
    } else {
      // Para edição, verificar se o item-alvo foi selecionado baseado no escopo
      let hasTargetItem = false;
      
      if (form.escopo === "area") {
        hasTargetItem = !!form.areaId;
      } else if (form.escopo === "processo") {
        hasTargetItem = !!form.processoId;
      } else if (form.escopo === "subprocesso") {
        hasTargetItem = !!form.subprocessoId;
      } else if (form.escopo === "servico") {
        hasTargetItem = !!form.servicoId;
      }
      
      const isValid = hasRequiredFields && hasTargetItem;
      console.log("isFormValid - Edição:", { hasRequiredFields, hasTargetItem, isValid });
      return isValid;
    }
  };

  // Função para obter mensagem de validação específica
  const getValidationMessage = () => {
    if (form.modo === "criacao" && form.escopo === "servico") {
      if (!form.areaId) return "Selecione uma área";
      if (!form.processoId) return "Selecione um processo";
      if (!form.subprocessoId) return "Selecione um subprocesso";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <div onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </div>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-4">
              {form.modo === "criacao" ? "Nova Sugestão" : "Editar Item"}
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {form.modo === "criacao" 
                ? "Sugira a criação de novos itens no catálogo de serviços."
                : "Sugira melhorias para itens existentes no catálogo."
              }
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                {form.modo === "criacao" ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                <span>Formulário de Sugestão</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Preencha os campos abaixo para enviar sua sugestão
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Sugestão */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
                    <Info className="h-5 w-5" />
                    Tipo de Sugestão
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={form.modo === "criacao" ? "default" : "outline"}
                      onClick={() => setForm(prev => ({ ...prev, modo: "criacao" }))}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-black">Novo Item</span>
                      <span className="text-xs text-gray-600">Sugerir criação de novo item</span>
                    </Button>
                    <Button
                      type="button"
                      variant={form.modo === "edicao" ? "default" : "outline"}
                      onClick={() => setForm(prev => ({ ...prev, modo: "edicao" }))}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Edit className="h-6 w-6" />
                      <span className="text-black">Edição</span>
                      <span className="text-xs text-gray-600">Sugerir melhorias em item existente</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Escopo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
                    <FileText className="h-5 w-5" />
                    Escopo da Sugestão
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-black">Escopo</Label>
                      <Select 
                        value={form.escopo} 
                        onValueChange={handleEscopoChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="area">Área</SelectItem>
                          <SelectItem value="processo">Processo</SelectItem>
                          <SelectItem value="subprocesso">Subprocesso</SelectItem>
                          <SelectItem value="servico">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Hierarquia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Hierarquia</h3>
                  
                  {/* Para criação: mostrar campos baseados no escopo */}
                  {form.modo === "criacao" && (
                    <>
                      {form.escopo !== "area" && (
                        <div className="space-y-2">
                          <Label className="text-black">Área *</Label>
                          <Select 
                            value={form.areaId || ""} 
                            onValueChange={(value) => handleItemSelect(value, "area")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma área" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas?.map(area => (
                                <SelectItem key={area.id} value={area.id}>
                                  {area.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {form.escopo !== "processo" && form.escopo !== "area" && (
                        <div className="space-y-2">
                          <Label className="text-black">Processo *</Label>
                          <Select 
                            value={form.processoId || ""} 
                            onValueChange={(value) => handleItemSelect(value, "processo")}
                            disabled={!form.areaId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um processo" />
                            </SelectTrigger>
                            <SelectContent>
                              {processos.map(processo => (
                                <SelectItem key={processo.id} value={processo.id}>
                                  {processo.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {form.escopo !== "subprocesso" && form.escopo !== "processo" && form.escopo !== "area" && (
                        <div className="space-y-2">
                          <Label className="text-black">Subprocesso *</Label>
                          <Select 
                            value={form.subprocessoId || ""} 
                            onValueChange={(value) => handleItemSelect(value, "subprocesso")}
                            disabled={!form.processoId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um subprocesso" />
                            </SelectTrigger>
                            <SelectContent>
                              {subprocessos.map(subprocesso => (
                                <SelectItem key={subprocesso.id} value={subprocesso.id}>
                                  {subprocesso.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                                             {/* Para criação de serviço, NÃO mostrar campo de seleção de serviço */}
                       {/* O serviço será criado, não selecionado */}
                    </>
                  )}

                  {/* Para edição: mostrar apenas o campo do escopo selecionado */}
                  {form.modo === "edicao" && (
                    <>
                      {form.escopo === "area" && (
                        <div className="space-y-2">
                          <Label className="text-black">Área a Editar *</Label>
                          <Select 
                            value={form.areaId || ""} 
                            onValueChange={(value) => handleItemSelect(value, "area")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma área" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas?.map(area => (
                                <SelectItem key={area.id} value={area.id}>
                                  {area.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {form.escopo === "processo" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-black">Área *</Label>
                            <Select 
                              value={form.areaId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "area")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma área" />
                              </SelectTrigger>
                              <SelectContent>
                                {areas?.map(area => (
                                  <SelectItem key={area.id} value={area.id}>
                                    {area.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Processo a Editar *</Label>
                            <Select 
                              value={form.processoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "processo")}
                              disabled={!form.areaId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um processo" />
                              </SelectTrigger>
                              <SelectContent>
                                {processos.map(processo => (
                                  <SelectItem key={processo.id} value={processo.id}>
                                    {processo.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {form.escopo === "subprocesso" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-black">Área *</Label>
                            <Select 
                              value={form.areaId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "area")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma área" />
                              </SelectTrigger>
                              <SelectContent>
                                {areas?.map(area => (
                                  <SelectItem key={area.id} value={area.id}>
                                    {area.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Processo *</Label>
                            <Select 
                              value={form.processoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "processo")}
                              disabled={!form.areaId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um processo" />
                              </SelectTrigger>
                              <SelectContent>
                                {processos.map(processo => (
                                  <SelectItem key={processo.id} value={processo.id}>
                                    {processo.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Subprocesso a Editar *</Label>
                            <Select 
                              value={form.subprocessoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "subprocesso")}
                              disabled={!form.processoId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um subprocesso" />
                              </SelectTrigger>
                              <SelectContent>
                                {subprocessos.map(subprocesso => (
                                  <SelectItem key={subprocesso.id} value={subprocesso.id}>
                                    {subprocesso.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {form.escopo === "servico" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-black">Área *</Label>
                            <Select 
                              value={form.areaId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "area")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma área" />
                              </SelectTrigger>
                              <SelectContent>
                                {areas?.map(area => (
                                  <SelectItem key={area.id} value={area.id}>
                                    {area.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Processo *</Label>
                            <Select 
                              value={form.processoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "processo")}
                              disabled={!form.areaId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um processo" />
                              </SelectTrigger>
                              <SelectContent>
                                {processos.map(processo => (
                                  <SelectItem key={processo.id} value={processo.id}>
                                    {processo.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Subprocesso *</Label>
                            <Select 
                              value={form.subprocessoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "subprocesso")}
                              disabled={!form.processoId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um subprocesso" />
                              </SelectTrigger>
                              <SelectContent>
                                {subprocessos.map(subprocesso => (
                                  <SelectItem key={subprocesso.id} value={subprocesso.id}>
                                    {subprocesso.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black">Serviço a Editar *</Label>
                            <Select 
                              value={form.servicoId || ""} 
                              onValueChange={(value) => handleItemSelect(value, "servico")}
                              disabled={!form.subprocessoId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um serviço" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicos.map(servico => (
                                  <SelectItem key={servico.id} value={servico.id}>
                                    {servico.produto}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <Separator />

                {/* Dados do Item */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Dados do {getEscopoLabel(form.escopo)}</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-black">Nome *</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder={`Nome do ${getEscopoLabel(form.escopo).toLowerCase()}`}
                      className="text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black">Descrição *</Label>
                    <Textarea
                      value={form.descricao}
                      onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder={`Descrição do ${getEscopoLabel(form.escopo).toLowerCase()}`}
                      rows={3}
                      className="text-black"
                    />
                  </div>

                   {/* Campos específicos para serviços */}
                   {form.escopo === "servico" && (
                     <>
                       <div className="space-y-2">
                         <Label className="text-black">Quem pode utilizar</Label>
                         <Input
                           value={form.quem_pode_utilizar || ""}
                           onChange={(e) => setForm(prev => ({ ...prev, quem_pode_utilizar: e.target.value }))}
                           placeholder="Quem pode utilizar este serviço?"
                           className="text-black"
                         />
                       </div>
                     </>
                   )}

                   {/* Dados Atuais (apenas para edição) */}
                   {form.modo === "edicao" && form.dadosAtuais && (
                     <div className="space-y-2">
                       <Label className="text-black">Dados Atuais</Label>
                       <Card className="bg-muted/50">
                         <CardContent className="p-4">
                           <div className="space-y-2">
                             <div>
                               <span className="font-medium text-black">Nome:</span> {form.dadosAtuais.nome}
                             </div>
                             <div>
                               <span className="font-medium text-black">Descrição:</span> {form.dadosAtuais.descricao}
                             </div>
                             {form.escopo === "servico" && form.dadosAtuais.quem_pode_utilizar && (
                               <div>
                                 <span className="font-medium text-black">Quem pode utilizar:</span> {form.dadosAtuais.quem_pode_utilizar}
                               </div>
                             )}
                             {form.escopo === "servico" && form.dadosAtuais.tempo_medio && (
                               <div>
                                 <span className="font-medium text-black">Tempo médio:</span> {form.dadosAtuais.tempo_medio} {form.dadosAtuais.unidade_medida}
                               </div>
                             )}
                             {form.escopo === "servico" && form.dadosAtuais.sla && (
                               <div>
                                 <span className="font-medium text-black">SLA:</span> {form.dadosAtuais.sla} horas
                               </div>
                             )}
                             {form.escopo === "servico" && form.dadosAtuais.demanda_rotina && (
                               <div>
                                 <span className="font-medium text-black">Tipo de demanda:</span> {form.dadosAtuais.demanda_rotina}
                               </div>
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     </div>
                   )}

                   {/* Campos Avançados para Serviços */}
                   {form.escopo === "servico" && (
                     <>
                       <Separator />
                       <h4 className="text-lg font-semibold text-black">Informações Avançadas</h4>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="tempo_medio">Tempo Médio</Label>
                           <Input
                             id="tempo_medio"
                             type="number"
                             value={form.tempo_medio || ''}
                             onChange={(e) => setForm(prev => ({ ...prev, tempo_medio: e.target.value ? parseInt(e.target.value) : undefined }))}
                             className="text-black"
                           />
                         </div>
                         <div>
                           <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                           <Select
                             value={form.unidade_medida || ''}
                             onValueChange={(value) => setForm(prev => ({ ...prev, unidade_medida: value }))}
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="Selecione" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="Minutos">Minutos</SelectItem>
                               <SelectItem value="Horas">Horas</SelectItem>
                               <SelectItem value="Dias">Dias</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="sla">SLA (horas)</Label>
                           <Input
                             id="sla"
                             type="number"
                             value={form.sla || ''}
                             onChange={(e) => setForm(prev => ({ ...prev, sla: e.target.value ? parseInt(e.target.value) : undefined }))}
                             className="text-black"
                           />
                         </div>
                         <div>
                           <Label htmlFor="sli">SLI (%)</Label>
                           <Input
                             id="sli"
                             type="number"
                             step="0.01"
                             value={form.sli || ''}
                             onChange={(e) => setForm(prev => ({ ...prev, sli: e.target.value ? parseFloat(e.target.value) : undefined }))}
                             className="text-black"
                           />
                         </div>
                       </div>
                       
                       <div>
                         <Label htmlFor="demanda_rotina">Tipo de Demanda</Label>
                         <Select
                           value={form.demanda_rotina || ''}
                           onValueChange={(value) => setForm(prev => ({ ...prev, demanda_rotina: value }))}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Selecione" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="Demanda">Demanda</SelectItem>
                             <SelectItem value="Rotina">Rotina</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       
                       <div>
                         <Label htmlFor="requisitos_operacionais">Requisitos Operacionais</Label>
                         <Textarea
                           id="requisitos_operacionais"
                           value={form.requisitos_operacionais || ''}
                           onChange={(e) => setForm(prev => ({ ...prev, requisitos_operacionais: e.target.value }))}
                           className="text-black"
                         />
                       </div>
                       
                       <div>
                         <Label htmlFor="observacoes">Observações</Label>
                         <Textarea
                           id="observacoes"
                           value={form.observacoes || ''}
                           onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                           className="text-black"
                         />
                       </div>
                     </>
                   )}
                </div>

                <Separator />

                {/* Justificativa */}
                <div className="space-y-2">
                  <Label className="text-black">Justificativa *</Label>
                  <Textarea
                    value={form.justificativa}
                    onChange={(e) => setForm(prev => ({ ...prev, justificativa: e.target.value }))}
                    placeholder="Explique por que esta sugestão é importante..."
                    rows={4}
                    className="text-black"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </Button>
                  <div className="flex flex-col gap-2">
                    {getValidationMessage() && (
                      <p className="text-sm text-red-600">{getValidationMessage()}</p>
                    )}
                    <Button 
                      type="submit" 
                      disabled={!isFormValid() || isSubmitting}
                      onClick={() => console.log("Botão Enviar Sugestão clicado")}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-black">Sugestão Enviada!</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Sua sugestão foi enviada com sucesso e está sendo analisada pela equipe.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Voltar
              </Button>
              <Button onClick={() => navigate('/minhas-sugestoes')}>
                Ver Minhas Sugestões
              </Button>
              <Button onClick={() => {
                setShowSuccessModal(false);
                setForm({
                  modo: "criacao",
                  escopo: "area",
                  nome: "",
                  descricao: "",
                  justificativa: ""
                });
              }}>
                Nova Sugestão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
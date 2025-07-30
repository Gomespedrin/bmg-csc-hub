import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
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

type SugestaoMode = "criacao" | "edicao";
type SugestaoScope = "area" | "processo" | "subprocesso" | "servico";

interface SugestaoForm {
  modo: SugestaoMode;
  escopo: SugestaoScope;
  areaId?: string;
  processoId?: string;
  subprocessoId?: string;
  servicoId?: string;
  nome: string;
  descricao: string;
  justificativa: string;
  dadosAtuais?: any;
}

export default function NovaSugestao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: areas } = useAreas();
  const createSugestao = useCreateSugestao();
  
  const [form, setForm] = useState<SugestaoForm>({
    modo: "criacao",
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
      const sugestaoData = {
        tipo: form.modo === "criacao" ? "novo" : "edicao",
        modo: form.modo, // Adicionar o campo modo
        dados_sugeridos: {
          modo: form.modo,
          escopo: form.escopo,
          area_id: form.areaId,
          processo_id: form.processoId,
          subprocesso_id: form.subprocessoId,
          servico_id: form.servicoId,
          nome: form.nome,
          descricao: form.descricao,
          dados_atuais: form.dadosAtuais
        },
        dados_atuais: form.dadosAtuais || {}, // Adicionar dados_atuais no nível raiz
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
      form[field as keyof SugestaoForm] && 
      String(form[field as keyof SugestaoForm]).trim() !== ""
    );

    if (form.modo === "criacao") {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
                  <Button 
                    type="submit" 
                    disabled={!isFormValid() || isSubmitting}
                    onClick={() => console.log("Botão Enviar Sugestão clicado")}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
                  </Button>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Voltar
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
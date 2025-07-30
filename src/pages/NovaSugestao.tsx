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
import { ArrowLeft, Plus, Edit, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useAreas, useAreaById } from "@/hooks/useAreas";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: areas } = useAreas();
  
  const [form, setForm] = useState<SugestaoForm>({
    modo: "criacao",
    escopo: "area",
    nome: "",
    descricao: "",
    justificativa: ""
  });
  
  const { data: areaCompleta } = useAreaById(form.areaId || "");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      const sugestaoData = {
        tipo: `${form.modo}_${form.escopo}`,
        criado_por: "usuario_atual", // TODO: Implementar autenticação
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
        justificativa: form.justificativa,
        status: "pendente",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("sugestoes")
        .insert([sugestaoData]);

      if (error) {
        console.error("Erro ao salvar sugestão:", error);
        throw error;
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      alert("Erro ao enviar sugestão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
      // Para criação, os níveis superiores são obrigatórios
      const hasRequiredHierarchy = form.areaId && 
        (form.escopo === "area" || form.processoId) &&
        (form.escopo === "processo" || form.subprocessoId) &&
        (form.escopo === "subprocesso" || form.servicoId);
      
      return hasRequiredFields && hasRequiredHierarchy;
    } else {
      // Para edição, apenas o item-alvo é obrigatório
      const hasTargetItem = form.areaId || form.processoId || form.subprocessoId || form.servicoId;
      return hasRequiredFields && hasTargetItem;
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
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {form.modo === "criacao" ? "Nova Sugestão" : "Editar Item"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <CardTitle className="flex items-center space-x-2">
                {form.modo === "criacao" ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                <span>Formulário de Sugestão</span>
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para enviar sua sugestão
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Modo e Escopo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Modo</Label>
                    <Select 
                      value={form.modo} 
                      onValueChange={(value: SugestaoMode) => setForm(prev => ({ ...prev, modo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="criacao">
                          <div className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Criação</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="edicao">
                          <div className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>Edição</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Escopo</Label>
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

                <Separator />

                {/* Hierarquia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hierarquia</h3>
                  
                  {/* Área */}
                  <div className="space-y-2">
                    <Label>Área {form.modo === "criacao" && form.escopo !== "area" && "*"}</Label>
                    <Select 
                      value={form.areaId || ""} 
                      onValueChange={(value) => handleItemSelect(value, "area")}
                      disabled={false}
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

                  {/* Processo */}
                  {form.escopo !== "area" && (
                    <div className="space-y-2">
                      <Label>Processo {form.modo === "criacao" && form.escopo !== "processo" && "*"}</Label>
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

                  {/* Subprocesso */}
                  {form.escopo !== "area" && form.escopo !== "processo" && (
                    <div className="space-y-2">
                      <Label>Subprocesso {form.modo === "criacao" && form.escopo !== "subprocesso" && "*"}</Label>
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

                  {/* Serviço */}
                  {form.escopo === "servico" && (
                    <div className="space-y-2">
                      <Label>Serviço {form.modo === "criacao" && "*"}</Label>
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
                  )}
                </div>

                <Separator />

                {/* Dados do Item */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados do {getEscopoLabel(form.escopo)}</h3>
                  
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder={`Nome do ${getEscopoLabel(form.escopo).toLowerCase()}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      value={form.descricao}
                      onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder={`Descrição do ${getEscopoLabel(form.escopo).toLowerCase()}`}
                      rows={3}
                    />
                  </div>

                  {/* Dados Atuais (apenas para edição) */}
                  {form.modo === "edicao" && form.dadosAtuais && (
                    <div className="space-y-2">
                      <Label>Dados Atuais</Label>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Nome:</span> {form.dadosAtuais.nome}
                            </div>
                            {form.dadosAtuais.descricao && (
                              <div>
                                <span className="font-medium">Descrição:</span> {form.dadosAtuais.descricao}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Justificativa */}
                <div className="space-y-2">
                  <Label>Justificativa *</Label>
                  <Textarea
                    value={form.justificativa}
                    onChange={(e) => setForm(prev => ({ ...prev, justificativa: e.target.value }))}
                    placeholder="Explique o motivo da sua sugestão..."
                    rows={4}
                  />
                </div>

                {/* Submit */}
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
                <span>Sugestão Enviada!</span>
              </DialogTitle>
              <DialogDescription>
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
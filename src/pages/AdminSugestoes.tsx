import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, Eye, Clock, FileText } from "lucide-react";
import { useSugestoes, useUpdateSugestao } from "@/hooks/useSugestoes";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AdminSugestoes() {
  const { toast } = useToast();
  const { data: sugestoes, isLoading } = useSugestoes();
  const updateSugestao = useUpdateSugestao();
  const [comentarioAdmin, setComentarioAdmin] = useState("");
  const [selectedSugestao, setSelectedSugestao] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'aprovada',
        comentario_admin: comentarioAdmin
      });
      
      toast({
        title: "Sugestão aprovada",
        description: "A sugestão foi aprovada com sucesso.",
      });
      
      setComentarioAdmin("");
      setSelectedSugestao(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar sugestão.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'rejeitada',
        comentario_admin: comentarioAdmin
      });
      
      toast({
        title: "Sugestão rejeitada",
        description: "A sugestão foi rejeitada.",
      });
      
      setComentarioAdmin("");
      setSelectedSugestao(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar sugestão.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'aprovada': { label: 'Aprovada', variant: 'default' as const },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Administração de Sugestões
            </h1>
            <p className="text-muted-foreground">
              Gerencie as sugestões enviadas pelos colaboradores
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {!sugestoes || sugestoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma sugestão encontrada
                </h3>
                <p className="text-muted-foreground text-center">
                  Não há sugestões para revisar no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            sugestoes.map((sugestao) => (
              <Card key={sugestao.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {sugestao.dados_sugeridos.produto}
                      </CardTitle>
                      <CardDescription>
                        {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria de Serviço'} • 
                        Enviado em {formatDate(sugestao.created_at)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(sugestao.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Área</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.area}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Processo</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.processo || 'Não informado'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p className="text-sm mt-1">{sugestao.dados_sugeridos.oQueE}</p>
                  </div>

                  {sugestao.justificativa && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Justificativa</Label>
                      <p className="text-sm mt-1">{sugestao.justificativa}</p>
                    </div>
                  )}

                  {sugestao.comentario_admin && (
                    <div className="bg-muted p-3 rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Comentário do Admin</Label>
                      <p className="text-sm mt-1">{sugestao.comentario_admin}</p>
                    </div>
                  )}

                  {sugestao.status === 'pendente' && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`comentario-${sugestao.id}`}>Comentário (opcional)</Label>
                          <Textarea
                            id={`comentario-${sugestao.id}`}
                            placeholder="Adicione um comentário sobre sua decisão..."
                            value={selectedSugestao === sugestao.id ? comentarioAdmin : ''}
                            onChange={(e) => {
                              setSelectedSugestao(sugestao.id);
                              setComentarioAdmin(e.target.value);
                            }}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="flex-1">
                                <Check className="mr-2 h-4 w-4" />
                                Aprovar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Aprovar Sugestão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja aprovar esta sugestão? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(sugestao.id)}>
                                  Confirmar Aprovação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1">
                                <X className="mr-2 h-4 w-4" />
                                Rejeitar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Sugestão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja rejeitar esta sugestão? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReject(sugestao.id)}>
                                  Confirmar Rejeição
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
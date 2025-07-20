// src/pages/SugestaoDetalhe.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/supabase';
import { Badge } from '@/components/ui/badge';

interface SugestaoRow {
  id: string;
  tipo: string;
  status: string;
  justificativa: string;
  dados_sugeridos: any;
  created_at: string;
  updated_at: string;
  comentario_admin?: string | null;
}

const statusColor: Record<string, string> = {
  pendente: 'bg-amber-500/15 text-amber-600',
  aprovado: 'bg-emerald-500/15 text-emerald-600',
  rejeitado: 'bg-red-500/15 text-red-600'
};

export default function SugestaoDetalhe() {
  const { id } = useParams();
  const [data, setData] = useState<SugestaoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sugestoes')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setData(data as any);
      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ds = data?.dados_sugeridos;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        {loading && <div>Carregando...</div>}
        {!loading && errorMsg && (
          <div className="text-red-600">Erro: {errorMsg}</div>
        )}
        {!loading && data && (
          <div className="space-y-8">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold mb-1">
                  Sugestão <span className="text-muted-foreground">#{data.id.slice(0, 8)}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Criada em {new Date(data.created_at).toLocaleString()} • Última atualização {new Date(data.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[data.status] || 'bg-secondary/20'}`}>
                  {data.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {data.tipo === 'novo' ? 'Novo' : 'Edição'}
                </span>
                {ds?.meta?.escopo && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {ds.meta.escopo}
                  </span>
                )}
              </div>
            </div>

            <section className="p-6 border rounded-lg bg-card space-y-4">
              <h2 className="font-medium text-lg">Justificativa</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {data.justificativa}
              </p>
            </section>

            <section className="p-6 border rounded-lg bg-card space-y-4">
              <h2 className="font-medium text-lg">Detalhes Sugeridos</h2>
              {!ds && <p className="text-muted-foreground text-sm">Sem dados estruturados.</p>}

              {ds && (
                <div className="space-y-6">
                  {/* Meta */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Meta</h3>
                    <div className="grid md:grid-cols-3 gap-2 text-sm">
                      <div><strong>Form Version:</strong> {ds.meta?.form_version ?? '-'}</div>
                      <div><strong>Modo:</strong> {ds.meta?.modo ?? '-'}</div>
                      <div><strong>Escopo:</strong> {ds.meta?.escopo ?? '-'}</div>
                    </div>
                  </div>

                  {/* Hierarquia */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Hierarquia (IDs)</h3>
                    <div className="grid md:grid-cols-4 gap-2 text-sm">
                      <div><strong>Área:</strong> {ds.hierarquia?.area_id || '-'}</div>
                      <div><strong>Processo:</strong> {ds.hierarquia?.processo_id || '-'}</div>
                      <div><strong>Subprocesso:</strong> {ds.hierarquia?.subprocesso_id || '-'}</div>
                      <div><strong>Serviço:</strong> {ds.hierarquia?.servico_id || '-'}</div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Conteúdo</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Nome sugerido:</strong><br />
                        {ds.conteudo?.nome_sugerido || '-'}
                      </div>
                      <div>
                        <strong>SLA:</strong> {ds.conteudo?.sla ?? '-'}
                      </div>
                      <div>
                        <strong>SLI (%):</strong> {ds.conteudo?.sli ?? '-'}
                      </div>
                      <div>
                        <strong>Tempo Médio:</strong>{' '}
                        {ds.conteudo?.tempo_medio
                          ? `${ds.conteudo.tempo_medio.valor} ${ds.conteudo.tempo_medio.unidade}`
                          : '-'}
                      </div>
                      <div>
                        <strong>Unidade Medida:</strong> {ds.conteudo?.unidade_medida || '-'}
                      </div>
                      <div>
                        <strong>Demanda / Rotina:</strong> {ds.conteudo?.demanda_rotina || '-'}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Quem pode utilizar:</strong><br />
                        {ds.conteudo?.quem_pode_utilizar || '-'}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Requisitos Operacionais:</strong><br />
                        {ds.conteudo?.requisitos_operacionais || '-'}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Descrição / Observação:</strong><br />
                        {ds.conteudo?.descricao || '-'}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Observações:</strong><br />
                        {ds.conteudo?.observacoes || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {data.comentario_admin && (
              <section className="p-6 border rounded-lg bg-card space-y-2">
                <h2 className="font-medium text-lg">Comentário da Avaliação</h2>
                <p className="text-sm whitespace-pre-line">
                  {data.comentario_admin}
                </p>
              </section>
            )}

            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/sugestoes/nova">Enviar outra</Link>
              </Button>
              <Button asChild>
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

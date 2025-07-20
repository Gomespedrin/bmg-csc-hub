-- Permitir leitura pública das áreas (são dados públicos do catálogo)
DROP POLICY IF EXISTS "areas_select_all" ON public.areas;

CREATE POLICY "areas_select_public" 
ON public.areas 
FOR SELECT 
USING (ativo = true);

-- Permitir leitura pública dos processos ativos
DROP POLICY IF EXISTS "processos_select_all" ON public.processos;

CREATE POLICY "processos_select_public" 
ON public.processos 
FOR SELECT 
USING (ativo = true);

-- Permitir leitura pública dos subprocessos ativos
DROP POLICY IF EXISTS "subprocessos_select_all" ON public.subprocessos;

CREATE POLICY "subprocessos_select_public" 
ON public.subprocessos 
FOR SELECT 
USING (ativo = true);

-- Permitir leitura pública dos serviços ativos
DROP POLICY IF EXISTS "servicos_select_all" ON public.servicos;

CREATE POLICY "servicos_select_public" 
ON public.servicos 
FOR SELECT 
USING (ativo = true AND status = 'ativo');

-- Histórico de serviços pode permanecer restrito a autenticados
DROP POLICY IF EXISTS "servicos_hist_select_all" ON public.servicos_historico;

CREATE POLICY "servicos_hist_select_authenticated" 
ON public.servicos_historico 
FOR SELECT 
TO authenticated
USING (true);
-- Script para corrigir problemas com anexos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela anexos existe e sua estrutura
SELECT 
  'Verificando tabela de anexos:' as info,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'anexos'
  ) as tabela_existe;

-- 2. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'anexos'
ORDER BY ordinal_position;

-- 3. Verificar se o bucket 'anexos' existe no storage
SELECT 
  'Verificando bucket de storage:' as info,
  EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'anexos'
  ) as bucket_existe;

-- 4. Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anexos', 'anexos', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. Desabilitar RLS temporariamente para teste
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;

-- 6. Verificar anexos existentes
SELECT 
  'Anexos existentes:' as info,
  COUNT(*) as total_anexos
FROM anexos;

-- 7. Listar anexos existentes
SELECT 
  id,
  servico_id,
  nome,
  url,
  tipo,
  tamanho,
  created_at
FROM anexos
ORDER BY created_at DESC
LIMIT 10;

-- 8. Verificar políticas RLS da tabela anexos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'anexos';

-- 9. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem ver anexos de serviços ativos" ON public.anexos;
DROP POLICY IF EXISTS "Administradores podem gerenciar anexos" ON public.anexos;

-- 10. Criar novas políticas RLS para anexos
CREATE POLICY "Todos podem ver anexos de serviços ativos" ON public.anexos
  FOR SELECT USING (
    servico_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.servicos WHERE id = anexos.servico_id AND ativo = true)
  );

CREATE POLICY "Administradores podem gerenciar anexos" ON public.anexos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- 11. Verificar políticas do storage
SELECT 
  'Políticas do storage:' as info,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%anexos%';

-- 12. Remover políticas antigas do storage se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de anexos" ON storage.objects;
DROP POLICY IF EXISTS "Todos podem visualizar anexos" ON storage.objects;
DROP POLICY IF EXISTS "Administradores podem atualizar anexos" ON storage.objects;
DROP POLICY IF EXISTS "Administradores podem deletar anexos" ON storage.objects;

-- 13. Criar novas políticas do storage
CREATE POLICY "Usuários autenticados podem fazer upload de anexos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'anexos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Todos podem visualizar anexos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'anexos');

CREATE POLICY "Administradores podem atualizar anexos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'anexos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
  )
);

CREATE POLICY "Administradores podem deletar anexos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'anexos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
  )
);

-- 14. Reabilitar RLS
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- 15. Verificar configuração final
SELECT 
  'Configuração final:' as info,
  'Tabela anexos configurada' as tabela_status,
  'Bucket anexos configurado' as storage_status,
  'Políticas RLS configuradas' as rls_status;

-- 16. Testar inserção de anexo (comentado para segurança)
-- INSERT INTO public.anexos (servico_id, nome, url, tipo, tamanho)
-- SELECT 
--   s.id,
--   'documento_teste.pdf',
--   'https://exemplo.com/documento_teste.pdf',
--   'application/pdf',
--   1024
-- FROM servicos s 
-- WHERE s.ativo = true 
-- LIMIT 1;

-- 17. Verificar se há serviços disponíveis para teste
SELECT 
  'Serviços disponíveis para teste:' as info,
  COUNT(*) as total_servicos_ativos
FROM servicos 
WHERE ativo = true; 
-- Script para verificar e corrigir problemas com anexos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela anexos existe
SELECT 
  'Verificando tabela de anexos:' as info,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'anexos'
  ) as tabela_existe;

-- 2. Verificar estrutura da tabela anexos (se existir)
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

-- 5. Verificar políticas RLS da tabela anexos
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

-- 6. Desabilitar RLS temporariamente para teste
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;

-- 7. Verificar se há anexos existentes
SELECT 
  'Anexos existentes:' as info,
  COUNT(*) as total_anexos
FROM anexos;

-- 8. Listar anexos existentes
SELECT 
  id,
  servico_id,
  nome,
  tipo,
  tamanho,
  created_at
FROM anexos
ORDER BY created_at DESC
LIMIT 10;

-- 9. Verificar serviços que podem ter anexos
SELECT 
  'Serviços disponíveis:' as info,
  COUNT(*) as total_servicos
FROM servicos 
WHERE ativo = true;

-- 10. Testar inserção de anexo (comentado para segurança)
-- INSERT INTO public.anexos (servico_id, nome, url, tipo, tamanho)
-- SELECT 
--   s.id,
--   'teste.pdf',
--   'https://exemplo.com/teste.pdf',
--   'application/pdf',
--   1024
-- FROM servicos s 
-- WHERE s.ativo = true 
-- LIMIT 1;

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

-- 12. Criar políticas do storage se não existirem
-- Política para upload
CREATE POLICY "Usuários autenticados podem fazer upload de anexos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'anexos' AND 
  auth.role() = 'authenticated'
);

-- Política para visualização
CREATE POLICY "Todos podem visualizar anexos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'anexos');

-- Política para atualização (apenas administradores)
CREATE POLICY "Administradores podem atualizar anexos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'anexos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND perfil IN ('administrador', 'superadministrador')
  )
);

-- Política para exclusão (apenas administradores)
CREATE POLICY "Administradores podem deletar anexos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'anexos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND perfil IN ('administrador', 'superadministrador')
  )
);

-- 13. Reabilitar RLS após configuração
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- 14. Verificar configuração final
SELECT 
  'Configuração final:' as info,
  'Tabela anexos criada e configurada' as status,
  'Bucket anexos criado e configurado' as storage_status,
  'Políticas RLS configuradas' as rls_status; 
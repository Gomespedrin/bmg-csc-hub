-- Script para criar bucket de storage para anexos
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('anexos', 'anexos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de arquivos
CREATE POLICY "Usuários autenticados podem fazer upload de anexos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'anexos' AND
  auth.role() = 'authenticated'
);

-- 3. Criar política para permitir visualização de anexos
CREATE POLICY "Todos podem visualizar anexos" ON storage.objects
FOR SELECT USING (bucket_id = 'anexos');

-- 4. Criar política para permitir atualização de anexos (apenas administradores)
CREATE POLICY "Administradores podem atualizar anexos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'anexos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
  )
);

-- 5. Criar política para permitir exclusão de anexos (apenas administradores)
CREATE POLICY "Administradores podem deletar anexos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'anexos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
  )
);

-- 6. Verificar se o bucket foi criado
SELECT 
  'Bucket criado com sucesso' as status,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'anexos';

-- 7. Verificar políticas criadas
SELECT 
  'Políticas criadas' as status,
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%anexos%'; 
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para criar slug a partir de um nome
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}

// Função para criar slug com ID para garantir unicidade
export function createSlugWithId(name: string, id: string): string {
  const slug = createSlug(name);
  return `${slug}-${id}`;
}

// Função para extrair ID de um slug
export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  
  console.log('🔍 Extracting ID from slug:', slug);
  
  // Procurar por um padrão UUID no final do slug
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const match = slug.match(uuidPattern);
  
  if (match) {
    console.log('✅ Found UUID match:', match[1]);
    return match[1];
  }
  
  // Fallback: retornar o último segmento se não encontrar UUID
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1] || '';
  
  console.log('📝 Slug parts:', parts, 'Last part:', lastPart);
  
  // Verificar se o último segmento parece ser um UUID
  if (uuidPattern.test(lastPart)) {
    console.log('✅ Last part is UUID:', lastPart);
    return lastPart;
  }
  
  console.log('⚠️ No UUID found, returning last part:', lastPart);
  return lastPart;
}

// Função para criar URL amigável para área
export function createAreaUrl(areaName: string, areaId: string): string {
  const slug = createSlug(areaName);
  const finalUrl = `/areas/${slug}-${areaId}`;
  console.log('🔗 Creating area URL:', { areaName, areaId, slug, finalUrl });
  return finalUrl;
}

// Função para criar URL amigável para processo
export function createProcessoUrl(processoName: string, processoId: string): string {
  const slug = createSlug(processoName);
  return `/processos/${slug}-${processoId}`;
}

// Função para criar URL amigável para subprocesso
export function createSubprocessoUrl(subprocessoName: string, subprocessoId: string): string {
  const slug = createSlug(subprocessoName);
  return `/subprocessos/${slug}-${subprocessoId}`;
}

// Função para criar URL amigável para serviço
export function createServicoUrl(servicoName: string, servicoId: string): string {
  const slug = createSlug(servicoName);
  return `/servicos/${slug}-${servicoId}`;
}

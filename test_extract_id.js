// Teste da função extractIdFromSlug
function createSlug(name) {
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

function extractIdFromSlug(slug) {
  if (!slug) return '';
  
  // Procurar por um padrão UUID no final do slug
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const match = slug.match(uuidPattern);
  
  if (match) {
    return match[1];
  }
  
  // Fallback: retornar o último segmento se não encontrar UUID
  const parts = slug.split('-');
  return parts[parts.length - 1] || '';
}

function createAreaUrl(areaName, areaId) {
  const slug = createSlug(areaName);
  return `/areas/${slug}-${areaId}`;
}

// Testes
const testCases = [
  {
    name: "Recursos Humanos",
    id: "e91b6c65-4dda-41cf-af74-86ad7b8cd64f"
  },
  {
    name: "Financeiro",
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  {
    name: "Compras",
    id: "12345678-1234-5678-9012-123456789012"
  }
];

console.log("🧪 Testando extração de IDs:");
testCases.forEach(testCase => {
  const url = createAreaUrl(testCase.name, testCase.id);
  const extractedId = extractIdFromSlug(url.split('/').pop());
  
  console.log(`\nÁrea: ${testCase.name}`);
  console.log(`ID Original: ${testCase.id}`);
  console.log(`URL Gerada: ${url}`);
  console.log(`ID Extraído: ${extractedId}`);
  console.log(`✅ Match: ${testCase.id === extractedId ? 'SIM' : 'NÃO'}`);
}); 
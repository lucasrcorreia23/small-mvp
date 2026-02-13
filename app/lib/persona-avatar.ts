/**
 * Gera URL de avatar consistente com persona: modernos 25-50 anos,
 * coerente com gênero do nome (mulher para mulher, homem para homem).
 * Usa randomuser.me/portraits que tem fotos masculinas e femininas.
 */

const FEMALE_FIRST_NAMES = new Set([
  'maria', 'ana', 'marina', 'julia', 'fernanda', 'patricia', 'sandra', 'carla', 'andreia', 'paula',
  'camila', 'rafaela', 'leticia', 'bruna', 'amanda', 'carolina', 'isabela', 'beatriz', 'lucia',
  'elena', 'sophia', 'sophie', 'helena', 'valentina', 'luiza', 'gabriela', 'larissa', 'renata',
]);

const MALE_FIRST_NAMES = new Set([
  'ricardo', 'joao', 'josé', 'carlos', 'paulo', 'marcos', 'pedro', 'lucas', 'rafael', 'felipe',
  'bruno', 'andré', 'thiago', 'leonardo', 'rodrigo', 'gustavo', 'marcelo', 'daniel', 'miguel',
  'gabriel', 'arthur', 'davi', 'bernardo', 'enzo', 'murilo', 'henrique', 'eduardo', 'vinicius',
]);

function inferGender(firstName: string): 'male' | 'female' {
  const normalized = firstName.toLowerCase().trim();
  if (FEMALE_FIRST_NAMES.has(normalized)) return 'female';
  if (MALE_FIRST_NAMES.has(normalized)) return 'male';
  // Fallback: common Portuguese suffix -a often female (Maria, Ana), but not always
  if (normalized.endsWith('a') && !normalized.endsWith('ia') && normalized.length > 3) {
    return 'female';
  }
  return 'male';
}

/** Hash simples para id determinístico (0-98) */
function hashToId(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 99;
}

/**
 * Retorna URL de avatar para persona.
 * @param agentId - ID do agente (para consistência extra)
 * @param personaName - Nome completo da persona (ex: "Marina Silva")
 */
export function getPersonaAvatarUrl(agentId: number, personaName: string): string {
  const parts = personaName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'person';
  const gender = inferGender(firstName);
  const id = hashToId(`${agentId}-${personaName}`);
  const folder = gender === 'female' ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${folder}/${id}.jpg`;
}

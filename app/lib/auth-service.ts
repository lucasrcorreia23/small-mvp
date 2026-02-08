/**
 * Servico de autenticacao
 * MOCK: NEXT_PUBLIC_USE_MOCK_AUTH=true usa mock; caso contrario usa API (NEXT_PUBLIC_API_BASE_URL)
 */

const MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

/** Chave do localStorage para o token JWT (fluxo: localStorage.setItem('token', data.token)) */
const TOKEN_KEY = 'token';

/** Payload para Auth API POST /auth/create_user — { name, email, password } required */
export interface SignupData {
  name: string;
  email: string;
  password: string;
  nickname?: string;
  gender_slug?: string;
  cell_phone?: string;
}

/** Payload para Auth API POST /auth/create_organization (requer token) */
export interface CreateOrganizationInput {
  cnpj: number;
  name: string;
  url: string;
  official_name?: string;
  description?: string;
}

/** Output da Auth API POST /auth/create_organization — { organization_name, organization_id, new_token } */
export interface CreateOrganizationOutput {
  organization_name: string;
  organization_id: number;
  /** Objeto com mesma estrutura do Login Output: { access_token, token_type, user_scope } */
  new_token: Record<string, unknown>;
}

/** Output da Auth API POST /auth/create_user — { id, name, email } */
export interface User {
  id: number;
  name: string;
  email: string;
}

/** UserScope retornado pela Auth API no login */
export interface UserScope {
  user_id: number;
  email: string;
  name: string;
  email_checked: boolean;
  organization_id: number | null;
  organization_is_active: boolean | null;
  organization_resources: Record<string, unknown>[] | null;
  required_change_password: boolean;
  is_active: boolean;
  superadmin: boolean;
  resources: Record<string, unknown>[];
  groups: string[];
}

/** Output da Auth API POST /auth/login — { access_token, token_type, user_scope } */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_scope: UserScope;
}

export interface AgentLinkResponse {
  signed_url: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Remove prefixo "Bearer " duplicado do token (caso o backend retorne "Bearer eyJ...").
 * Retorna null se o valor for vazio/inválido.
 */
function sanitizeToken(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  let t = raw.trim();
  if (t.toLowerCase().startsWith('bearer ')) t = t.substring(7).trim();
  return t || null;
}

/**
 * Cadastrar novo usuario
 */
export async function signup(userData: SignupData): Promise<User> {
  if (MOCK_MODE) {
    await delay(600);
    return {
      id: 1,
      name: userData.name,
      email: userData.email,
    };
  }

  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    ...(userData.nickname != null && userData.nickname !== '' && { nickname: userData.nickname }),
    ...(userData.gender_slug != null && userData.gender_slug !== '' && { gender_slug: userData.gender_slug }),
    ...(userData.cell_phone != null && userData.cell_phone !== '' && { cell_phone: userData.cell_phone }),
  };

  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      (typeof data.error === 'string' && data.error) ||
      (Array.isArray(data.detail) && data.detail[0]?.msg) ||
      data.message ||
      (typeof data.detail === 'string' && data.detail);
    const fallback =
      response.status === 409
        ? 'Usuario ja cadastrado. Faca login para continuar.'
        : response.status === 400 || response.status === 422
          ? 'Erro de validacao'
          : 'Erro ao criar usuario';
    throw new Error(typeof msg === 'string' ? msg : fallback);
  }

  // Spec: create_user retorna apenas { id, name, email }. Token vem do login subsequente.
  return data as User;
}

/**
 * Fazer login e obter access_token
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await delay(600);
    const token = 'mock_access_token_perfecting';
    localStorage.setItem(TOKEN_KEY, token);
    return {
      access_token: token,
      token_type: 'bearer',
      user_scope: {
        user_id: 1, email, name: 'Mock User', email_checked: true,
        organization_id: null, organization_is_active: null, organization_resources: null,
        required_change_password: false, is_active: true, superadmin: false,
        resources: [], groups: [],
      },
    };
  }

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Erro ao fazer login. Verifique as credenciais.';
    throw new Error(errorMessage);
  }

  const accessToken = data.access_token || data.accessToken || data.token;
  if (!accessToken) {
    throw new Error('Token nao retornado pela API.');
  }

  // API-LOGIC: login retorna access_token/token, token_type, user_scope; persistir em 'token'
  const cleanAccessToken = sanitizeToken(accessToken) ?? accessToken;
  localStorage.setItem(TOKEN_KEY, cleanAccessToken);
  if (data.user_scope && typeof window !== 'undefined') {
    try {
      localStorage.setItem('user_scope', JSON.stringify(data.user_scope));
    } catch {
      // ignore
    }
  }

  return {
    access_token: cleanAccessToken,
    token_type: data.token_type || 'bearer',
    user_scope: data.user_scope,
  };
}

/**
 * Criar organização (requer estar logado). Atualiza o token com new_token retornado pela API.
 */
export async function createOrganization(orgData: CreateOrganizationInput): Promise<CreateOrganizationOutput> {
  if (MOCK_MODE) {
    await delay(500);
    const token = `mock_org_token_${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    return {
      organization_name: orgData.name,
      organization_id: 1,
      new_token: { access_token: token, token_type: 'bearer' },
    };
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  if (!token) {
    throw new Error('Faça login antes de criar a organização.');
  }

  const response = await fetch('/api/create-organization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orgData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = getCreateOrgErrorMessage(data);
    throw new Error(msg);
  }

  const result = data as CreateOrganizationOutput;
  // Spec: new_token é objeto com { access_token, token_type, user_scope }
  applyNewToken(result.new_token);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('perfecting_agent_link');
    if (!localStorage.getItem(TOKEN_KEY)) {
      console.warn('[auth] create_organization: new_token não continha access_token válido.', result.new_token);
    }
    if (process.env.NODE_ENV === 'development') {
      const nt = result.new_token as Record<string, unknown>;
      const scope = nt?.user_scope;
      const orgId = scope && typeof scope === 'object' && scope !== null && 'organization_id' in scope ? (scope as { organization_id: unknown }).organization_id : null;
      console.log('[auth] create_organization resposta (dev):', {
        organization_id: result.organization_id,
        organization_name: result.organization_name,
        newTokenTemAccessToken: typeof nt?.access_token === 'string',
        user_scope_organization_id: orgId,
        tokenAtualizadoNoLocalStorage: !!localStorage.getItem(TOKEN_KEY),
      });
    }
  }

  return result;
}

/** Extrai mensagem de erro da resposta da API (detail pode ser string ou array de validação). */
function getCreateOrgErrorMessage(data: unknown): string {
  if (data == null || typeof data !== 'object') return 'Erro ao criar organização';
  const d = data as Record<string, unknown>;
  if (typeof d.error === 'string' && d.error.trim()) return d.error;
  if (typeof d.message === 'string' && d.message.trim()) return d.message;
  if (typeof d.detail === 'string' && d.detail.trim()) return d.detail;
  if (Array.isArray(d.detail) && d.detail[0] != null) {
    const first = d.detail[0] as Record<string, unknown>;
    if (typeof first?.msg === 'string') return first.msg;
  }
  return 'Erro ao criar organização';
}

/**
 * Aplica new_token ao localStorage.
 * Formato esperado (CreateOrganization Output): mesmo do Login Output, ex.: { access_token, token_type, user_scope }.
 * Aceita também: string (JWT); objeto com access_token/token/accessToken e opcional user_scope; aninhamento em new_token/data.
 */
function applyNewToken(newToken: unknown): void {
  if (typeof window === 'undefined') return;
  if (newToken == null) return;
  if (typeof newToken === 'string') {
    const clean = sanitizeToken(newToken);
    if (clean) localStorage.setItem(TOKEN_KEY, clean);
    return;
  }
  if (typeof newToken !== 'object') return;
  const t = newToken as Record<string, unknown>;
  const tokenValue =
    (typeof t.access_token === 'string' && t.access_token) ||
    (typeof t.token === 'string' && t.token) ||
    (typeof t.accessToken === 'string' && t.accessToken);
  if (tokenValue) {
    const cleanVal = sanitizeToken(tokenValue);
    if (cleanVal) localStorage.setItem(TOKEN_KEY, cleanVal);
  }
  if (t.user_scope != null) {
    try {
      localStorage.setItem('user_scope', JSON.stringify(t.user_scope));
    } catch {
      // ignore
    }
  }
  const nested = t.new_token ?? t.data;
  if (nested != null && (typeof nested === 'string' || (typeof nested === 'object' && nested !== null))) {
    applyNewToken(nested);
  }
}

/**
 * Fazer logout (API-LOGIC: remover token, user_scope, perfecting_agent_link)
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user_scope');
  localStorage.removeItem('perfecting_agent_link');
  localStorage.removeItem('sta_wizard_state');
}

/**
 * Verificar se usuario esta autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Obter token atual (para Authorization: Bearer ${token})
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

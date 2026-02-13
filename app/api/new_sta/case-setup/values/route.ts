import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const ROLE_PLAYS_BASE = API_BASE.endsWith('/role_plays') ? API_BASE : `${API_BASE}/role_plays`;

type CallContextTypeApi = {
  id: number;
  name: string;
  description?: string | null;
};

type CallContextGroupApi = {
  call_context_types?: CallContextTypeApi[];
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Default values to use when API is unavailable
const DEFAULT_CALL_CONTEXT_VALUES = [
  { id: 1, slug: 'cold_call', label: 'Cold Call', description: 'Primeiro contato com o prospect' },
  { id: 2, slug: 'follow_up', label: 'Follow Up', description: 'Acompanhamento de contato anterior' },
  { id: 3, slug: 'demo', label: 'Demonstracao', description: 'Apresentacao do produto/servico' },
  { id: 4, slug: 'negotiation', label: 'Negociacao', description: 'Discussao de termos e fechamento' },
  { id: 5, slug: 'objection_handling', label: 'Objecoes', description: 'Tratamento de objecoes do cliente' },
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    console.log('[STA] Getting call context values');

    const response = await fetch(`${ROLE_PLAYS_BASE}/call_contexts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    console.log('[STA] Call context values response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      console.warn('[STA] Non-JSON response, using defaults');
      return NextResponse.json(DEFAULT_CALL_CONTEXT_VALUES);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const msg =
          (typeof data?.detail === 'string' ? data.detail : data?.message) ||
          'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
        return NextResponse.json({ error: msg }, { status: response.status });
      }
      console.warn('[STA] Call context values error, using defaults:', data);
      return NextResponse.json(DEFAULT_CALL_CONTEXT_VALUES);
    }

    const normalized = Array.isArray(data)
      ? (data as CallContextGroupApi[])
          .flatMap((group) => Array.isArray(group.call_context_types) ? group.call_context_types : [])
          .filter((ctx): ctx is CallContextTypeApi => typeof ctx?.id === 'number' && typeof ctx?.name === 'string')
          .map((ctx) => ({
            id: ctx.id,
            slug: slugify(ctx.name),
            label: ctx.name,
            description: ctx.description ?? undefined,
          }))
      : [];

    return NextResponse.json(normalized.length ? normalized : DEFAULT_CALL_CONTEXT_VALUES);
  } catch (error) {
    console.error('[STA] Erro ao obter valores de call_context:', error);
    return NextResponse.json(DEFAULT_CALL_CONTEXT_VALUES);
  }
}

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const ROLE_PLAYS_BASE = API_BASE.endsWith('/role_plays') ? API_BASE : `${API_BASE}/role_plays`;

type CallContextTypeApi = { id: number; name: string };
type CallContextGroupApi = { call_context_types?: CallContextTypeApi[] };

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function resolveCallContextTypeId(authHeader: string, slugOrId?: string): Promise<number | null> {
  if (!slugOrId) return null;
  const asNumber = Number(slugOrId);
  if (Number.isInteger(asNumber) && asNumber > 0) return asNumber;

  try {
    const response = await fetch(`${ROLE_PLAYS_BASE}/call_contexts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data)) return null;
    const target = slugify(slugOrId);
    for (const group of data as CallContextGroupApi[]) {
      for (const type of Array.isArray(group.call_context_types) ? group.call_context_types : []) {
        if (slugify(type.name) === target) return type.id;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const body = await request.json();
    const callContextTypeId = await resolveCallContextTypeId(authHeader, body.call_context_type_slug);
    const personaVoiceIdRaw = body.persona_voice_id ?? body.persona_voice_slug;
    const personaVoiceId = Number(personaVoiceIdRaw);
    const normalizedBody = {
      ...body,
      ...(callContextTypeId != null && { call_context_type_id: callContextTypeId }),
      ...(Number.isInteger(personaVoiceId) && personaVoiceId > 0 && { persona_voice_id: personaVoiceId }),
    };
    delete (normalizedBody as Record<string, unknown>).call_context_type_slug;
    delete (normalizedBody as Record<string, unknown>).persona_voice_slug;

    console.log('[STA] Creating case setup:', JSON.stringify(normalizedBody));

    try {
      const response = await fetch(`${ROLE_PLAYS_BASE}/case_setup/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(normalizedBody),
      });

      console.log('[STA] Create case setup response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          const normalized = {
            ...data,
            call_context_type_slug:
              typeof data.call_context_type_slug === 'string'
                ? data.call_context_type_slug
                : (typeof data.call_context_type_id === 'number' ? String(data.call_context_type_id) : ''),
          };
          return NextResponse.json(normalized);
        }
        if (response.status === 401 || response.status === 403) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        console.error('[STA] Create case setup API error:', data);
        const errMsg = typeof data.detail === 'string' ? data.detail : data.message || data.error || 'Erro ao criar case setup';
        return NextResponse.json({ error: errMsg }, { status: response.status });
      }
      const text = await response.text();
      console.warn('[STA] Non-JSON response from API:', text.substring(0, 100));
      return NextResponse.json({ error: 'Resposta inválida da API' }, { status: 502 });
    } catch (apiError) {
      console.error('[STA] API call failed:', apiError);
      const msg = apiError instanceof Error ? apiError.message : 'Falha ao chamar API';
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  } catch (error) {
    console.error('[STA] Erro ao criar case setup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar case setup: ${errorMessage}` },
      { status: 500 }
    );
  }
}

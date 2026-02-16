import { NextRequest, NextResponse } from 'next/server';

const MOCK_AGENT_LINK = process.env.NEXT_PUBLIC_USE_MOCK_AGENT_LINK === 'true';
const MOCK_SIGNED_URL = 'wss://mock-agent-link.local/conversation';

/**
 * POST /api/get-agent-link
 * Body: { case_setup_id: number, user_time: string (ISO datetime) }
 * Requer token no header Authorization: Bearer {token}
 */
export async function POST(request: NextRequest) {
  try {
    if (MOCK_AGENT_LINK) {
      return NextResponse.json({ signed_url: MOCK_SIGNED_URL });
    }

    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário. Envie no header Authorization: Bearer {token}' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const body = await request.json().catch(() => ({}));
    const caseSetupId = Number(body.case_setup_id);
    const userTimeRaw = body.user_time;
    const userTime = typeof userTimeRaw === 'string' ? userTimeRaw : '';
    const userTimeDate = new Date(userTime);

    if (!Number.isInteger(caseSetupId) || caseSetupId <= 0) {
      return NextResponse.json(
        { error: 'Parâmetro case_setup_id é obrigatório e deve ser inteiro positivo.' },
        { status: 400 }
      );
    }
    if (!userTime || Number.isNaN(userTimeDate.getTime())) {
      return NextResponse.json(
        { error: 'Parâmetro user_time é obrigatório e deve ser uma data ISO válida.' },
        { status: 400 }
      );
    }

    return await processRequest(token, caseSetupId, userTimeDate.toISOString());
  } catch (error) {
    console.error('Error getting agent link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET mantido para compatibilidade durante migração.
 */
export async function GET(request: NextRequest) {
  try {
    if (MOCK_AGENT_LINK) {
      return NextResponse.json({ signed_url: MOCK_SIGNED_URL });
    }

    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário. Envie no header Authorization: Bearer {token}' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];

    const { searchParams } = new URL(request.url);
    const caseSetupId = Number(searchParams.get('case_setup_id'));
    const userTimeRaw = searchParams.get('user_time');
    const parsedUserTime = userTimeRaw ? new Date(userTimeRaw) : new Date();
    const userTime = Number.isNaN(parsedUserTime.getTime())
      ? new Date().toISOString()
      : parsedUserTime.toISOString();
    if (!Number.isInteger(caseSetupId) || caseSetupId <= 0) {
      return NextResponse.json(
        { error: 'Parâmetro case_setup_id é obrigatório.' },
        { status: 400 }
      );
    }

    return await processRequest(token, caseSetupId, userTime);
  } catch (error) {
    console.error('Error getting agent link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function processRequest(token: string, caseSetupId: number, userTime: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: 'Server configuration error: API base URL not set' },
      { status: 500 }
    );
  }

  const base = apiBaseUrl.replace(/\/$/, '');
  const rolePlaysSessionBase = base.endsWith('/role_plays_session') ? base : `${base}/role_plays_session`;
  const url = `${rolePlaysSessionBase}/get_agent_link`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  type UpstreamResult = {
    response: Response;
    data: unknown;
  };

  async function requestUpstream(payload: Record<string, unknown>): Promise<UpstreamResult> {
    console.log('[get-agent-link] upstream request payload:', payload);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const raw = await response.text().catch(() => '');
    let data: unknown = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }
    console.log('[get-agent-link] upstream response status:', response.status);
    return { response, data };
  }

  async function requestUpstreamGet(timeValue: string): Promise<UpstreamResult> {
    const getUrl = `${url}?case_setup_id=${caseSetupId}&user_time=${encodeURIComponent(timeValue)}`;
    console.log('[get-agent-link] upstream GET fallback URL:', getUrl);
    const response = await fetch(getUrl, {
      method: 'GET',
      headers,
    });
    const raw = await response.text().catch(() => '');
    let data: unknown = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }
    console.log('[get-agent-link] upstream GET response status:', response.status);
    return { response, data };
  }

  let { response, data } = await requestUpstream({
    case_setup_id: caseSetupId,
    user_time: userTime,
  });

  const userTimeNoMs = userTime.replace(/\.\d{3}Z$/, 'Z');

  // Some environments reject one datetime shape and accept another.
  if (!response.ok && response.status === 400) {
    console.warn('[get-agent-link] POST with user_time returned 400. Retrying with alternate datetime format.', {
      caseSetupId,
      userTime,
      details: data,
    });
    if (userTimeNoMs !== userTime) {
      ({ response, data } = await requestUpstream({ case_setup_id: caseSetupId, user_time: userTimeNoMs }));
    }
  }

  // Fallback GET only when upstream indicates method/validation incompatibility.
  if (!response.ok && (response.status === 405 || response.status === 422)) {
    const previous = { response, data };
    ({ response, data } = await requestUpstreamGet(userTime));
    if (!response.ok) {
      response = previous.response;
      data = previous.data;
    }
  }
  if (!response.ok && userTimeNoMs !== userTime && (response.status === 405 || response.status === 422)) {
    const previous = { response, data };
    ({ response, data } = await requestUpstreamGet(userTimeNoMs));
    if (!response.ok) {
      response = previous.response;
      data = previous.data;
    }
  }

  if (!response.ok) {
    // Tratar erro 401 (token expirado)
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.', details: data },
        { status: 401 }
      );
    }
    
    // Tratar erro 403 (sem permissão): priorizar mensagem do backend (ex.: "User organization does not have access")
    if (response.status === 403) {
      const backendMsg =
        typeof data === 'object' && data !== null
          ? (typeof (data as { detail?: unknown }).detail === 'string'
              ? (data as { detail?: string }).detail
              : (data as { message?: unknown }).message)
          : null;
      const isOrgAccess =
        typeof backendMsg === 'string' &&
        (backendMsg.includes('organization') && backendMsg.toLowerCase().includes('does not have access'));
      const errorMessage = isOrgAccess
        ? 'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.'
        : (backendMsg as string) ||
          'Você não tem permissão para acessar o agente. Verifique se o recurso specialist_consultant está habilitado.';
      return NextResponse.json(
        { error: errorMessage, details: data },
        { status: 403 }
      );
    }
    
    if (response.status === 422) {
      const detail = typeof data === 'object' && data !== null ? (data as { detail?: unknown }).detail : undefined;
      const fieldHints = Array.isArray(detail)
        ? detail
            .map((d) => {
              if (!d || typeof d !== 'object') return null;
              const loc = (d as { loc?: unknown[] }).loc;
              if (!Array.isArray(loc) || loc.length === 0) return null;
              return String(loc[loc.length - 1]);
            })
            .filter(Boolean)
        : [];
      console.error('[get-agent-link] 422 from backend', { caseSetupId, userTime, fieldHints, details: data });
      const hint = fieldHints.length ? ` Campos com problema: ${fieldHints.join(', ')}.` : '';
      return NextResponse.json(
        {
          error: `A API recusou a solicitação de link do agente (422). Verifique se case_setup_id e user_time estão corretos.${hint}`,
          details: data,
        },
        { status: 422 }
      );
    }

    if (response.status === 400) {
      console.error('[get-agent-link] 400 from backend', { caseSetupId, userTime, details: data });
      const backendMessage =
        typeof data === 'object' && data !== null
          ? ((data as { detail?: unknown; message?: unknown }).detail ??
            (data as { detail?: unknown; message?: unknown }).message)
          : null;
      return NextResponse.json(
        {
          error:
            (typeof backendMessage === 'string' && backendMessage) ||
            'A API retornou 400 ao obter link do agente.',
          details: data,
        },
        { status: 400 }
      );
    }

    const detailMessage =
      typeof data === 'object' && data !== null
        ? ((data as { detail?: unknown; message?: unknown }).detail ??
          (data as { detail?: unknown; message?: unknown }).message)
        : null;
    return NextResponse.json(
      { error: detailMessage || 'Erro ao obter link do agente', details: data },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from 'next/server';

const MOCK_AGENT_LINK = process.env.NEXT_PUBLIC_USE_MOCK_AGENT_LINK === 'true';
const MOCK_SIGNED_URL = 'wss://mock-agent-link.local/conversation';

/**
 * POST /api/get-agent-link
 * Body: { case_setup_id: number }
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

    if (!Number.isInteger(caseSetupId) || caseSetupId <= 0) {
      return NextResponse.json(
        { error: 'Parâmetro case_setup_id é obrigatório e deve ser inteiro positivo.' },
        { status: 400 }
      );
    }

    return await processRequest(token, caseSetupId);
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
    if (!Number.isInteger(caseSetupId) || caseSetupId <= 0) {
      return NextResponse.json(
        { error: 'Parâmetro case_setup_id é obrigatório.' },
        { status: 400 }
      );
    }

    return await processRequest(token, caseSetupId);
  } catch (error) {
    console.error('Error getting agent link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function processRequest(token: string, caseSetupId: number) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ case_setup_id: caseSetupId }),
  });

  const data = await response.json();

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
      const backendMsg = typeof data.detail === 'string' ? data.detail : data.message;
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
    
    return NextResponse.json(
      { error: data.detail || data.message || 'Erro ao obter link do agente', details: data },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}

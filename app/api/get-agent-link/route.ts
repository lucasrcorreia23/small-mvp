import { NextRequest, NextResponse } from 'next/server';

const MOCK_AGENT_LINK = process.env.NEXT_PUBLIC_USE_MOCK_AGENT_LINK === 'true';
const MOCK_SIGNED_URL = 'wss://mock-agent-link.local/conversation';

/**
 * GET /api/get-agent-link?user_time=10:30
 * Requer token no header Authorization: Bearer {token}
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

    // Extrair token do header "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    // Obter user_time do query parameter
    const { searchParams } = new URL(request.url);
    const userTime = searchParams.get('user_time');
    
    if (!userTime) {
      return NextResponse.json(
        { error: 'Parâmetro user_time necessário. Use: ?user_time=10:30' },
        { status: 400 }
      );
    }

    return await processRequest(token, userTime);
  } catch (error) {
    console.error('Error getting agent link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST (mantido para compatibilidade, mas GET é o correto)
 */
export async function POST(request: NextRequest) {
  try {
    if (MOCK_AGENT_LINK) {
      return NextResponse.json({ signed_url: MOCK_SIGNED_URL });
    }

    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Tentar do body (fallback)
      const body = await request.json();
      token = body.token;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário. Envie no header Authorization: Bearer {token}' },
        { status: 401 }
      );
    }

    // Tentar obter user_time do body ou query
    const { searchParams } = new URL(request.url);
    let userTime = searchParams.get('user_time');
    
    if (!userTime) {
      const body = await request.json().catch(() => ({}));
      userTime = body.user_time;
    }
    
    if (!userTime) {
      return NextResponse.json(
        { error: 'Horário do usuário necessário (user_time)' },
        { status: 400 }
      );
    }

    return await processRequest(token, userTime);
  } catch (error) {
    console.error('Error getting agent link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function processRequest(token: string, userTime: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: 'Server configuration error: API base URL not set' },
      { status: 500 }
    );
  }

  // Endpoint correto: POST /get_agent_link/keune
  // Body: { "user_time": "01:08:06.484Z" }
  const url = `${apiBaseUrl}/get_agent_link/keune`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_time: userTime }),
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

  // Retornar link do agente
  return NextResponse.json(data);
}

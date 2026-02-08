import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Auth base: URL raiz (homolog api-hml.perfecting.app ou producao api.perfecting.app)
    const authBaseUrl = apiBaseUrl.includes('/specialist_consultant')
      ? apiBaseUrl.replace('/specialist_consultant', '')
      : apiBaseUrl.replace(/\/$/, '');

    // Path do Auth: mesmo que signup e create-organization (OpenAPI servers url)
    const authPath = (process.env.AUTH_BASE_PATH ?? process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? '/auth').replace(/\/$/, '') || '';
    const pathPrefix = authPath ? `/${authPath.replace(/^\//, '')}` : '';
    const loginUrl = `${authBaseUrl}${pathPrefix}/login`;

    // OAuth2 password flow - form-urlencoded
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email); // API usa username, enviamos email
    formData.append('password', password);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    let data: Record<string, unknown> = {};
    try {
      data = await response.json();
    } catch {
      // Backend pode retornar corpo não-JSON em alguns erros
    }

    if (!response.ok) {
      const detail = data.detail;
      let errorMessage = 'Credenciais inválidas. Verifique email e senha.';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0] as { msg?: string };
        errorMessage = first?.msg || errorMessage;
      } else if (data.error && typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const rawToken = data.access_token ?? data.token ?? '';
    const token: string = typeof rawToken === 'string' ? rawToken : '';
    // Diagnóstico: detectar se backend retorna token com prefixo "Bearer"
    console.log(`[login] Token type: ${typeof token}, first 40 chars: "${String(token).substring(0, 40)}"`);
    console.log(`[login] Token starts with "Bearer"?: ${String(token).toLowerCase().startsWith('bearer ')}`);
    // Fix: remover prefixo "Bearer " caso o backend o inclua no access_token
    let normalizedToken = token;
    if (token.toLowerCase().startsWith('bearer ')) {
      normalizedToken = token.substring(7).trim();
    }
    return NextResponse.json({
      access_token: normalizedToken,
      token_type: data.token_type,
      user_scope: data.user_scope,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

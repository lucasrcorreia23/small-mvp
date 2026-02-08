import { NextRequest, NextResponse } from 'next/server';

/** Body alinhado à Auth API POST /auth/create_organization */
interface CreateOrganizationRequest {
  cnpj: number;
  name: string;
  url: string;
  official_name?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário. Envie no header Authorization: Bearer {token}' },
        { status: 401 }
      );
    }

    // Extração robusta: pega tudo após "Bearer " (evita cortar tokens com espaços ou prefixo duplicado)
    const token = authHeader.substring(7).trim();
    // Diagnóstico: verificar formato do token recebido
    console.log(`[create-org] Token extracted (first 60 chars): "${token.substring(0, 60)}"`);
    console.log(`[create-org] Token starts with "eyJ" (JWT)?: ${token.startsWith('eyJ')}`);
    console.log(`[create-org] Token starts with "Bearer" (duplicado!)?: ${token.toLowerCase().startsWith('bearer')}`);

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação vazio após extração do header.' },
        { status: 401 }
      );
    }

    const body: CreateOrganizationRequest = await request.json();

    if (body.cnpj == null || !body.name?.trim() || !body.url?.trim()) {
      return NextResponse.json(
        { error: 'Campos obrigatórios da organização: cnpj, name, url' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error: API base URL not set' },
        { status: 500 }
      );
    }

    const authBaseUrl = apiBaseUrl.includes('/specialist_consultant')
      ? apiBaseUrl.replace('/specialist_consultant', '')
      : apiBaseUrl.replace(/\/$/, '');
    const authPath = (process.env.AUTH_BASE_PATH ?? process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? '/auth').replace(/\/$/, '') || '';
    const pathPrefix = authPath ? `/${authPath.replace(/^\//, '')}` : '';

    const payload: Record<string, number | string> = {
      cnpj: Number(body.cnpj),
      name: body.name.trim(),
      url: body.url.trim(),
    };
    const officialName = body.official_name?.trim();
    const description = body.description?.trim();
    if (officialName) payload.official_name = officialName;
    if (description) payload.description = description;

    const url = `${authBaseUrl}${pathPrefix}/create_organization`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.log(`[create-org] Backend URL: ${url}`);
    console.log(`[create-org] Backend response status: ${response.status}`);

    if (!response.ok) {
      const message =
        (typeof data.error === 'string' && data.error) ||
        (typeof data.detail === 'string' && data.detail) ||
        data.message ||
        'Erro ao criar organização';
      return NextResponse.json(
        { error: message, details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Create organization API error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

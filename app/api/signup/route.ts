import { NextRequest, NextResponse } from 'next/server';

/** Extrai mensagem de erro do corpo da Auth API (vários formatos possíveis) */
function getApiErrorMessage(data: unknown): string | null {
  if (data == null || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.message === 'string') return d.message;
  if (typeof d.error === 'string') return d.error;
  if (typeof d.detail === 'string') return d.detail;
  if (typeof d._raw === 'string' && d._raw.trim()) return d._raw.trim();
  if (Array.isArray(d.detail) && d.detail[0] != null) {
    const first = d.detail[0] as Record<string, unknown>;
    if (typeof first?.msg === 'string') return first.msg;
  }
  if (d.detail && typeof d.detail === 'object' && !Array.isArray(d.detail)) {
    const detail = d.detail as Record<string, unknown>;
    if (typeof detail.message === 'string') return detail.message;
  }
  return null;
}

/** Body alinhado ao Auth API POST /auth/create_user */
interface SignupRequest {
  name: string;
  email: string;
  password: string;
  nickname?: string;
  gender_id?: number;
  cell_phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();

    // Validar campos obrigatórios
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, email, password' },
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

    // Path do Auth: padrão /auth (OpenAPI servers url). Use AUTH_BASE_PATH vazio se o create_user estiver na raiz.
    const authPath = (process.env.AUTH_BASE_PATH ?? process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? '/auth').replace(/\/$/, '') || '';
    const pathPrefix = authPath ? `/${authPath.replace(/^\//, '')}` : '';

    // Auth API CreateUser Input: name, email, password required; nickname, gender_id, cell_phone optional.
    const payload: Record<string, string | number> = {
      name: body.name.trim(),
      email: body.email.trim(),
      password: body.password,
    };
    const nickname = body.nickname?.trim();
    const cellPhone = body.cell_phone?.trim();
    if (nickname) payload.nickname = nickname;
    if (typeof body.gender_id === 'number' && Number.isInteger(body.gender_id)) payload.gender_id = body.gender_id;
    if (cellPhone) payload.cell_phone = cellPhone;

    // Auth API: POST {base}{pathPrefix}/create_user (pathPrefix padrão: /auth)
    const createUserUrl = `${authBaseUrl}${pathPrefix}/create_user`;
    const response = await fetch(createUserUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data: Record<string, unknown>;
    try {
      data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
    } catch {
      data = { _raw: rawText.slice(0, 500) };
    }

    if (!response.ok) {
      const message = getApiErrorMessage(data);
      console.error('[signup] Auth API error:', {
        method: 'POST',
        url: createUserUrl,
        status: response.status,
        body: data,
        extractedMessage: message,
      });

      if (response.status === 409) {
        return NextResponse.json(
          { error: message || 'Usuário já cadastrado. Faça login para continuar.', details: data },
          { status: 409 }
        );
      }
      if (response.status === 400 || response.status === 422) {
        return NextResponse.json(
          { error: message || 'Erro de validação', details: data },
          { status: response.status }
        );
      }
      const fallbackMessage =
        typeof data._raw === 'string'
          ? `Resposta da API (não-JSON): ${data._raw.slice(0, 200)}${data._raw.length > 200 ? '…' : ''}`
          : 'Erro ao criar usuário';
      return NextResponse.json(
        { error: message || fallbackMessage, details: data },
        { status: response.status }
      );
    }

    // Spec: create_user retorna { id, name, email }. Token é obtido via /login subsequente.
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Signup API error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

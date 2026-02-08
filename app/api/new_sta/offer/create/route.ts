import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const STA_BASE = API_BASE.endsWith('/new_sta') ? API_BASE : `${API_BASE}/new_sta`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const body = await request.json();

    console.log('[STA] Creating offer:', JSON.stringify(body));

    try {
      const response = await fetch(`${STA_BASE}/offer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(body),
      });

      console.log('[STA] Create offer response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          return NextResponse.json(data);
        }
        if (response.status === 401 || response.status === 403) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        if (response.status === 422) {
          const msg = Array.isArray(data.detail)
            ? data.detail.map((d: { loc?: unknown[]; msg?: string }) => `${(d.loc || []).join('.')}: ${d.msg || 'Field required'}`).join('; ')
            : (typeof data.detail === 'string' ? data.detail : data.message) || 'Erro de validação';
          return NextResponse.json({ error: msg, details: data.detail }, { status: 422 });
        }
        console.error('[STA] Create offer API error:', data);
        return NextResponse.json(
          { error: (typeof data.detail === 'string' ? data.detail : data.message) || 'Erro ao criar oferta' },
          { status: response.status }
        );
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
    console.error('[STA] Erro ao criar oferta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar oferta: ${errorMessage}` },
      { status: 500 }
    );
  }
}

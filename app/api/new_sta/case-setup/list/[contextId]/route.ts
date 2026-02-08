import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const STA_BASE = API_BASE.endsWith('/new_sta') ? API_BASE : `${API_BASE}/new_sta`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const { contextId } = await params;

    console.log('[STA] Listing case setups for context:', contextId);

    try {
      const response = await fetch(`${STA_BASE}/case_setup/context_${contextId}/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });

      console.log('[STA] List case setups response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          return NextResponse.json(Array.isArray(data) ? data : []);
        }
        if (response.status === 401 || response.status === 403) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        console.error('[STA] List case setups API error:', data);
        const errMsg = typeof data.detail === 'string' ? data.detail : data.message || data.error || 'Erro ao listar case setups';
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
    console.error('[STA] Erro ao listar case setups:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao listar case setups';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

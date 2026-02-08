import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const STA_BASE = API_BASE.endsWith('/new_sta') ? API_BASE : `${API_BASE}/new_sta`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (process.env.NODE_ENV === 'development') {
      console.log('[STA] context/generate (dev): Authorization header present:', !!authHeader);
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const body = await request.json();
    const offerIdRaw = body.offer_id ?? body.offerId;
    const offerId = typeof offerIdRaw === 'number' ? offerIdRaw : Number(offerIdRaw);
    if (Number.isNaN(offerId) || offerId < 1) {
      return NextResponse.json(
        { error: 'offer_id é obrigatório e deve ser um número inteiro maior que 0' },
        { status: 400 }
      );
    }
    const apiBody = {
      offer_id: offerId,
      aditional_instructions: body.aditional_instructions ?? '',
    };

    console.log('[STA] Generating context:', JSON.stringify(apiBody));

    try {
      const response = await fetch(`${STA_BASE}/context/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(apiBody),
      });

      console.log('[STA] Generate context response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          return NextResponse.json(data);
        }
        if (response.status === 401 || response.status === 403) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[STA] context/generate (dev): backend 401/403 response:', JSON.stringify(data));
          }
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        if (response.status === 429) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Limite de requisições excedido. Tente novamente em alguns minutos.';
          return NextResponse.json({ error: msg }, { status: 429 });
        }
        console.error('[STA] Generate context API error:', data);
        const errMsg = typeof data.detail === 'string' ? data.detail : data.message || data.error || 'Erro ao gerar contexto';
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
    console.error('[STA] Erro ao gerar contexto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao gerar contexto: ${errorMessage}` },
      { status: 500 }
    );
  }
}

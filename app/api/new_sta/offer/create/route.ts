import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const ROLE_PLAYS_BASE = API_BASE.endsWith('/role_plays') ? API_BASE : `${API_BASE}/role_plays`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const body = await request.json();

    // Body alinhado ao schema da API: offer_name, general_description, ... , url (opcional, default "")
    const apiBody: Record<string, string> = {
      offer_name: body.offer_name ?? body.name ?? '',
      general_description: body.general_description ?? body.description ?? '',
      target_audience_description: body.target_audience_description ?? '',
      target_industries_or_domains: body.target_industries_or_domains ?? '',
      primary_problem_solved: body.primary_problem_solved ?? '',
      core_value_proposition: body.core_value_proposition ?? '',
      key_features_and_benefits: body.key_features_and_benefits ?? '',
      unique_selling_points: body.unique_selling_points ?? '',
      competitive_differentiation: body.competitive_differentiation ?? '',
      delivery_method: body.delivery_method ?? '',
      implementation_onboarding_process: body.implementation_onboarding_process ?? '',
      customer_support_model: body.customer_support_model ?? '',
      pricing_details_summary: body.pricing_details_summary ?? '',
      url: body.url ?? '',
    };

    console.log('[STA] Creating offer:', JSON.stringify(apiBody));

    try {
      const response = await fetch(`${ROLE_PLAYS_BASE}/offer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(apiBody),
      });

      console.log('[STA] Create offer response status:', response.status);

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        if (isJson) {
          let data: Record<string, unknown>;
          try {
            data = await response.json();
          } catch (parseErr) {
            console.error('[STA] Create offer: response OK mas body não é JSON', parseErr);
            return NextResponse.json({ error: 'Resposta da API inválida (não-JSON)' }, { status: 502 });
          }
          // API retorna id, name (não offer_name); normalizar para o cliente
          const id = typeof data.id === 'number' ? data.id : (typeof (data as { offer_id?: number }).offer_id === 'number' ? (data as { offer_id: number }).offer_id : 0);
          const normalized = { ...data, id, offer_name: data.name ?? data.offer_name ?? '' };
          return NextResponse.json(normalized, { status: response.status });
        }
        return NextResponse.json({ id: 0, offer_name: '' }, { status: response.status });
      }

      if (isJson) {
        let data: Record<string, unknown>;
        try {
          data = await response.json();
        } catch {
          return NextResponse.json({ error: 'Erro ao criar oferta' }, { status: response.status });
        }
        if (response.status === 401 || response.status === 403) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        if (response.status === 422) {
          const msg = Array.isArray(data.detail)
            ? (data.detail as { loc?: unknown[]; msg?: string }[]).map((d) => `${(d.loc || []).join('.')}: ${d.msg || 'Field required'}`).join('; ')
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
      console.warn('[STA] Non-JSON response from API (status %s):', response.status, text.substring(0, 200));
      const backendMsg = text?.trim() && text.length < 200 ? text.trim() : null;
      const userMessage =
        response.status === 500
          ? backendMsg
            ? `A API retornou erro interno (500): ${backendMsg}. Tente novamente ou contate o suporte.`
            : 'A API retornou erro interno (500). Tente novamente ou contate o suporte.'
          : 'Resposta inválida da API. Tente novamente.';
      return NextResponse.json({ error: userMessage }, { status: 502 });
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

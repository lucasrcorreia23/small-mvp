import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app').replace(/\/$/, '');
const ROLE_PLAYS_BASE = API_BASE.endsWith('/role_plays') ? API_BASE : `${API_BASE}/role_plays`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 });
    }

    const { offerId } = await params;

    console.log('[STA] Listing contexts for offer:', offerId);

    try {
      const response = await fetch(`${ROLE_PLAYS_BASE}/context_list?offer_id=${encodeURIComponent(offerId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });

      console.log('[STA] List contexts response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          const offerIdNumber = Number(offerId);
          const normalized = Array.isArray(data)
            ? data.map((item: Record<string, unknown>) => ({
                ...item,
                id: typeof item.id === 'number' ? item.id : Number(item.id ?? 0),
                offer_id: Number.isFinite(offerIdNumber) ? offerIdNumber : 0,
                name: typeof item.name === 'string' ? item.name : '',
                target_description: typeof item.target_description === 'string' ? item.target_description : '',
                compelling_events: typeof item.compelling_events === 'string' ? item.compelling_events : '',
                strategic_priorities: typeof item.strategic_priorities === 'string' ? item.strategic_priorities : '',
                quantifiable_pain_points: typeof item.quantifiable_pain_points === 'string' ? item.quantifiable_pain_points : '',
                desired_future_state: typeof item.desired_future_state === 'string' ? item.desired_future_state : '',
                primary_value_drivers: typeof item.primary_value_drivers === 'string' ? item.primary_value_drivers : '',
                typical_decision_making_process:
                  typeof item.typical_decision_making_process === 'string' ? item.typical_decision_making_process : '',
                risk_aversion_level: typeof item.risk_aversion_level === 'string' ? item.risk_aversion_level : '',
                persona_objections_and_concerns:
                  typeof item.persona_objections_and_concerns === 'string' ? item.persona_objections_and_concerns : '',
                persona_awareness_of_the_problem:
                  typeof item.persona_awareness_of_the_problem === 'string' ? item.persona_awareness_of_the_problem : '',
                persona_awareness_of_the_solutions:
                  typeof item.persona_awareness_of_the_solutions === 'string' ? item.persona_awareness_of_the_solutions : '',
                persona_existing_solutions:
                  typeof item.persona_existing_solutions === 'string' ? item.persona_existing_solutions : '',
              }))
            : [];
          return NextResponse.json(normalized);
        }
        if (response.status === 401 || response.status === 403) {
          const msg =
            (typeof data.detail === 'string' ? data.detail : data.message) ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.';
          return NextResponse.json({ error: msg }, { status: response.status });
        }
        console.error('[STA] List contexts API error:', data);
        const errMsg = typeof data.detail === 'string' ? data.detail : data.message || data.error || 'Erro ao listar contextos';
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
    console.error('[STA] Erro ao listar contextos:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao listar contextos';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

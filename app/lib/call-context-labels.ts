/** Mapeia slug de call_context para label legível */
export function getCallContextLabel(slug: string): string {
  const map: Record<string, string> = {
    cold_call: 'Cold Call',
    warm_outreach: 'Abordagem Morna',
    qualification_discovery: 'Qualificação / Discovery',
    needs_analysis: 'Análise de Necessidades',
    presentation_demo: 'Apresentação / Demo',
    proposal_review: 'Revisão de Proposta',
    negotiation: 'Negociação',
    objection_handling: 'Tratamento de Objeções',
    closing: 'Fechamento',
    follow_up: 'Follow Up',
  };
  return map[slug] || slug.replace(/_/g, ' ');
}

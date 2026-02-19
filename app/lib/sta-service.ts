/**
 * Servico para Sales Training Agents (STA)
 * Integracao real obrigatoria (mock desativado em codigo).
 * getCallResult permanece mock ate endpoint oficial de resultado.
 */

import {
  Offer,
  OfferGenerateRequest,
  OfferGenerateResponse,
  OfferCreateRequest,
  Context,
  ContextGenerateRequest,
  ContextGenerateResponse,
  ContextCreateRequest,
  CaseSetup,
  CaseSetupGenerateRequest,
  CaseSetupGenerateResponse,
  CaseSetupCreateRequest,
  CallContextValue,
  Agent,
  CallResult,
  RoleplayDetail,
} from './types/sta';

import { getToken } from './auth-service';
import {
  MOCK_OFFERS,
  MOCK_CONTEXTS,
  MOCK_CASE_SETUPS,
  MOCK_AGENTS,
  MOCK_CALL_RESULT,
  MOCK_CALL_CONTEXT_VALUES,
  getMockOfferGeneration,
  getMockContextGeneration,
  getMockCaseSetupGeneration,
} from './mock-data';

/** Base para chamadas STA em modo real: API routes Next.js (evita CORS). */
const STA_API_BASE = '/api/new_sta';

const MOCK_MODE = false;

// In-memory stores for created items during session
const createdOffers: Offer[] = [];
const createdContexts: Context[] = [];
const createdCaseSetups: CaseSetup[] = [];
const createdAgents: Agent[] = [];
let nextId = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper para fazer requisicoes autenticadas (usado em modo real)
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || data.error || data.message || 'Erro na requisicao';
    throw new Error(errorMessage);
  }

  return data as T;
}

// ============ OFFER ============

export async function generateOffer(data: OfferGenerateRequest): Promise<OfferGenerateResponse> {
  if (MOCK_MODE) {
    await delay(1200);
    return getMockOfferGeneration(data);
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/offer/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<OfferGenerateResponse>(response);
}

export async function createOffer(data: OfferCreateRequest): Promise<Offer> {
  if (MOCK_MODE) {
    await delay(800);
    const id = nextId++;
    const offer: Offer = {
      id,
      offer_name: data.offer_name,
      general_description: data.general_description,
      target_audience_description: data.target_audience_description || '',
      core_value_proposition: data.core_value_proposition || '',
      primary_problem_solved: data.primary_problem_solved || '',
      key_features_and_benefits: data.key_features_and_benefits || '',
      unique_selling_points: data.unique_selling_points || '',
      target_industries_or_domains: data.target_industries_or_domains || '',
      competitive_differentiation: data.competitive_differentiation || '',
      delivery_method: data.delivery_method || '',
      implementation_onboarding_process: data.implementation_onboarding_process || '',
      customer_support_model: data.customer_support_model || '',
      pricing_details_summary: data.pricing_details_summary || '',
      created_at: new Date().toISOString(),
    };
    createdOffers.push(offer);
    return offer;
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/offer/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const raw = await handleResponse<Offer & { offer_id?: number }>(response);
  // API pode retornar id ou offer_id; normalizar para Offer com id
  const id = typeof raw.id === 'number' ? raw.id : (typeof raw.offer_id === 'number' ? raw.offer_id : 0);
  return { ...raw, id } as Offer;
}

export async function listOffers(): Promise<Offer[]> {
  if (MOCK_MODE) {
    await delay(300);
    return [...MOCK_OFFERS, ...createdOffers];
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/offer/list`, {
    method: 'GET',
  });
  return handleResponse<Offer[]>(response);
}

// ============ CONTEXT ============

export async function generateContext(data: ContextGenerateRequest): Promise<ContextGenerateResponse> {
  if (MOCK_MODE) {
    await delay(1200);
    return getMockContextGeneration(data.offer_id);
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/context/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<ContextGenerateResponse>(response);
}

export async function createContext(data: ContextCreateRequest): Promise<Context> {
  if (MOCK_MODE) {
    await delay(800);
    const id = nextId++;
    const context: Context = {
      id,
      offer_id: data.offer_id,
      name: data.name,
      target_description: data.target_description,
      compelling_events: data.compelling_events || '',
      quantifiable_pain_points: data.quantifiable_pain_points || '',
      desired_future_state: data.desired_future_state || '',
      persona_objections_and_concerns: data.persona_objections_and_concerns || '',
      risk_aversion_level: data.risk_aversion_level || '',
      strategic_priorities: data.strategic_priorities || '',
      primary_value_drivers: data.primary_value_drivers || '',
      typical_decision_making_process: data.typical_decision_making_process || '',
      persona_awareness_of_the_problem: data.persona_awareness_of_the_problem || '',
      persona_awareness_of_the_solutions: data.persona_awareness_of_the_solutions || '',
      persona_existing_solutions: data.persona_existing_solutions || '',
      created_at: new Date().toISOString(),
    };
    createdContexts.push(context);
    return context;
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/context/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<Context>(response);
}

export async function listContexts(offerId: number): Promise<Context[]> {
  if (MOCK_MODE) {
    await delay(300);
    return [...MOCK_CONTEXTS, ...createdContexts].filter((c) => c.offer_id === offerId);
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/context/list/${offerId}`, {
    method: 'GET',
  });
  return handleResponse<Context[]>(response);
}

// ============ CASE SETUP ============

export async function getCallContextValues(): Promise<CallContextValue[]> {
  if (MOCK_MODE) {
    await delay(300);
    return MOCK_CALL_CONTEXT_VALUES;
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/values`, {
    method: 'GET',
  });
  return handleResponse<CallContextValue[]>(response);
}

export async function generateCaseSetup(data: CaseSetupGenerateRequest): Promise<CaseSetupGenerateResponse> {
  if (MOCK_MODE) {
    await delay(1500);
    return getMockCaseSetupGeneration(data.context_id, data.call_context_type_slug, data.scenario_difficulty_level);
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<CaseSetupGenerateResponse>(response);
}

export async function createCaseSetup(data: CaseSetupCreateRequest): Promise<CaseSetup> {
  if (MOCK_MODE) {
    await delay(800);
    const id = nextId++;
    const caseSetup: CaseSetup = {
      id,
      context_id: data.context_id,
      training_name: data.training_name,
      training_description: data.training_description,
      training_objective: data.training_objective,
      call_context_type_slug: data.call_context_type_slug,
      scenario_difficulty_level: data.scenario_difficulty_level,
      persona_profile: data.persona_profile,
      company_profile: data.company_profile,
      buyer_agent_instructions: data.buyer_agent_instructions || [],
      buyer_agent_initial_tone_and_mood: data.buyer_agent_initial_tone_and_mood,
      salesperson_success_criteria: data.salesperson_success_criteria,
      training_targeted_sales_skills: data.training_targeted_sales_skills,
      successful_sale_dialogues_examples: data.successful_sale_dialogues_examples || [],
      unsuccessful_sale_dialogues_examples: data.unsuccessful_sale_dialogues_examples || [],
      elevenlabs_agent_id: `mock_agent_${id}`,
      created_at: new Date().toISOString(),
    };
    createdCaseSetups.push(caseSetup);

    // Also create an agent entry
    const allContexts = [...MOCK_CONTEXTS, ...createdContexts];
    const context = allContexts.find((c) => c.id === data.context_id);
    const allOffers = [...MOCK_OFFERS, ...createdOffers];
    const offer = context ? allOffers.find((o) => o.id === context.offer_id) : null;

    const agent: Agent = {
      id,
      training_name: data.training_name,
      training_description: data.training_description,
      offer_name: offer?.offer_name || '',
      offer_id: offer?.id || 0,
      context_id: data.context_id,
      persona_name: data.persona_profile.name,
      persona_job_title: data.persona_profile.job_title,
      company_name: data.company_profile.name,
      call_context_type_slug: data.call_context_type_slug,
      scenario_difficulty_level: data.scenario_difficulty_level,
      communication_style_id: data.persona_profile.communication_style_id,
      elevenlabs_agent_id: `mock_agent_${id}`,
      created_at: new Date().toISOString(),
    };
    createdAgents.push(agent);

    return caseSetup;
  }

  const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<CaseSetup>(response);
}

// ============ AGENTS (AGGREGATED) ============

export async function listAgents(): Promise<Agent[]> {
  if (MOCK_MODE) {
    await delay(600);
    return [...MOCK_AGENTS, ...createdAgents];
  }

  // Real mode: waterfall through hierarchy
  const agents: Agent[] = [];
  try {
    const offers = await listOffers();
    if (!offers || offers.length === 0) return agents;

    for (const offer of offers) {
      try {
        const contexts = await listContexts(offer.id);
        for (const context of contexts) {
          try {
            const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/list/${context.id}`, { method: 'GET' });
            const caseSetups = await handleResponse<Array<CaseSetup & {
              persona_profile?: { name?: string; job_title?: string };
              company_profile?: { name?: string };
            }>>(response);
            for (const cs of caseSetups) {
              let fullCaseSetup = cs;
              if (!cs.persona_profile || !cs.company_profile) {
                // List endpoint may return lightweight items; fetch details per case setup when needed.
                try {
                  const detailsResponse = await fetchWithAuth(`${STA_API_BASE}/case-setup/${cs.id}`, { method: 'GET' });
                  fullCaseSetup = await handleResponse<CaseSetup>(detailsResponse);
                } catch (detailsErr) {
                  console.warn('Erro ao obter detalhes do case setup', cs.id, detailsErr);
                }
              }
              agents.push({
                id: fullCaseSetup.id,
                training_name: fullCaseSetup.training_name,
                training_description: fullCaseSetup.training_description,
                offer_name: offer.offer_name,
                offer_id: offer.id,
                context_id: context.id,
                persona_name: fullCaseSetup.persona_profile?.name || '',
                persona_job_title: fullCaseSetup.persona_profile?.job_title || '',
                company_name: fullCaseSetup.company_profile?.name || '',
                call_context_type_slug: fullCaseSetup.call_context_type_slug || '',
                scenario_difficulty_level: fullCaseSetup.scenario_difficulty_level || '',
                communication_style_id: fullCaseSetup.persona_profile?.communication_style_id,
                elevenlabs_agent_id: fullCaseSetup.elevenlabs_agent_id,
                created_at: fullCaseSetup.created_at,
              });
            }
          } catch (err) {
            console.warn('Erro ao listar case setups para contexto', context.id, err);
          }
        }
      } catch (err) {
        console.warn('Erro ao listar contextos para oferta', offer.id, err);
      }
    }
    return agents;
  } catch (error) {
    console.warn('Erro ao listar agentes:', error);
    return [];
  }
}

export async function getAgent(id: number): Promise<Agent> {
  if (MOCK_MODE) {
    await delay(400);
    const allAgents = [...MOCK_AGENTS, ...createdAgents];
    const agent = allAgents.find((a) => a.id === id);
    if (!agent) throw new Error('Agente nao encontrado');
    return agent;
  }

  // Real mode
  const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/${id}`, { method: 'GET' });
  const caseSetup = await handleResponse<CaseSetup>(response);

  const offers = await listOffers();
  for (const offer of offers) {
    const contexts = await listContexts(offer.id);
    const context = contexts.find((c) => c.id === caseSetup.context_id);
    if (context) {
      return {
        id: caseSetup.id,
        training_name: caseSetup.training_name,
        training_description: caseSetup.training_description,
        offer_name: offer.offer_name,
        offer_id: offer.id,
        context_id: context.id,
        persona_name: caseSetup.persona_profile.name,
        persona_job_title: caseSetup.persona_profile.job_title,
        company_name: caseSetup.company_profile.name,
        call_context_type_slug: caseSetup.call_context_type_slug,
        scenario_difficulty_level: caseSetup.scenario_difficulty_level,
        communication_style_id: caseSetup.persona_profile.communication_style_id,
        elevenlabs_agent_id: caseSetup.elevenlabs_agent_id,
        created_at: caseSetup.created_at,
      };
    }
  }

  throw new Error('Agente nao encontrado');
}

// ============ ROLEPLAY DETAIL ============

export async function getRoleplayDetail(id: number): Promise<RoleplayDetail> {
  if (MOCK_MODE) {
    await delay(400);
    const allAgents = [...MOCK_AGENTS, ...createdAgents];
    const agent = allAgents.find((a) => a.id === id);
    if (!agent) throw new Error('Roleplay nao encontrado');

    const allCaseSetups = [...MOCK_CASE_SETUPS, ...createdCaseSetups];
    const caseSetup = allCaseSetups.find((cs) => cs.context_id === agent.context_id);

    if (caseSetup) {
      return {
        ...agent,
        training_objective: caseSetup.training_objective,
        persona_profile: caseSetup.persona_profile,
        company_profile: caseSetup.company_profile,
        salesperson_success_criteria: caseSetup.salesperson_success_criteria,
        training_targeted_sales_skills: caseSetup.training_targeted_sales_skills,
      };
    }

    return {
      ...agent,
      training_objective: '',
      persona_profile: {
        name: agent.persona_name,
        age: 40,
        gender_id: 3,
        job_title: agent.persona_job_title,
        department: '',
        career_path: '',
        years_in_current_position: 0,
        previous_professional_experience: '',
        communication_style_id: 1,
        hobbies_and_interests: '',
        description: '',
        point_of_view: '',
        decision_making_role_description: '',
        main_current_problems_frustrations_and_evidence: '',
        main_desires: '',
        main_objections: '',
        main_concerns: '',
      },
      company_profile: {
        name: agent.company_name,
        industry_slug: '',
        specialization: '',
        location: '',
        number_of_employees: 0,
        annual_revenue: 0,
        annual_revenue_unit: 'BRL',
        strategic_focus_areas: '',
        technology_portfolio: '',
        financial_model: '',
        cultural_profile: '',
        description: '',
      },
      salesperson_success_criteria: [],
      training_targeted_sales_skills: [],
    };
  }

  // Real mode: get case setup + agent info
  const response = await fetchWithAuth(`${STA_API_BASE}/case-setup/${id}`, { method: 'GET' });
  const caseSetup = await handleResponse<CaseSetup>(response);
  const agent = await getAgent(id);

  return {
    ...agent,
    training_objective: caseSetup.training_objective,
    persona_profile: caseSetup.persona_profile,
    company_profile: caseSetup.company_profile,
    salesperson_success_criteria: caseSetup.salesperson_success_criteria,
    training_targeted_sales_skills: caseSetup.training_targeted_sales_skills,
  };
}

// ============ CALL RESULT (sempre mockado - sem API ainda) ============

export async function getCallResult(agentId: number): Promise<CallResult> {
  await delay(500);
  return { ...MOCK_CALL_RESULT, agent_id: agentId };
}

/** Lista todas as sessões (chamadas) de um treinamento - mock com 3-5 CallResults */
export async function listCallResults(agentId: number): Promise<CallResult[]> {
  await delay(400);
  const base = new Date('2025-01-15');
  const makeSession = (id: string, date: Date, score: number, name: string): CallResult => ({
    ...MOCK_CALL_RESULT,
    id,
    agent_id: agentId,
    created_at: date.toISOString(),
    user_name: name,
    spin_metrics: { ...MOCK_CALL_RESULT.spin_metrics, overallScore: score },
  });
  return [
    makeSession('s1', base, 62, 'Sessão 1'),
    makeSession('s2', new Date(base.getTime() + 86400000), 68, 'Sessão 2'),
    makeSession('s3', new Date(base.getTime() + 86400000 * 2), 71, 'Sessão 3'),
    makeSession('s4', new Date(base.getTime() + 86400000 * 3), 74, 'Sessão 4'),
  ];
}

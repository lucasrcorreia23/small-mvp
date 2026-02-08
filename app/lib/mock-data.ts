/**
 * Dados mock completos para o fluxo de treinamento de vendas
 * Todos os dados em portugues brasileiro
 */

import {
  Offer,
  Context,
  CaseSetup,
  Agent,
  CallResult,
  CallContextGroup,
  MockMessage,
  OfferGenerateResponse,
  ContextGenerateResponse,
  CaseSetupGenerateResponse,
  PersonaOutput,
  EmployerCompanyOutput,
  AgentInstructionsOutput,
  DialogOutput,
} from './types/sta';

// ============ OFFERS ============

export const MOCK_OFFERS: Offer[] = [
  {
    id: 1,
    offer_name: 'Plataforma SalesBoost Pro',
    general_description: 'Plataforma SaaS B2B de capacitacao e treinamento de equipes de vendas com IA conversacional, simulacoes de chamadas e analise de desempenho SPIN Selling em tempo real.',
    target_audience_description: 'Gerentes e diretores comerciais de empresas B2B de medio e grande porte que buscam aumentar a taxa de conversao de suas equipes de vendas atraves de treinamento pratico e mensuravel.',
    core_value_proposition: 'Aumente em ate 40% a taxa de conversao da sua equipe de vendas com treinamento pratico baseado em IA, simulacoes realistas e metricas SPIN detalhadas.',
    primary_problem_solved: 'Falta de treinamento pratico e mensuravel para equipes de vendas B2B.',
    key_features_and_benefits: 'Simulacoes de vendas com IA conversacional; Analise SPIN Selling automatizada; Dashboard de desempenho individual e da equipe; Cenarios personalizaveis por industria; Feedback em tempo real com dicas de melhoria.',
    unique_selling_points: 'Unica plataforma que combina IA conversacional com metodologia SPIN Selling para treinamento de vendas. Personas de compradores geradas por IA com comportamentos realistas.',
    target_industries_or_domains: 'Tecnologia, SaaS, Servicos Financeiros, Consultoria, Industria',
    competitive_differentiation: 'Diferente de role-plays tradicionais, o SalesBoost Pro oferece pratica ilimitada com personas de IA que reagem de forma realista, sem depender da disponibilidade de colegas ou gestores.',
    delivery_method: 'Plataforma web acessivel via navegador, com app mobile complementar.',
    implementation_onboarding_process: 'Onboarding assistido em 48h. Setup de cenarios personalizados em ate 5 dias uteis. Treinamento do time de gestores incluso.',
    customer_support_model: 'Suporte via chat 24/7, gerente de sucesso dedicado para planos Enterprise, base de conhecimento completa.',
    pricing_details_summary: 'Planos a partir de R$ 89/usuario/mes. Desconto progressivo para equipes maiores. Trial gratuito de 14 dias.',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    offer_name: 'Consultoria em Transformacao Digital',
    general_description: 'Servico de consultoria especializada em transformacao digital para empresas tradicionais, incluindo diagnostico, roadmap estrategico, implementacao de ferramentas e capacitacao de equipes.',
    target_audience_description: 'CEOs e CTOs de empresas tradicionais de medio porte (50 a 500 funcionarios) que reconhecem a necessidade de modernizar seus processos mas nao sabem por onde comecar.',
    core_value_proposition: 'Transforme sua empresa em uma organizacao digital-first em 6 meses, com acompanhamento personalizado e resultados mensuraveis desde o primeiro mes.',
    primary_problem_solved: 'Empresas tradicionais perdendo competitividade por nao conseguirem se adaptar ao mercado digital.',
    key_features_and_benefits: 'Diagnostico digital completo em 2 semanas; Roadmap estrategico personalizado; Implementacao assistida de ferramentas; Capacitacao de equipes; Metricas de ROI desde o primeiro mes.',
    unique_selling_points: 'Metodologia propria validada em mais de 200 empresas. Garantia de ROI mensuravel em 90 dias ou devolvemos o investimento.',
    target_industries_or_domains: 'Varejo, Manufatura, Logistica, Saude, Educacao',
    competitive_differentiation: 'Abordagem hands-on com consultores embedded na operacao do cliente, diferente de consultorias que apenas entregam relatorios.',
    delivery_method: 'Consultoria presencial e remota, com portal de acompanhamento online.',
    implementation_onboarding_process: 'Kickoff em 1 semana. Diagnostico em 2 semanas. Implementacao em ciclos de 30 dias.',
    customer_support_model: 'Consultor dedicado por projeto, suporte tecnico para ferramentas implementadas, reunioes semanais de acompanhamento.',
    pricing_details_summary: 'Projetos a partir de R$ 45.000 por fase. Pacote completo de 6 meses a partir de R$ 180.000.',
    created_at: '2025-01-20T14:00:00Z',
  },
];

// ============ CONTEXTS ============

export const MOCK_CONTEXTS: Context[] = [
  {
    id: 1,
    offer_id: 1,
    name: 'Gerente Comercial - Empresa de Tecnologia',
    target_description: 'Ricardo Mendes, 42 anos, Gerente Comercial de uma empresa de tecnologia com 120 funcionarios. Responsavel por uma equipe de 15 vendedores. Frustrado com a alta rotatividade e o longo ramp-up de novos vendedores.',
    compelling_events: 'A empresa perdeu 3 grandes deals no ultimo trimestre por falta de preparo da equipe. O board esta pressionando por resultados melhores ate o fim do ano.',
    quantifiable_pain_points: 'Taxa de conversao atual de apenas 12%, contra media do setor de 22%. Ramp-up de novos vendedores leva 6 meses. Turnover de 35% ao ano na equipe comercial.',
    desired_future_state: 'Equipe de vendas consistente, com taxa de conversao acima de 20%, ramp-up reduzido para 2 meses e metodologia padronizada de vendas.',
    persona_objections_and_concerns: 'Ja tentamos treinamentos presenciais e nao funcionaram. Minha equipe nao tem tempo para treinamentos longos. Como garantir que vao realmente usar a ferramenta?',
    risk_aversion_level: 'Medio - aberto a novas solucoes mas precisa de evidencias concretas antes de aprovar orcamento.',
    strategic_priorities: 'Aumentar receita recorrente, reduzir ciclo de vendas, padronizar abordagem comercial.',
    primary_value_drivers: 'ROI mensuravel, facilidade de implementacao, adocao rapida pela equipe.',
    typical_decision_making_process: 'Avalia fornecedores, faz piloto com 5 vendedores por 30 dias, apresenta resultados ao diretor para aprovacao final.',
    persona_awareness_of_the_problem: 'Alta - sabe que precisa melhorar o treinamento mas nao encontrou a solucao certa.',
    persona_awareness_of_the_solutions: 'Media - conhece algumas plataformas de e-learning mas nao sabe que existem solucoes com IA conversacional.',
    persona_existing_solutions: 'Treinamentos presenciais esporadicos, role-plays informais entre colegas, materiais em PDF.',
    created_at: '2025-01-16T10:00:00Z',
  },
  {
    id: 2,
    offer_id: 2,
    name: 'CEO - Industria Tradicional',
    target_description: 'Marina Silva, 55 anos, CEO de uma industria de embalagens com 200 funcionarios. Empresa familiar na 3a geracao. Reconhece que precisa modernizar mas tem receio de mudancas drasticas.',
    compelling_events: 'Dois concorrentes menores ganharam participacao de mercado com processos digitalizados. Clientes estao exigindo pedidos online e rastreamento em tempo real.',
    quantifiable_pain_points: 'Processos manuais custam 40% mais que a media digital do setor. Perda de 15% dos clientes nos ultimos 2 anos para concorrentes digitalizados. Lead time de producao 3x maior que benchmarks.',
    desired_future_state: 'Operacao integrada com sistemas digitais, pedidos online, rastreamento em tempo real para clientes e reducao de 30% nos custos operacionais.',
    persona_objections_and_concerns: 'Nao quero trocar tudo de uma vez. Meus funcionarios mais antigos vao resistir. O investimento e muito alto para o momento. Como garantir que nao vamos parar a operacao?',
    risk_aversion_level: 'Alto - extremamente cautelosa com mudancas que possam afetar a operacao atual.',
    strategic_priorities: 'Manter clientes atuais, reduzir custos operacionais, preparar a empresa para a proxima geracao.',
    primary_value_drivers: 'Seguranca na transicao, resultados graduais, suporte proximo durante todo o processo.',
    typical_decision_making_process: 'Consulta diretoria familiar, busca referencias de empresas similares, decide em conjunto com CTO e CFO.',
    persona_awareness_of_the_problem: 'Alta - sente a pressao do mercado diariamente.',
    persona_awareness_of_the_solutions: 'Baixa - sabe que precisa digitalizar mas nao entende as opcoes disponiveis.',
    persona_existing_solutions: 'ERP basico legado, planilhas Excel, comunicacao por telefone e WhatsApp.',
    created_at: '2025-01-21T14:00:00Z',
  },
];

// Helpers for API-aligned Case Setup mocks
function mockPersona(overrides: Partial<PersonaOutput>): PersonaOutput {
  return {
    name: 'Nome',
    age: 40,
    gender_slug: 'other',
    job_title: 'Cargo',
    department: 'Departamento',
    career_path: 'Trajetoria',
    years_in_current_position: 5,
    previous_professional_experience: 'Experiencia previa',
    communication_style_slug: 'formal',
    hobbies_and_interests: '',
    description: '',
    point_of_view: '',
    decision_making_role_description: '',
    main_current_problems_frustrations_and_evidence: '',
    main_desires: '',
    main_objections: '',
    main_concerns: '',
    ...overrides,
  };
}
function mockCompany(overrides: Partial<EmployerCompanyOutput>): EmployerCompanyOutput {
  return {
    name: 'Empresa',
    industry_slug: 'technology',
    specialization: 'Especializacao',
    location: 'Local',
    number_of_employees: 100,
    annual_revenue: 10000000,
    annual_revenue_unit: 'BRL',
    strategic_focus_areas: '',
    technology_portfolio: '',
    financial_model: '',
    cultural_profile: '',
    description: '',
    ...overrides,
  };
}
function mockAgentInstructions(overrides: Partial<AgentInstructionsOutput>): AgentInstructionsOutput {
  return {
    trigger_conditions: [],
    instructions: [],
    tone_and_mood: '',
    desired_behaviors: [],
    undesired_behaviors: [],
    ...overrides,
  };
}
function toDialogOutput(title: string, messages: { role: string; content: string }[]): DialogOutput {
  return {
    title,
    highlights: [],
    messages: messages.map((m) => ({
      role: (m.role === 'seller' ? 'vendor' : 'buyer') as 'vendor' | 'buyer',
      content: m.content,
    })),
  };
}

// ============ CASE SETUPS ============

export const MOCK_CASE_SETUPS: CaseSetup[] = [
  {
    id: 1,
    context_id: 1,
    training_name: 'Qualificacao com Gerente Comercial de Tech',
    training_description: 'Chamada de qualificacao com Ricardo Mendes, Gerente Comercial de uma empresa de tecnologia. O objetivo e identificar as dores da equipe de vendas e demonstrar como o SalesBoost Pro pode resolver.',
    training_objective: 'Qualificar o prospect usando perguntas SPIN, identificar as dores especificas e agendar uma demonstracao.',
    call_context_type_slug: 'qualification_discovery',
    scenario_difficulty_level: 'medium',
    persona_profile: mockPersona({
      name: 'Ricardo Mendes',
      job_title: 'Gerente Comercial',
      age: 42,
      description: 'Direto, orientado a resultados, impaciente com enrolacao, valoriza dados concretos.',
      communication_style_slug: 'direct',
    }),
    company_profile: mockCompany({
      name: 'TechNova Solucoes',
      industry_slug: 'technology',
      number_of_employees: 120,
      annual_revenue: 25000000,
      annual_revenue_unit: 'BRL',
    }),
    buyer_agent_instructions: [
      mockAgentInstructions({
        tone_and_mood: 'Neutro-cético. Está aberto a ouvir mas tem pouca paciência para vendedores que não vão direto ao ponto.',
        instructions: ['Comece cético mas receptivo.', 'Faça perguntas sobre ROI e cases de sucesso.', 'Levante objeções sobre adoção da equipe.'],
        desired_behaviors: ['Se o vendedor demonstrar conhecimento, torne-se mais engajado.'],
        undesired_behaviors: [],
        trigger_conditions: [],
      }),
    ],
    buyer_agent_initial_tone_and_mood: 'Neutro, levemente cético, ocupado.',
    salesperson_success_criteria: [
      'Fazer pelo menos 3 perguntas de Situacao relevantes',
      'Identificar pelo menos 2 dores especificas do prospect',
      'Conectar as dores com beneficios da solucao',
      'Obter compromisso para proxima reuniao ou demonstracao',
      'Nao falar de preco antes de qualificar as necessidades',
    ],
    training_targeted_sales_skills: [
      'Perguntas SPIN',
      'Escuta ativa',
      'Qualificacao',
      'Construcao de rapport',
      'Agendamento de proximos passos',
    ],
    successful_sale_dialogues_examples: [
      toDialogOutput('Qualificacao bem-sucedida', [
        { role: 'seller', content: 'Boa tarde, Ricardo. Obrigado por aceitar a chamada. Sei que seu tempo e valioso, entao vou ser direto. Estou entrando em contato porque ajudamos gerentes comerciais a melhorar a performance de suas equipes. Antes de falar sobre nos, gostaria de entender melhor sua situacao. Como esta a performance da sua equipe hoje?' },
        { role: 'buyer', content: 'Olha, a performance poderia ser melhor. Temos 15 vendedores mas a taxa de conversao esta baixa. Perdemos uns deals importantes recentemente.' },
        { role: 'seller', content: 'Entendo. Quando voce diz que a taxa de conversao esta baixa, tem ideia de quanto esta hoje comparado ao que consideram ideal?' },
        { role: 'buyer', content: 'Estamos em torno de 12%. A media do mercado e 22%. E frustrante.' },
      ]),
    ],
    unsuccessful_sale_dialogues_examples: [
      toDialogOutput('Pitch prematuro', [
        { role: 'seller', content: 'Boa tarde! Estou ligando para apresentar o SalesBoost Pro, a melhor plataforma de treinamento de vendas do mercado. Temos IA, SPIN Selling, dashboard...' },
        { role: 'buyer', content: 'Espera, eu nem disse que preciso disso. Voce pode me dizer quanto custa?' },
      ]),
    ],
    elevenlabs_agent_id: 'mock_agent_elevenlabs_001',
    created_at: '2025-01-17T10:00:00Z',
  },
  {
    id: 2,
    context_id: 2,
    training_name: 'Primeira Reuniao com CEO de Industria',
    training_description: 'Primeira reuniao com Marina Silva, CEO de uma industria de embalagens. Cenario dificil com uma prospect cautelosa e resistente a mudancas. O vendedor precisa construir confianca e demonstrar valor gradual.',
    training_objective: 'Construir confianca, mapear o cenario atual e obter abertura para um diagnostico gratuito.',
    call_context_type_slug: 'presentation_demo',
    scenario_difficulty_level: 'hard',
    persona_profile: mockPersona({
      name: 'Marina Silva',
      job_title: 'CEO',
      age: 55,
      description: 'Cautelosa, tradicional, protetora com a equipe, valoriza relacoes de longo prazo.',
      communication_style_slug: 'reserved',
    }),
    company_profile: mockCompany({
      name: 'Embalagens Uniao',
      industry_slug: 'manufacturing',
      number_of_employees: 200,
      annual_revenue: 80000000,
      annual_revenue_unit: 'BRL',
    }),
    buyer_agent_instructions: [
      mockAgentInstructions({
        tone_and_mood: 'Desconfiada mas educada. Precisa sentir que o vendedor entende seu negocio e nao esta apenas tentando vender.',
        instructions: ['Comece resistente e protetora.', 'Mencione preocupacoes com a equipe e custos.'],
        desired_behaviors: ['Se o vendedor demonstrar empatia e conhecimento da industria, abra-se gradualmente.'],
        undesired_behaviors: ['Nunca tome decisao na primeira conversa.'],
        trigger_conditions: [],
      }),
    ],
    buyer_agent_initial_tone_and_mood: 'Educada mas reservada, levemente desconfiada.',
    salesperson_success_criteria: [
      'Demonstrar conhecimento sobre a industria de embalagens',
      'Fazer perguntas sobre a historia e os valores da empresa',
      'Identificar pelo menos 2 dores sem ser invasivo',
      'Propor um diagnostico gratuito como proximo passo',
      'Nao pressionar por decisao na primeira conversa',
    ],
    training_targeted_sales_skills: [
      'Construcao de confianca',
      'Perguntas SPIN adaptadas',
      'Venda consultiva',
      'Gestao de objecoes',
      'Proposta de valor gradual',
    ],
    successful_sale_dialogues_examples: [
      toDialogOutput('Abertura respeitosa', [
        { role: 'seller', content: 'Dona Marina, muito prazer. Antes de qualquer coisa, gostaria de parabenizar pelo legado que a Embalagens Uniao construiu. Tres geracoes mantendo a qualidade e reputacao no mercado e algo admiravel.' },
        { role: 'buyer', content: 'Obrigada. Realmente temos orgulho do que construimos. Mas me conte, por que voces entraram em contato?' },
      ]),
    ],
    unsuccessful_sale_dialogues_examples: [
      toDialogOutput('Abordagem agressiva', [
        { role: 'seller', content: 'Boa tarde, Dona Marina. Sua empresa precisa se digitalizar urgentemente ou vai perder mercado. Temos a solucao perfeita.' },
        { role: 'buyer', content: 'Olha, eu nao gosto de quem vem me dizer o que eu preciso fazer sem conhecer meu negocio. Acho que nao temos fit.' },
      ]),
    ],
    elevenlabs_agent_id: 'mock_agent_elevenlabs_002',
    created_at: '2025-01-22T14:00:00Z',
  },
];

// ============ CALL CONTEXT VALUES ============

export const MOCK_CALL_CONTEXT_GROUPS: CallContextGroup[] = [
  {
    group: 'Prospeccao',
    types: [
      { slug: 'cold_call', label: 'Cold Call', description: 'Primeiro contato sem agendamento previo' },
      { slug: 'warm_outreach', label: 'Abordagem Morna', description: 'Contato com lead que ja demonstrou interesse' },
    ],
  },
  {
    group: 'Qualificacao',
    types: [
      { slug: 'qualification_discovery', label: 'Qualificacao / Discovery', description: 'Chamada para entender necessidades e qualificar o prospect' },
      { slug: 'needs_analysis', label: 'Analise de Necessidades', description: 'Aprofundamento nas dores e objetivos do prospect' },
    ],
  },
  {
    group: 'Apresentacao',
    types: [
      { slug: 'presentation_demo', label: 'Apresentacao / Demo', description: 'Demonstracao do produto ou servico' },
      { slug: 'proposal_review', label: 'Revisao de Proposta', description: 'Discussao de proposta comercial apresentada' },
    ],
  },
  {
    group: 'Negociacao',
    types: [
      { slug: 'negotiation', label: 'Negociacao', description: 'Discussao de termos, precos e condicoes' },
      { slug: 'objection_handling', label: 'Tratamento de Objecoes', description: 'Foco em superar objecoes especificas' },
    ],
  },
  {
    group: 'Fechamento',
    types: [
      { slug: 'closing', label: 'Fechamento', description: 'Tentativa de fechar o negocio' },
      { slug: 'follow_up', label: 'Follow Up', description: 'Acompanhamento apos proposta ou demonstracao' },
    ],
  },
];

export const MOCK_CALL_CONTEXT_VALUES: { slug: string; label: string; description?: string }[] =
  MOCK_CALL_CONTEXT_GROUPS.flatMap((g) => g.types);

// ============ AGENTS (AGGREGATED) ============

export const MOCK_AGENTS: Agent[] = [
  {
    id: 1,
    training_name: 'Qualificacao com Gerente Comercial de Tech',
    training_description: 'Qualificacao com Ricardo Mendes, Gerente Comercial de uma empresa de tecnologia.',
    offer_name: 'Plataforma SalesBoost Pro',
    offer_id: 1,
    context_id: 1,
    persona_name: 'Ricardo Mendes',
    persona_job_title: 'Gerente Comercial',
    company_name: 'TechNova Solucoes',
    call_context_type_slug: 'qualification_discovery',
    scenario_difficulty_level: 'medium',
    elevenlabs_agent_id: 'mock_agent_elevenlabs_001',
    created_at: '2025-01-17T10:00:00Z',
  },
  {
    id: 2,
    training_name: 'Primeira Reuniao com CEO de Industria',
    training_description: 'Reunião com Marina Silva, CEO de uma industria de embalagens. Cenario dificil.',
    offer_name: 'Consultoria em Transformacao Digital',
    offer_id: 2,
    context_id: 2,
    persona_name: 'Marina Silva',
    persona_job_title: 'CEO',
    company_name: 'Embalagens Uniao',
    call_context_type_slug: 'presentation_demo',
    scenario_difficulty_level: 'hard',
    elevenlabs_agent_id: 'mock_agent_elevenlabs_002',
    created_at: '2025-01-22T14:00:00Z',
  },
];

// ============ CALL RESULT ============

export const MOCK_CALL_RESULT: CallResult = {
  id: 'mock-result-001',
  agent_id: 1,
  duration_seconds: 487,
  spin_metrics: {
    situation: 78,
    problem: 85,
    implication: 62,
    needPayoff: 71,
    overallScore: 74,
    feedback: 'Voce demonstrou boa capacidade de identificar problemas do cliente e fez perguntas de situacao relevantes. Continue praticando perguntas de implicacao para aumentar a urgencia da solucao e fortalecer o compromisso do prospect.',
    detailedFeedback: {
      strengths: [
        'Excelente uso de perguntas abertas para mapear a situacao do prospect',
        'Boa conexao entre as dores identificadas e os beneficios da solucao',
        'Tom de voz profissional e ritmo adequado durante toda a conversa',
        'Demonstrou conhecimento do setor ao mencionar benchmarks relevantes',
      ],
      improvements: [
        'Explorar mais as consequencias financeiras dos problemas identificados (perguntas de Implicacao)',
        'Evitar apresentar a solucao antes de aprofundar todas as dores do prospect',
        'Fazer mais perguntas de Necessidade-Recompensa para que o prospect verbalize os beneficios desejados',
        'Obter compromisso mais firme para os proximos passos ao final da chamada',
      ],
      tips: [
        'Antes de cada chamada, prepare 3 perguntas de Implicacao especificas para o setor do prospect',
        'Use a tecnica "E se nada mudar?" para amplificar a urgencia sem ser agressivo',
        'Quando o prospect mencionar um numero, aprofunde: "Quanto isso representa em receita perdida por mes?"',
        'Ao final, use a tecnica de resumo: repita as 3 principais dores antes de propor o proximo passo',
      ],
      transcript_highlights: [
        {
          quote: 'Como esta a performance da sua equipe de vendas hoje em termos de conversao?',
          comment: 'Otima pergunta de Situacao - aberta, relevante e nao invasiva. Permitiu ao prospect compartilhar dados concretos.',
          type: 'positive',
        },
        {
          quote: 'Entendo que 12% esta abaixo do ideal. E o que acontece quando um vendedor novo entra na equipe?',
          comment: 'Boa transicao para perguntas de Problema. Conectou o dado com uma dor operacional.',
          type: 'positive',
        },
        {
          quote: 'Nossa plataforma resolve exatamente esse problema com treinamento por IA.',
          comment: 'Apresentou a solucao cedo demais. Deveria ter explorado mais as implicacoes antes de oferecer o produto.',
          type: 'negative',
        },
        {
          quote: 'Se a taxa de conversao subisse para 20%, quanto isso representaria em receita adicional?',
          comment: 'Boa tentativa de pergunta de Necessidade-Recompensa, mas poderia ter explorado as implicacoes de nao resolver o problema antes.',
          type: 'suggestion',
        },
      ],
    },
  },
  transcript: 'Vendedor: Boa tarde, Ricardo...\nComprador: Boa tarde...',
  created_at: '2025-01-18T11:30:00Z',
};

// ============ MOCK CONVERSATION SCRIPT ============

export const MOCK_CONVERSATION_SCRIPT: MockMessage[] = [
  {
    role: 'buyer',
    content: 'Alo? Quem fala?',
    delay: 2000,
  },
  {
    role: 'seller',
    content: 'Boa tarde! Aqui e [seu nome] da Perfecting. Estou falando com o Ricardo?',
    delay: 3500,
  },
  {
    role: 'buyer',
    content: 'Sim, sou eu. Do que se trata?',
    delay: 3000,
  },
  {
    role: 'seller',
    content: 'Ricardo, obrigado por atender. Sei que seu tempo e valioso, entao vou ser breve. Ajudamos gerentes comerciais a melhorar a performance de suas equipes de vendas. Antes de falar sobre nos, gostaria de entender: como esta o desempenho da sua equipe hoje?',
    delay: 4000,
  },
  {
    role: 'buyer',
    content: 'Olha, sinceramente, poderia estar melhor. Temos 15 vendedores mas a conversao esta baixa. Perdemos alguns deals importantes recentemente e o board esta pressionando.',
    delay: 4000,
  },
  {
    role: 'seller',
    content: 'Entendo a pressao. Quando voce diz que a conversao esta baixa, tem uma ideia do percentual atual?',
    delay: 3500,
  },
  {
    role: 'buyer',
    content: 'Estamos em 12%. A media do setor e 22%, entao estamos bem abaixo. E o pior e que quando contratamos vendedores novos, leva quase 6 meses ate eles ficarem produtivos.',
    delay: 4500,
  },
  {
    role: 'seller',
    content: 'Seis meses e realmente um tempo longo. E o que voces fazem hoje em termos de treinamento e preparacao da equipe?',
    delay: 3500,
  },
  {
    role: 'buyer',
    content: 'Fazemos alguns treinamentos presenciais, mas sao esporadicos. Tambem tentamos role-plays entre colegas, mas e dificil manter a consistencia. Todo mundo esta ocupado vendendo.',
    delay: 4000,
  },
  {
    role: 'seller',
    content: 'Faz sentido. E se existisse uma forma de sua equipe praticar vendas de forma consistente, com cenarios realistas, sem depender da disponibilidade de colegas, seria algo que valeria a pena explorar?',
    delay: 4000,
  },
  {
    role: 'buyer',
    content: 'Se realmente funcionasse, com certeza. Mas ja vi muitas promessas de ferramentas de treinamento que ninguem usa depois do primeiro mes.',
    delay: 3500,
  },
  {
    role: 'seller',
    content: 'Essa preocupacao e totalmente valida, Ricardo. Por isso sugiro fazermos o seguinte: que tal agendarmos uma demonstracao de 30 minutos onde posso mostrar exatamente como funciona na pratica? Assim voce avalia se faz sentido para sua equipe.',
    delay: 4000,
  },
  {
    role: 'buyer',
    content: 'Tudo bem, posso dar uma olhada. Me manda um convite para quinta de manha, pode ser?',
    delay: 3000,
  },
];

// ============ GENERATE RESPONSE HELPERS ============

export function getMockOfferGeneration(input: { offer_name: string; general_description: string }): OfferGenerateResponse {
  return {
    offer_name: input.offer_name,
    general_description: input.general_description,
    target_audience_description: 'Gestores e diretores de empresas B2B de medio porte que buscam otimizar processos e aumentar resultados comerciais.',
    core_value_proposition: `${input.offer_name} oferece uma solucao completa para transformar a forma como sua empresa opera, com resultados mensuraveis desde o primeiro mes.`,
    primary_problem_solved: 'Ineficiencia nos processos atuais que impactam diretamente os resultados de negocio.',
    key_features_and_benefits: 'Implementacao rapida e intuitiva; Suporte dedicado durante toda a jornada; Metricas de acompanhamento em tempo real; Integracao com ferramentas existentes; Personalizacao conforme necessidades especificas.',
    unique_selling_points: 'Combinacao unica de tecnologia avancada com atendimento humanizado, garantindo adocao e resultados reais.',
    target_industries_or_domains: 'Tecnologia, Servicos, Industria, Varejo',
    competitive_differentiation: 'Diferente de solucoes genericas, oferecemos personalizacao profunda e acompanhamento proximo de resultados.',
    delivery_method: 'Plataforma web com acesso via navegador e aplicativo mobile.',
    implementation_onboarding_process: 'Onboarding assistido em 48h com treinamento completo da equipe.',
    customer_support_model: 'Suporte via chat e email, com gerente de sucesso dedicado.',
    pricing_details_summary: 'Planos flexiveis com trial gratuito de 14 dias.',
  };
}

export function getMockContextGeneration(offerId: number): ContextGenerateResponse {
  const offer = MOCK_OFFERS.find((o) => o.id === offerId) || MOCK_OFFERS[0];
  return {
    offer_id: offerId,
    name: `Perfil de Comprador - ${offer.offer_name}`,
    target_description: 'Profissional de nivel gerencial/diretoria, 35-50 anos, responsavel por decisoes estrategicas na area comercial ou operacional. Busca solucoes que entreguem resultados rapidos e mensuraveis.',
    compelling_events: 'Pressao do mercado por resultados melhores. Concorrentes adotando novas tecnologias. Meta anual agressiva definida pelo board.',
    quantifiable_pain_points: 'Produtividade 30% abaixo da media do setor. Custos operacionais crescentes. Perda de 15% da base de clientes nos ultimos 12 meses.',
    desired_future_state: 'Operacao otimizada com metricas claras, equipe capacitada e resultados consistentes mes a mes.',
    persona_objections_and_concerns: 'Custo do investimento versus retorno. Tempo de implementacao e curva de aprendizado da equipe. Integracao com sistemas existentes.',
    risk_aversion_level: 'Medio',
    strategic_priorities: 'Aumentar eficiencia operacional, reduzir custos, capacitar equipe.',
    primary_value_drivers: 'ROI comprovado, facilidade de uso, suporte dedicado.',
    typical_decision_making_process: 'Pesquisa inicial, avaliacao de 2-3 fornecedores, piloto de 30 dias, decisao colegiada.',
    persona_awareness_of_the_problem: 'Alta - sente as dores diariamente.',
    persona_awareness_of_the_solutions: 'Media - conhece algumas opcoes mas nao explorou profundamente.',
    persona_existing_solutions: 'Processos manuais, planilhas, ferramentas basicas.',
  };
}

export function getMockCaseSetupGeneration(contextId: number, slug?: string, difficulty?: string): CaseSetupGenerateResponse {
  return {
    training_name: 'Chamada de Qualificacao - Novo Prospect',
    training_description: 'Qualificacao onde o vendedor deve mapear as dores do prospect, demonstrar valor e agendar proximos passos.',
    training_objective: 'Qualificar o prospect usando metodologia SPIN e obter compromisso para proxima etapa.',
    call_context_type_slug: slug || 'qualification_discovery',
    scenario_difficulty_level: difficulty || 'medium',
    persona_profile: mockPersona({
      name: 'Carlos Ferreira',
      job_title: 'Diretor de Operacoes',
      age: 45,
      description: 'Analitico, metódico, valoriza dados e planejamento.',
      communication_style_slug: 'formal',
    }),
    company_profile: mockCompany({
      name: 'Grupo Inovare',
      industry_slug: 'services',
      number_of_employees: 85,
      annual_revenue: 15000000,
      annual_revenue_unit: 'BRL',
    }),
    buyer_agent_instructions: [
      mockAgentInstructions({
        tone_and_mood: 'Profissional e curioso, mas cauteloso com promessas.',
        instructions: ['Faca perguntas tecnicas.', 'Peca dados e evidencias.'],
        desired_behaviors: [],
        undesired_behaviors: ['Se o vendedor for vago, demonstre impaciencia.'],
        trigger_conditions: [],
      }),
    ],
    buyer_agent_initial_tone_and_mood: 'Profissional, curioso, levemente cauteloso.',
    salesperson_success_criteria: [
      'Realizar perguntas de descoberta relevantes',
      'Identificar pelo menos 2 dores do prospect',
      'Apresentar valor alinhado as dores identificadas',
      'Obter compromisso para proximo passo',
    ],
    training_targeted_sales_skills: [
      'Perguntas SPIN',
      'Escuta ativa',
      'Qualificacao',
      'Agendamento',
    ],
    successful_sale_dialogues_examples: [
      toDialogOutput('Descoberta inicial', [
        { role: 'seller', content: 'Boa tarde, Carlos. Obrigado pela disponibilidade. Gostaria de comecar entendendo como funciona a operacao hoje.' },
        { role: 'buyer', content: 'Claro, pode perguntar.' },
      ]),
    ],
    unsuccessful_sale_dialogues_examples: [
      toDialogOutput('Pitch prematuro', [
        { role: 'seller', content: 'Boa tarde! Quero te mostrar como nossa solucao e a melhor do mercado!' },
        { role: 'buyer', content: 'Hm, voce nem sabe o que eu preciso ainda...' },
      ]),
    ],
  };
}

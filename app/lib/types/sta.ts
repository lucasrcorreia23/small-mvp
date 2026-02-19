/**
 * Tipos para Sales Training Agents (STA)
 * Alinhado com o schema da API (produção: https://api.perfecting.app/new_sta/)
 */

// ============ OFFER ============

export interface Offer {
  id: number;
  offer_name: string;
  general_description: string;
  target_audience_description: string;
  core_value_proposition: string;
  primary_problem_solved: string;
  key_features_and_benefits: string;
  unique_selling_points: string;
  target_industries_or_domains: string;
  competitive_differentiation: string;
  delivery_method: string;
  implementation_onboarding_process: string;
  customer_support_model: string;
  pricing_details_summary: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfferGenerateRequest {
  offer_name: string;
  general_description: string;
  infer?: boolean;
}

export interface OfferGenerateResponse {
  offer_name: string;
  general_description: string;
  target_audience_description: string;
  core_value_proposition: string;
  primary_problem_solved: string;
  key_features_and_benefits: string;
  unique_selling_points: string;
  target_industries_or_domains: string;
  competitive_differentiation: string;
  delivery_method: string;
  implementation_onboarding_process: string;
  customer_support_model: string;
  pricing_details_summary: string;
}

export interface OfferCreateRequest {
  offer_name: string;
  general_description: string;
  target_audience_description?: string;
  target_industries_or_domains?: string;
  primary_problem_solved?: string;
  core_value_proposition?: string;
  key_features_and_benefits?: string;
  unique_selling_points?: string;
  competitive_differentiation?: string;
  delivery_method?: string;
  implementation_onboarding_process?: string;
  customer_support_model?: string;
  pricing_details_summary?: string;
  url?: string;
}

// ============ CONTEXT ============

export interface Context {
  id: number;
  offer_id: number;
  name: string;
  target_description: string;
  compelling_events: string;
  quantifiable_pain_points: string;
  desired_future_state: string;
  persona_objections_and_concerns: string;
  risk_aversion_level: string;
  strategic_priorities: string;
  primary_value_drivers: string;
  typical_decision_making_process: string;
  persona_awareness_of_the_problem: string;
  persona_awareness_of_the_solutions: string;
  persona_existing_solutions: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContextGenerateRequest {
  offer_id: number;
  /** API aceita "aditional_instructions" (typo da API). Opcional, default "". */
  aditional_instructions?: string;
  infer?: boolean;
}

export interface ContextGenerateResponse {
  name: string;
  offer_id: number;
  target_description: string;
  compelling_events: string;
  strategic_priorities: string;
  quantifiable_pain_points: string;
  desired_future_state: string;
  primary_value_drivers: string;
  typical_decision_making_process: string;
  risk_aversion_level: string;
  persona_objections_and_concerns: string;
  persona_awareness_of_the_problem: string;
  persona_awareness_of_the_solutions: string;
  persona_existing_solutions: string;
}

export interface ContextCreateRequest {
  offer_id: number;
  name: string;
  target_description: string;
  compelling_events?: string;
  quantifiable_pain_points?: string;
  desired_future_state?: string;
  persona_objections_and_concerns?: string;
  risk_aversion_level?: string;
  strategic_priorities?: string;
  primary_value_drivers?: string;
  typical_decision_making_process?: string;
  persona_awareness_of_the_problem?: string;
  persona_awareness_of_the_solutions?: string;
  persona_existing_solutions?: string;
}

// ============ CASE SETUP (API-aligned) ============

/** PersonasOutputSchema */
export interface PersonaOutput {
  name: string;
  age: number;
  gender_id: number;
  job_title: string;
  department: string;
  career_path: string;
  years_in_current_position: number;
  previous_professional_experience: string;
  communication_style_id: number;
  hobbies_and_interests: string;
  description: string;
  point_of_view: string;
  decision_making_role_description: string;
  main_current_problems_frustrations_and_evidence: string;
  main_desires: string;
  main_objections: string;
  main_concerns: string;
}

/** EmployerCompanyOutputSchema */
export interface EmployerCompanyOutput {
  name: string;
  industry_slug: string;
  specialization: string;
  location: string;
  number_of_employees: number;
  annual_revenue: number;
  annual_revenue_unit: string;
  strategic_focus_areas: string;
  technology_portfolio: string;
  financial_model: string;
  cultural_profile: string;
  description: string;
}

/** AgentInstructionsOutputSchema */
export interface AgentInstructionsOutput {
  trigger_conditions: string[];
  instructions: string[];
  tone_and_mood: string;
  desired_behaviors: string[];
  undesired_behaviors: string[];
}

/** _Message (role vendor|buyer, content) */
export interface DialogMessage {
  role: 'vendor' | 'buyer';
  content: string;
}

/** DialogOutputSchema */
export interface DialogOutput {
  title: string;
  highlights: string[];
  messages: DialogMessage[];
}

export interface CaseSetup {
  id: number;
  context_id: number;
  training_name: string;
  training_description: string;
  training_objective: string;
  call_context_type_slug: string;
  scenario_difficulty_level: string;
  persona_profile: PersonaOutput;
  company_profile: EmployerCompanyOutput;
  buyer_agent_instructions: AgentInstructionsOutput[];
  buyer_agent_initial_tone_and_mood: string;
  salesperson_success_criteria: string[];
  training_targeted_sales_skills: string[];
  successful_sale_dialogues_examples: DialogOutput[];
  unsuccessful_sale_dialogues_examples: DialogOutput[];
  elevenlabs_agent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CaseSetupGenerateRequest {
  context_id: number;
  call_context_type_slug?: string;
  scenario_difficulty_level?: string;
  training_objective?: string;
  training_targeted_sales_skills?: string;
  aditional_instructions?: string;
  infer?: boolean;
}

export interface CaseSetupGenerateResponse {
  training_name: string;
  training_description: string;
  training_objective: string;
  call_context_type_slug: string;
  scenario_difficulty_level: string;
  persona_profile: PersonaOutput;
  company_profile: EmployerCompanyOutput;
  buyer_agent_instructions: AgentInstructionsOutput[];
  buyer_agent_initial_tone_and_mood: string;
  salesperson_success_criteria: string[];
  training_targeted_sales_skills: string[];
  successful_sale_dialogues_examples: DialogOutput[];
  unsuccessful_sale_dialogues_examples: DialogOutput[];
}

export interface CaseSetupCreateRequest {
  context_id: number;
  call_context_type_slug: string;
  training_name: string;
  training_description: string;
  training_keywords: string;
  training_objective: string;
  training_targeted_sales_skills: string[];
  scenario_difficulty_level: string;
  buyer_agent_instructions: AgentInstructionsOutput[];
  buyer_prior_knowledge: string[];
  buyer_agent_initial_tone_and_mood: string;
  buyer_agent_first_messages: string[];
  buyer_agent_success_criteria: string[];
  salesperson_instructions: string[];
  salesperson_desired_tone_and_mood: string;
  salesperson_desired_behaviors: string[];
  salesperson_undesired_behaviors: string[];
  salesperson_success_criteria: string[];
  salesperson_evaluation_rubric_criteria: string[];
  company_profile: EmployerCompanyOutput;
  persona_profile: PersonaOutput;
  persona_voice_id: number;
  persona_voice_model_id: string | null;
  successful_sale_dialogues_examples: DialogOutput[];
  unsuccessful_sale_dialogues_examples: DialogOutput[];
}

export interface CallContextGroup {
  group: string;
  types: CallContextValue[];
}

export interface CallContextValue {
  slug: string;
  label: string;
  description?: string;
}

// ============ AGENT (AGGREGATED) ============

export interface Agent {
  id: number;
  training_name: string;
  training_description: string;
  offer_name: string;
  offer_id: number;
  context_id: number;
  persona_name: string;
  persona_job_title: string;
  company_name: string;
  call_context_type_slug: string;
  scenario_difficulty_level: string;
  communication_style_id?: number | null;
  elevenlabs_agent_id?: string;
  created_at?: string;
}

// ============ WIZARD STATE ============

export type WizardStep = 'offer' | 'context' | 'case-setup' | 'review';

export interface ScenarioFormData {
  call_context_type_slug: string;
  scenario_difficulty_level: string;
  training_targeted_sales_skill: string;
  additional_instructions: string;
}

export interface ReviewPersona {
  name: string;
  company: string;
  communication_style: string;
  avatarData?: string;
}

export interface ReviewData {
  training_name: string;
  training_description: string;
  persona: ReviewPersona;
  criteria: string[];
  skills: string[];
}

export interface RoleplayDetail extends Agent {
  training_objective: string;
  persona_profile: PersonaOutput;
  company_profile: EmployerCompanyOutput;
  salesperson_success_criteria: string[];
  training_targeted_sales_skills: string[];
}

export interface WizardState {
  currentStep: WizardStep;
  offer: Partial<OfferCreateRequest> & { id?: number };
  context: Partial<ContextCreateRequest> & { id?: number };
  caseSetup: Partial<CaseSetupCreateRequest> & { id?: number };
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
}

// ============ SPIN METRICS ============

export interface TranscriptHighlight {
  quote: string;
  comment: string;
  type: 'positive' | 'negative' | 'suggestion';
}

export interface DetailedFeedback {
  strengths: string[];
  improvements: string[];
  tips: string[];
  transcript_highlights: TranscriptHighlight[];
}

export interface SpinMetrics {
  situation: number;
  problem: number;
  implication: number;
  needPayoff: number;
  overallScore: number;
  feedback?: string;
  detailedFeedback?: DetailedFeedback;
  /** Analytics KPIs */
  talkListenRatio?: number; // %
  fillerWords?: number; // wpm
  talkSpeed?: number; // wpm
  longestMonologue?: number; // seconds
  callHistory?: { date: string; score: number }[];
}

// ============ OBJECTIONS ============

export interface ObjectionDetail {
  type: string;
  treated: boolean;
  clientObjection: string;
  yourResponse: string;
  platformFeedback: string;
  techniqueUsed?: string;
}

export interface ObjectionsSummary {
  totalCount: number;
  treatmentRate: number;
  treatedCount: number;
  untreatedCount: number;
  quality: string;
  details: ObjectionDetail[];
}

// ============ CALL RESULT ============

export interface RubricResult {
  criterion: string;
  met: boolean;
}

export interface CallResult {
  id: string;
  agent_id: number;
  duration_seconds: number;
  spin_metrics: SpinMetrics;
  rubric_results?: RubricResult[];
  transcript?: string;
  created_at: string;
  objections?: ObjectionsSummary;
  user_name?: string;
}

// ============ MOCK CONVERSATION ============

export interface MockMessage {
  role: 'buyer' | 'seller';
  content: string;
  delay: number; // ms before showing this message
}

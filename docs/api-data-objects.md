# API Data Objects - Documentação de Referência

> **Base URL:** `{API_BASE}/new_sta` (ex: `https://api.perfecting.app/new_sta`)
> **Auth:** Todas as rotas requerem `Authorization: Bearer {token}`

---

## Hierarquia dos objetos

```
Offer (Oferta)
  └── Context (Contexto) [offer_id]
        └── Case Setup (Roleplay/Treinamento) [context_id]
```

---

## 1. OFFER (Oferta)

### GET /offer/list

Lista todas as ofertas.

**Response:** `Offer[]`

### POST /offer/generate

Gera campos da oferta com IA a partir de `offer_name` e `general_description`.

**Request:** `{ offer_name, general_description, infer?: boolean }`

**Response:** `OfferGenerateResponse` (objeto com todos os campos preenchidos)

### POST /offer/create

Cria uma nova oferta.

**Request:** `OfferCreateRequest` (offer_name, general_description, + campos opcionais)

**Response:** `Offer` (com `id` ou `offer_id`)

---

## 2. CONTEXT (Contexto)

### GET /context/list/offer_{offerId}

Lista contextos de uma oferta.

**Response:** `Context[]`

### POST /context/generate

Gera contexto com IA para uma oferta.

**Request:** `{ offer_id: number, aditional_instructions?: string, infer?: boolean }`

**Response:** `ContextGenerateResponse`

### POST /context/create

Cria um novo contexto.

**Request:** `ContextCreateRequest` (offer_id, name, target_description, + opcionais)

**Response:** `Context`

---

## 3. CASE SETUP (Roleplay/Treinamento)

### GET /case_setup/values/call_context

Retorna valores de contexto de chamada (call_context_type_slug).

**Response:** Lista de `{ slug, label, description? }`

### POST /case_setup/generate

Gera case setup com IA.

**Request:** `CaseSetupGenerateRequest` (context_id, call_context_type_slug?, scenario_difficulty_level?, etc.)

**Response:** `CaseSetupGenerateResponse` (persona_profile, company_profile, salesperson_success_criteria, etc.)

### POST /case_setup/create

Cria um novo case setup (roleplay pronto para uso).

**Request:** `CaseSetupCreateRequest` (objeto completo com persona, company, buyer_instructions, etc.)

**Response:** `CaseSetup`

### GET /case_setup/context_{contextId}/list

Lista case setups de um contexto.

**Response:** `CaseSetup[]`

### GET /case_setup_{id}

Retorna um case setup por ID.

**Response:** `CaseSetup`

---

## Mapeamento no projeto

| API | Route Next.js | Serviço |
|-----|---------------|---------|
| offer/list | `/api/new_sta/offer/list` | `sta-service.ts` → `listOffers()` |
| offer/generate | `/api/new_sta/offer/generate` | `generateOffer()` |
| offer/create | `/api/new_sta/offer/create` | `createOffer()` |
| context/list | `/api/new_sta/context/list/[offerId]` | `listContexts(offerId)` |
| context/generate | `/api/new_sta/context/generate` | `generateContext()` |
| context/create | `/api/new_sta/context/create` | `createContext()` |
| case_setup/values | `/api/new_sta/case-setup/values` | `getCallContextValues()` |
| case_setup/generate | `/api/new_sta/case-setup/generate` | `generateCaseSetup()` |
| case_setup/create | `/api/new_sta/case-setup/create` | `createCaseSetup()` |
| case_setup/list | `/api/new_sta/case-setup/list/[contextId]` | waterfall em `listAgents()` |
| case_setup/{id} | `/api/new_sta/case-setup/[id]` | `getAgent()`, `getRoleplayDetail()` |

---

## Tipos principais

Veja `app/lib/types/sta.ts` para definições completas:

- `Offer`, `OfferCreateRequest`, `OfferGenerateResponse`
- `Context`, `ContextCreateRequest`, `ContextGenerateResponse`
- `CaseSetup`, `CaseSetupCreateRequest`, `CaseSetupGenerateResponse`
- `PersonaOutput`, `EmployerCompanyOutput`, `AgentInstructionsOutput`

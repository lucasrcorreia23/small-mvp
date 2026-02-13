# Plano de Implementação - API Perfecting

Documento de referência para implementar toda a lógica de integração com as APIs da Perfecting sem perda de requisitos.

---

## 1. Como as APIs se conversam

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO COMPLETO DO USUÁRIO                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │ 1. AUTH API  │  Login / Signup / Create Organization
  └──────┬───────┘
         │ Retorna: access_token, user_scope (organization_id)
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 2. DATA OBJECTS API (new_sta)                                            │
  │    Offer → Context → Case Setup  (hierarquia para criar role play)       │
  └──────┬───────────────────────────────────────────────────────────────────┘
         │ Resultado: Case Setup = Role Play pronto
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 3. ROLE PLAYS  (Case Setup = Role Play)                                  │
  │    - Listar: via case_setup/list por contexto                            │
  │    - Detalhe: GET case_setup_{id}                                        │
  │    - Link para chamada: GET get_agent_link (URL assinada WebSocket)       │
  └──────┬───────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 4. ROLE PLAYS SESSION  (Chamada + Resultado)                              │
  │    - Chamada: WebSocket na signed_url                                     │
  │    - Resultado: Sessões e feedback (API a integrar)                      │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Dependências entre APIs

| De | Para | O que passa |
|----|------|-------------|
| Auth | Data Objects | Token no header `Authorization` |
| Auth | Get Agent Link | Token no header |
| Auth | Role Plays Session | Token (quando API existir) |
| Data Objects | Role Plays | Case Setup ID = Role Play ID |
| Role Plays | Session | Agent ID para listar sessões |

---

## 2. Ordem de implementação sugerida

### Fase 1: Autenticação (já implementada)

- [x] Login (`/auth/login`)
- [x] Signup (`/auth/create_user`)
- [x] Create Organization (`/auth/create_organization`)
- [x] Persistência de token e user_scope
- [x] Rotas proxy em `/api/login`, `/api/signup`, `/api/create-organization`

**Verificar:** Documentação oficial em `api-hml.perfecting.app/auth/docs` para garantir que request/response estão alinhados.

---

### Fase 2: Data Objects (parcialmente implementada)

- [x] Offer: list, generate, create
- [x] Context: list, generate, create
- [x] Case Setup: values, generate, create, list, get by id

**Diferenças API vs código:**

| Código atual | API real (verificar) |
|--------------|----------------------|
| `case_setup/create` | `case_setup/create` ✓ |
| `case_setup_${id}` | Pode ser `case_setup/{id}` |
| `case_setup/context_${id}/list` | Pode ser `case_setup/list?context_id=` |
| `context/list/offer_${id}` | Pode ser `context/list/{offerId}` |

**Ação:** Consultar `api-hml.perfecting.app/data-objects-docs` e ajustar paths nas rotas `/api/new_sta/*`.

---

### Fase 3: Role Plays (link do agente)

- [x] Get Agent Link (`/get_agent_link/keune` ou path equivalente)
- [x] Fluxo de chamada com WebSocket
- [x] Mock de chamada (`NEXT_PUBLIC_USE_MOCK_AGENT_LINK`)

**Ação:** Verificar em `api-hml.perfecting.app/role-plays-docs` o path exato e o formato do body/response.

---

### Fase 4: Role Plays Session (a implementar)

- [ ] **Listar sessões** de um role play
- [ ] **Obter resultado** de uma sessão específica
- [ ] Integrar com `getCallResult` e `listCallResults` em `sta-service.ts`

**Ação:** Consultar `api-hml.perfecting.app/role-plays-session-docs` e criar:

1. `app/api/sessions/route.ts` ou `app/api/role-plays/[id]/sessions/route.ts`
2. Atualizar `sta-service.ts` para consumir a API real quando `NEXT_PUBLIC_USE_MOCK_STA=false`

---

## 3. Checklist de requisitos por documento

### Auth (api-auth.md)

- [ ] Login retorna `access_token` sem prefixo "Bearer " duplicado
- [ ] Create Organization retorna `new_token` e frontend aplica no localStorage
- [ ] Tratamento de 401 (token expirado) e 403 (sem org/acesso)

### Data Objects (api-data-objects.md)

- [ ] Todos os paths confirmados com a documentação oficial
- [ ] Normalização de `id` vs `offer_id`, `context_id` em respostas
- [ ] Typo `aditional_instructions` (API) mantido se for o esperado

### Role Plays (api-role-plays.md)

- [ ] Path do get_agent_link confirmado
- [ ] Formato de `user_time` (HH:mm vs ISO)
- [ ] Resposta com `signed_url` ou `agent_link` ou `link`

### Role Plays Session (api-role-plays-session.md)

- [ ] Endpoints de listagem e detalhe confirmados
- [ ] Schema de `CallResult` alinhado com a API
- [ ] Paginação (se houver) tratada no frontend

---

## 4. Variáveis de ambiente

```env
# Base
NEXT_PUBLIC_API_BASE_URL=https://api-hml.perfecting.app

# Auth
AUTH_BASE_PATH=/auth
NEXT_PUBLIC_USE_MOCK_AUTH=false

# STA / Data Objects
NEXT_PUBLIC_USE_MOCK_STA=false

# Agent link (chamada de voz)
NEXT_PUBLIC_USE_MOCK_AGENT_LINK=false
```

---

## 5. Próximos passos recomendados

1. **Abrir os PDFs/original docs** e comparar com os `.md` criados; ajustar onde houver divergência.
2. **Testar em homologação** com `NEXT_PUBLIC_API_BASE_URL=https://api-hml.perfecting.app`.
3. **Implementar Phase 4** assim que a API de sessões estiver documentada e disponível.
4. **Remover mocks** gradualmente conforme cada API for validada em produção.

---

## 6. Referência rápida de arquivos

| Documento | Arquivo |
|-----------|---------|
| Auth | `docs/api-auth.md` |
| Data Objects | `docs/api-data-objects.md` |
| Role Plays | `docs/api-role-plays.md` |
| Role Plays Session | `docs/api-role-plays-session.md` |
| Plano de ação | `docs/PLANO_IMPLEMENTACAO.md` (este arquivo) |

| Código | Responsabilidade |
|--------|------------------|
| `app/lib/auth-service.ts` | Auth (login, signup, createOrganization) |
| `app/lib/sta-service.ts` | Data Objects + Role Plays + Sessions (mock) |
| `app/api/*` | Rotas proxy para a API externa |

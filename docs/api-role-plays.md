# API Role Plays - Documentação de Referência

> **Relacionado a:** Data Objects (Case Setup = Role Play)
> **Auth:** Todas as rotas requerem token

---

## O que é um Role Play?

Um **Role Play** (ou **Agent**) é o resultado de um **Case Setup** criado. É o treinamento pronto para o usuário praticar.

---

## Obtenção de Role Plays

Os role plays são obtidos via **Data Objects**:

1. **Listar todos:** waterfall `listOffers()` → `listContexts(offerId)` → `case_setup/list` por contexto
2. **Obter um:** `GET /case_setup_{id}` → `getAgent()` ou `getRoleplayDetail()`

### Estrutura agregada (Agent)

O frontend monta um objeto `Agent` agregando:

- `id` = Case Setup id
- `training_name`, `training_description`, etc. do Case Setup
- `persona_name`, `persona_job_title` do `persona_profile`
- `company_name` do `company_profile`
- `offer_name`, `offer_id`, `context_id` das entidades pai

---

## Link do Agente (WebSocket)

Para iniciar uma chamada de prática, é necessário obter uma **URL assinada** do agente.

### POST /get_agent_link/keune

**Base:** `{API_BASE}` (não `/new_sta`)

**Request:**
```json
{
  "user_time": "HH:mm" ou "HH:mm:ss.SSSZ"
}
```

**Header:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "signed_url": "wss://...",
  "agent_link": "wss://...",
  "link": "wss://..."
}
```

### Mapeamento no projeto

| API | Route Next.js | Uso |
|-----|---------------|-----|
| get_agent_link | `/api/get-agent-link?user_time=10:30` | `get-agent-link/route.ts` → `getSignedUrl()` em `call/page.tsx` |

### Fluxo

1. Usuário clica "Iniciar Chamada" na página de detalhes do roleplay
2. `get-agent-link` é chamado com `user_time` (horário atual do usuário)
3. Resposta contém `signed_url` (WebSocket) para conectar ao agente ElevenLabs
4. `useConversation` usa essa URL para a chamada de voz

---

## Organização e permissões

- O token deve ter `organization_id` no `user_scope` para acessar role plays
- `create_organization` retorna `new_token` que deve ser usado após criar a org
- Erro 403: "User organization does not have access" → usuário sem org ou org sem acesso

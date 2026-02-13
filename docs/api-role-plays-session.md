# API Role Plays Session - Documentação de Referência

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL`
> **Path base:** `/role_plays_session`

---

## Endpoints

## 1. POST /role_plays_session/get_agent_link

- **Tag:** `Elevenlabs Integration`
- **Auth:** sim (`OAuth2PasswordBearer`)
- **Request body (application/json):**

```json
{
  "case_setup_id": 1
}
```

Schema: `Input` (`case_setup_id: integer` obrigatório).

- **Response 200 (`Output`):**

```json
{
  "signed_url": "string",
  "case_data": {
    "case_setup_id": 1,
    "training_name": "string",
    "training_objective": "string",
    "salesperson_instructions": [],
    "salesperson_desired_tone_and_mood": "string",
    "salesperson_desired_behaviors": [],
    "salesperson_undesired_behaviors": [],
    "salesperson_success_criteria": [],
    "elevenlabs_agent_id": "string"
  }
}
```

- **Erro documentado:** `422` (`HTTPValidationError`)

---

## 2. POST /role_plays_session/receive_conversation_webhook

- **Tag:** `Elevenlabs Integration`
- **Auth:** não declarada no OpenAPI fornecido
- **Request body:** não especificado no contrato
- **Response 200:** objeto sem schema tipado (`{}`)

---

## Schemas

### `CaseData` (retornado em `Output.case_data`)

Campos obrigatórios:

- `case_setup_id: integer`
- `training_name: string`
- `training_objective: string`
- `salesperson_instructions: string[]`
- `salesperson_desired_tone_and_mood: string`
- `salesperson_desired_behaviors: string[]`
- `salesperson_undesired_behaviors: string[]`
- `salesperson_success_criteria: string[]`
- `elevenlabs_agent_id: string`

### Erro de validação

- `HTTPValidationError.detail`: `ValidationError[]`

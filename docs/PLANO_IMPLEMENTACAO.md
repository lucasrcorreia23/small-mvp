# Plano de Implementação - API Perfecting

Documento de referência para manter a documentação `.md` alinhada com os contratos OpenAPI.

---

## 1. Contratos oficiais

Os contratos atualmente válidos são:

1. **Auth API** (`/auth`)
2. **Data Objects API** (`/data_objects`)
3. **Role Plays API** (`/role_plays`)
4. **Role Plays Session API** (`/role_plays_session`)

---

## 2. Fluxo funcional entre APIs

```text
Auth (/auth)
  -> fornece access_token e user_scope
  -> token usado nas APIs protegidas

Data Objects (/data_objects)
  -> fornece catálogos auxiliares (genders, styles, methodologies, etc.)

Role Plays (/role_plays)
  -> CRUD e geração de Offer, Context e Case Setup

Role Plays Session (/role_plays_session)
  -> get_agent_link (com case_setup_id)
  -> receive_conversation_webhook
```

---

## 3. Regras de alinhamento da documentação

- Paths devem ser idênticos ao OpenAPI (inclusive formatos com underscore, como `offer_{offer_id}`).
- Campos obrigatórios/opcionais devem refletir exatamente os schemas.
- Segurança (`OAuth2PasswordBearer`) só deve ser marcada quando declarada no endpoint.
- Respostas e status codes devem usar os mesmos códigos do contrato (`200`, `201`, `202`, `204`, `422` quando aplicável).
- Não incluir endpoints hipotéticos, legados ou não presentes no OpenAPI ativo.

---

## 4. Checklist de revisão

### `docs/api-auth.md`
- incluir `create_user`, `login`, `create_organization`, `refresh`
- garantir request de `login` em `application/x-www-form-urlencoded`

### `docs/api-data-objects.md`
- listar apenas os endpoints de `/data_objects`
- remover conteúdo de Offer/Context/Case Setup

### `docs/api-role-plays.md`
- documentar blocos Offer, Context, Case Setup Values e Case Setup
- manter params de path/query conforme contrato

### `docs/api-role-plays-session.md`
- documentar `get_agent_link` e `receive_conversation_webhook`
- manter schemas `Input`, `Output` e `CaseData`

---

## 5. Variáveis de ambiente úteis

```env
NEXT_PUBLIC_API_BASE_URL=https://api-hml.perfecting.app
AUTH_BASE_PATH=/auth
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_STA=false
NEXT_PUBLIC_USE_MOCK_AGENT_LINK=false
```

---

## 6. Referências rápidas

| Documento | Arquivo |
|-----------|---------|
| Auth | `docs/api-auth.md` |
| Data Objects | `docs/api-data-objects.md` |
| Role Plays | `docs/api-role-plays.md` |
| Role Plays Session | `docs/api-role-plays-session.md` |
| Índice | `docs/README.md` |

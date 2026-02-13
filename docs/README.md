# Documentação da API Perfecting

Documentação de referência para implementação da integração com as APIs da Perfecting.

## Documentos

| Arquivo | Descrição |
|---------|-----------|
| [api-auth.md](./api-auth.md) | Auth (`/auth`): create_user, login, create_organization, refresh |
| [api-data-objects.md](./api-data-objects.md) | Data Objects (`/data_objects`): catálogos auxiliares (genders, styles, etc.) |
| [api-role-plays.md](./api-role-plays.md) | Role Plays (`/role_plays`): Offer, Context, Case Setup |
| [api-role-plays-session.md](./api-role-plays-session.md) | Role Plays Session (`/role_plays_session`): get_agent_link e webhook |
| [PLANO_IMPLEMENTACAO.md](./PLANO_IMPLEMENTACAO.md) | Guia de alinhamento e validação dos contratos |

## Fontes originais

Os contratos OpenAPI usados como fonte desta documentação são:
- Auth API (`/auth`)
- Data Objects API (`/data_objects`)
- Role Plays API (`/role_plays`)
- Role Plays Session API (`/role_plays_session`)

Materiais históricos (capturas/PDFs) podem existir em:
- `screencapture-api-hml-perfecting-app-auth-docs-*.pdf`
- `screencapture-api-hml-perfecting-app-data-objects-docs-*.pdf`
- `screencapture-api-hml-perfecting-app-role-plays-docs-*.pdf`
- `screencapture-api-hml-perfecting-app-role-plays-session-docs-*.pdf`

**Importante:** prevalece sempre o contrato OpenAPI mais recente. Em caso de divergência entre markdown e contrato, corrija o markdown.

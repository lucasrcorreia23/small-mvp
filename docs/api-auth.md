# API Auth - Documentação de Referência

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL` (ex: `https://api-hml.perfecting.app`)
> **Path base:** `/auth`
> **Segurança OAuth2 Password:** `tokenUrl=/auth/login`

---

## 1. POST /auth/create_user

Cria um usuário.

### Request (application/json)

| Campo | Tipo | Obrigatório |
|---|---|---|
| name | string | Sim |
| email | string | Sim |
| password | string | Sim |
| nickname | string \| null | Não |
| gender_id | integer \| null | Não |
| cell_phone | string \| null | Não |

### Response (200)

```json
{
  "id": 1,
  "name": "string",
  "email": "string"
}
```

### Erros

- `422` Validation Error (`HTTPValidationError`)

---

## 2. POST /auth/login

Autentica via OAuth2 Password e retorna token + `user_scope`.

### Request (application/x-www-form-urlencoded)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| grant_type | string | Sim | deve ser `password` |
| username | string | Sim | |
| password | string | Sim | |
| scope | string | Não | default `""` |
| client_id | string \| null | Não | |
| client_secret | string \| null | Não | |

### Response (200)

```json
{
  "access_token": "string",
  "token_type": "string",
  "user_scope": {
    "user_id": 1,
    "email": "string",
    "name": "string",
    "email_checked": true,
    "organization_id": 10,
    "organization_is_active": true,
    "organization_resources": [],
    "required_change_password": false,
    "is_active": true,
    "superadmin": false,
    "resources": [],
    "groups": []
  }
}
```

### Erros

- `422` Validation Error (`HTTPValidationError`)

---

## 3. POST /auth/create_organization

Cria organização para o usuário autenticado.

### Segurança

- Requer `Authorization: Bearer {access_token}`

### Request (application/json)

| Campo | Tipo | Obrigatório |
|---|---|---|
| cnpj | integer | Sim |
| name | string | Não |
| official_name | string \| null | Não |
| url | string \| null | Não |
| description | string \| null | Não |

### Response (200)

```json
{
  "organization_name": "string",
  "organization_id": 1,
  "new_token": {}
}
```

### Erros

- `422` Validation Error (`HTTPValidationError`)

---

## 4. POST /auth/refresh

Renova sessão autenticada e retorna o mesmo schema de saída do login.

### Segurança

- Requer `Authorization: Bearer {access_token}`

### Response (200)

Mesmo schema de `POST /auth/login`:

```json
{
  "access_token": "string",
  "token_type": "string",
  "user_scope": {}
}
```

---

## Schemas de erro

- `HTTPValidationError.detail`: lista de `ValidationError`
- `ValidationError`: `{ loc: (string|integer)[], msg: string, type: string }`

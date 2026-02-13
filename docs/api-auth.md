# API Auth - Documentação de Referência

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL` (ex: `https://api-hml.perfecting.app` ou `https://api.perfecting.app`)
> **Path base:** `AUTH_BASE_PATH` (padrão: `/auth`)

---

## 1. POST /auth/create_user

Cria um novo usuário no sistema.

### Request

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome completo |
| email | string | Sim | Email (único) |
| password | string | Sim | Senha |
| nickname | string | Não | Apelido |
| gender_slug | string | Não | Identificador de gênero |
| cell_phone | string | Não | Telefone celular |

### Response (200)

```json
{
  "id": number,
  "name": string,
  "email": string
}
```

### Erros

- **409:** Usuário já cadastrado
- **400/422:** Erro de validação

### Nota

Após criar o usuário, use **POST /auth/login** para obter o token.

---

## 2. POST /auth/login

Autentica o usuário e retorna o token de acesso (OAuth2 password flow).

### Request

**Content-Type:** `application/x-www-form-urlencoded`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| grant_type | string | `"password"` |
| username | string | Email do usuário |
| password | string | Senha |

### Response (200)

```json
{
  "access_token": string,
  "token_type": "bearer",
  "user_scope": {
    "user_id": number,
    "email": string,
    "name": string,
    "email_checked": boolean,
    "organization_id": number | null,
    "organization_is_active": boolean | null,
    "organization_resources": object[] | null,
    "required_change_password": boolean,
    "is_active": boolean,
    "superadmin": boolean,
    "resources": object[],
    "groups": string[]
  }
}
```

### Uso do token

Header em todas as requisições autenticadas:
```
Authorization: Bearer {access_token}
```

Persistir em `localStorage` com chave `token` e `user_scope`.

---

## 3. POST /auth/create_organization

Cria uma organização associada ao usuário. **Requer token.**

### Request

**Header:** `Authorization: Bearer {token}`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| cnpj | number | Sim | CNPJ |
| name | string | Sim | Nome da organização |
| url | string | Sim | URL do site |
| official_name | string | Não | Razão social |
| description | string | Não | Descrição |

### Response (200)

```json
{
  "organization_name": string,
  "organization_id": number,
  "new_token": {
    "access_token": string,
    "token_type": string,
    "user_scope": object
  }
}
```

### Importante

Após criar a organização, **substitua o token** atual pelo `new_token` retornado (contém `organization_id` no user_scope).

---

## Mapeamento no projeto

| API | Route Next.js | Serviço |
|-----|---------------|----------|
| create_user | `/api/signup` | `auth-service.ts` → `signup()` |
| login | `/api/login` | `auth-service.ts` → `login()` |
| create_organization | `/api/create-organization` | `auth-service.ts` → `createOrganization()` |

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_API_BASE_URL=https://api-hml.perfecting.app
AUTH_BASE_PATH=/auth
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

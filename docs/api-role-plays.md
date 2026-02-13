# API Role Plays - Documentação de Referência

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL`
> **Path base:** `/role_plays`
> **Segurança padrão:** `OAuth2PasswordBearer` (quando indicado em cada endpoint)

---

## Visão geral de grupos de endpoints

- **1 - Offer**
- **2 - Contexts**
- **3.1 - Case Setup Values**
- **3.2 - Case Setup**

---

## 1) Offer

### POST /role_plays/offer/generate

- **Auth:** sim
- **Body:** `src__application__services__role_plays__s1_offer_crud__OfferCRUD__Generate__Input`
- **Responses:** `200` (output), `422` (validation)

### POST /role_plays/offer/create

- **Auth:** sim
- **Body:** `src__application__services__role_plays__s1_offer_crud__OfferCRUD__Create__Input`
- **Responses:** `201` (OfferModelPydanticSchema), `422`

### GET /role_plays/offer/list

- **Auth:** sim
- **Responses:** `200` (lista de `OfferModel__SchemaGetListItem`)

### GET /role_plays/offer_{offer_id}

- **Auth:** sim
- **Path param:** `offer_id: integer`
- **Responses:** `200` (OfferModelPydanticSchema), `422`

### PUT /role_plays/offer_{offer_id}

- **Auth:** sim
- **Path param:** `offer_id: integer`
- **Body:** `ContextModelExcl_created_at_created_by_user_id_updated_at_updated_by_user_id_id_organization_idAllOptPydanticSchema`
- **Responses:** `202` (OfferModelPydanticSchema), `422`

### DELETE /role_plays/offer_{offer_id}

- **Auth:** sim
- **Path param:** `offer_id: integer`
- **Responses:** `204`, `422`

---

## 2) Contexts

### POST /role_plays/context/generate

- **Auth:** sim
- **Body:** `src__application__services__role_plays__s2_context_crud__ContextCRUD__Generate__Input`
- **Responses:** `200` (output), `422`

### POST /role_plays/context/create

- **Auth:** sim
- **Body:** `src__application__services__role_plays__s2_context_crud__ContextCRUD__Create__Input`
- **Responses:** `201` (ContextModelPydanticSchema), `422`

### GET /role_plays/context_list

- **Auth:** sim
- **Query param obrigatório:** `offer_id: integer`
- **Responses:** `200` (lista de `ContextModel__SchemaGetListItem`), `422`

---

## 3.1) Case Setup Values

### GET /role_plays/call_contexts

- **Auth:** sim
- **Responses:** `200` (lista de `CaseSetupValuesCRUD__GetCallContext__Output`)

---

## 3.2) Case Setup

### POST /role_plays/generate

- **Auth:** sim
- **Body:** `src__application__services__role_plays__s32_case_setup_crud__CaseSetupCRUD__Generate__Input`
- **Responses:** `200` (output), `422`

### POST /role_plays/case_setup/create

- **Auth:** sim
- **Query param opcional:** `generate_case_prompt: boolean = true`
- **Body:** `src__application__services__role_plays__s32_case_setup_crud__CaseSetupCRUD__Create__Input`
- **Responses:** `201` (CasesSetupModelPydanticSchema), `422`

### GET /role_plays/case_setup/context_{context_id}/list

- **Auth:** sim
- **Path param:** `context_id: integer`
- **Responses:** `200` (lista de `CasesSetupModel__SchemaGetListItem` ou `null`), `422`

### GET /role_plays/case_setup_{case_setup_id}

- **Auth:** sim
- **Path param:** `case_setup_id: integer`
- **Responses:** `200` (CasesSetupModelPydanticSchema), `422`

### PUT /role_plays/case_setup_{case_setup_id}

- **Auth:** sim
- **Path param:** `case_setup_id: integer`
- **Query param opcional:** `generate_case_prompt: boolean = true`
- **Body:** `CasesSetupModelExcl_created_at_created_by_user_id_updated_at_updated_by_user_id_id_organization_id_context_id_case_promptAllOptPydanticSchema`
- **Responses:** `202` (CasesSetupModelPydanticSchema), `422`

### DELETE /role_plays/case_setup_{case_setup_id}

- **Auth:** sim
- **Path param:** `case_setup_id: integer`
- **Responses:** `204`, `422`

### PUT /role_plays/case_setup_{case_setup_id}/case_prompt

- **Auth:** sim
- **Path param:** `case_setup_id: integer`
- **Body:** `CasesSetupModelIncl_c_a_s_e___p_r_o_m_p_tPydanticSchema`
- **Responses:** `202` (CasesSetupModelPydanticSchema), `422`

---

## Notas de contrato

- Os nomes de paths acima (com underscore) devem ser mantidos exatamente como estão no OpenAPI.
- O schema de erro compartilhado é `HTTPValidationError` para respostas `422`.

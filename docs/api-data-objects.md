# API Data Objects - Documentação de Referência

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL`
> **Path base:** `/data_objects`
> **Observação:** no OpenAPI recebido, estes endpoints não declaram `security` obrigatória.

---

## Schema principal

### `SimpleItemOut`

```json
{
  "id": 1,
  "name": "string"
}
```

Usado por quase todos os endpoints desta API.

---

## Endpoints

## 1. GET /data_objects/genders

- **Tag:** `Public`
- **Summary:** `List Genders`
- **Response 200:** `SimpleItemOut[]`

---

## 2. GET /data_objects/communication_styles

- **Tag:** `Role Plays`
- **Summary:** `List Communication Styles`
- **Response 200:** `SimpleItemOut[]`

---

## 3. GET /data_objects/average_sales_cycle_lengths

- **Tag:** `Role Plays`
- **Summary:** `List Average Sales Cycle Lengths`
- **Response 200:** `SimpleItemOut[]`

---

## 4. GET /data_objects/call_context_categories

- **Tag:** `Role Plays`
- **Summary:** `List Call Context Categories`
- **Response 200:** `SimpleItemOut[]`

---

## 5. GET /data_objects/call_context_types

- **Tag:** `Role Plays`
- **Summary:** `List Call Context Types`
- **Response 200:** `SimpleItemOut[]`

---

## 6. GET /data_objects/methodologies

- **Tag:** `Role Plays`
- **Summary:** `List Methodologies`
- **Response 200:** `SimpleItemOut[]`

---

## 7. GET /data_objects/persona_voices

- **Tag:** `Role Plays`
- **Summary:** `List Persona Voices`
- **Response 200:** objeto sem schema tipado no contrato (`{}`)

---

## Erros

O OpenAPI recebido não detalha respostas de erro para estes endpoints.

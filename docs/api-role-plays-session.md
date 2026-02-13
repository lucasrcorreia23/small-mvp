# API Role Plays Session - Documentação de Referência

> **Sessões** = chamadas de prática realizadas (resultados)
> **Status atual:** Sem API de produção documentada – projeto usa mock

---

## O que é uma Sessão?

Uma **sessão** é uma execução de prática de um role play: o usuário faz uma chamada de voz com o agente de IA e, ao final, recebe feedback e métricas.

---

## Fluxo atual (mock)

1. **Chamada:** Usuário conecta via WebSocket (`signed_url` do get_agent_link) ou mock
2. **Durante:** Transcrição e áudio em tempo real
3. **Ao encerrar:** Redireciona para `/agents/[id]/loading`
4. **Resultado:** `getCallResult(agentId)` retorna mock fixo

---

## Endpoints esperados (a implementar)

Baseado na estrutura do projeto, a API de sessões provavelmente terá:

### Listar sessões de um role play

```
GET /role_plays/{role_play_id}/sessions
ou
GET /sessions?agent_id={id}
```

**Response:** `Session[]` ou `CallResult[]`

Cada sessão deve ter:
- `id`
- `agent_id` (role play id)
- `created_at`
- `duration_seconds`
- `spin_metrics` (overallScore, feedback, etc.)
- `rubric_results`
- `objections` (quando disponível)
- `user_name` (opcional)

### Obter resultado de uma sessão

```
GET /sessions/{session_id}
ou
GET /role_plays/{role_play_id}/sessions/{session_id}
```

**Response:** `CallResult` completo

---

## Tipos no projeto

Veja `app/lib/types/sta.ts`:

- `CallResult` – resultado de uma sessão
- `SpinMetrics` – scores SPIN, feedback, analytics
- `RubricResult` – critérios atendidos ou não
- `ObjectionsSummary` – objeções identificadas e tratadas

---

## Serviços atuais

| Função | Arquivo | Status |
|--------|---------|--------|
| `getCallResult(agentId)` | `sta-service.ts` | Sempre mock |
| `listCallResults(agentId)` | `sta-service.ts` | Mock com 4 sessões |

---

## Plano de integração

1. Verificar documentação oficial da API em `api-hml.perfecting.app/role-plays-session/docs`
2. Criar rotas em `/api/` que façam proxy para a API real
3. Atualizar `sta-service.ts` para usar as rotas quando a API estiver disponível
4. Manter mock como fallback quando `NEXT_PUBLIC_USE_MOCK_STA=true`

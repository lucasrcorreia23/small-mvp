/**
 * Client-side persistence for agent display name and avatar (MVP).
 * Stored in localStorage keyed by agent id.
 */

const STORAGE_KEY = 'sta_agent_display_meta';

export interface AgentDisplayMeta {
  displayName?: string;
  avatarType: 'initials' | 'upload';
  avatarData?: string; // data URL when avatarType === 'upload'
}

function getStorage(): Record<string, AgentDisplayMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AgentDisplayMeta>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function setStorage(data: Record<string, AgentDisplayMeta>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getAgentDisplayMeta(agentId: number): AgentDisplayMeta | null {
  const data = getStorage();
  const meta = data[String(agentId)];
  return meta ?? null;
}

export function setAgentDisplayMeta(agentId: number, meta: AgentDisplayMeta): void {
  const data = getStorage();
  data[String(agentId)] = meta;
  setStorage(data);
}

export interface SimpleDataObjectItem {
  id: number;
  name: string;
}

export const DEFAULT_COMMUNICATION_STYLES: SimpleDataObjectItem[] = [];

export async function listCommunicationStyles(): Promise<SimpleDataObjectItem[]> {
  try {
    const response = await fetch('/api/data-objects/communication-styles', { method: 'GET' });
    const data = await response.json().catch(() => []);
    if (!response.ok || !Array.isArray(data)) return [];
    const normalized = data
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') return null;
        const id = Number((item as { id?: unknown }).id);
        const name = (item as { name?: unknown }).name;
        if (!Number.isInteger(id) || typeof name !== 'string') return null;
        return { id, name } as SimpleDataObjectItem;
      })
      .filter(Boolean) as SimpleDataObjectItem[];
    return normalized;
  } catch {
    return [];
  }
}

export function formatCommunicationStyleById(
  styleId: number | null | undefined,
  styles: SimpleDataObjectItem[]
): string {
  if (!styleId || !Number.isInteger(styleId)) return 'Nao informado';
  const found = styles.find((s) => s.id === styleId);
  return found?.name || 'Nao informado';
}

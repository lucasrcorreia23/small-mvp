import { NextResponse } from 'next/server';

type CommunicationStyleItem = {
  id: number;
  name: string;
};

export async function GET() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json({ error: 'API base URL não configurada.' }, { status: 500 });
    }

    const base = apiBaseUrl.replace(/\/$/, '');
    const dataObjectsBase = base.endsWith('/data_objects') ? base : `${base}/data_objects`;
    const url = `${dataObjectsBase}/communication_styles`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar communication styles.', details: data },
        { status: response.status }
      );
    }

    const normalized = Array.isArray(data)
      ? data
          .map((item: unknown) => {
            if (!item || typeof item !== 'object') return null;
            const id = Number((item as { id?: unknown }).id);
            const name = (item as { name?: unknown }).name;
            if (!Number.isInteger(id) || typeof name !== 'string') return null;
            return { id, name: name.trim() } as CommunicationStyleItem;
          })
          .filter(Boolean)
      : [];

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[data-objects] communication styles error:', error);
    return NextResponse.json({ error: 'Erro interno ao listar communication styles.' }, { status: 500 });
  }
}

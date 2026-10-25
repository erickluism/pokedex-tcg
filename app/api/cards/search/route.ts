
import { NextRequest, NextResponse } from 'next/server';

type TCGCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  language?: string;
};

const languages = ['pt', 'en', 'ja', 'zh-tw'];

async function searchLanguage(
  language: string,
  query: string,
  searchByDex: boolean
): Promise<TCGCard[]> {
  const url = new URL(`https://api.tcgdex.net/v2/${language}/cards`);

  if (searchByDex) {
    url.searchParams.set('dexId', String(Number(query)));
  } else {
    url.searchParams.set('name', query);
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${language}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (card): card is TCGCard =>
        typeof card?.id === 'string' &&
        typeof card?.name === 'string'
    )
    .map(card => ({
      ...card,
      language
    }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const mode = request.nextUrl.searchParams.get('mode');

  if (!query) {
    return NextResponse.json(
      { error: 'Informe um nome ou número da Pokédex.' },
      { status: 400 }
    );
  }

  const searchByDex = mode === 'dex';

  if (searchByDex) {
    const number = Number(query);

    if (!/^\d+$/.test(query) || number < 1 || number > 2000) {
      return NextResponse.json(
        { error: 'Informe um número válido da Pokédex.' },
        { status: 400 }
      );
    }
  } else if (query.length < 2) {
    return NextResponse.json(
      { error: 'Digite pelo menos 2 caracteres.' },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.allSettled(
      languages.map(language =>
        searchLanguage(language, query, searchByDex)
      )
    );

    const cards = new Map<string, TCGCard>();

    results.forEach(result => {
      if (result.status !== 'fulfilled') return;

      for (const card of result.value) {
        const key = `${card.language}:${card.id}`;
        cards.set(key, card);
      }
    });

    if (results.every(result => result.status === 'rejected')) {
      return NextResponse.json(
        { error: 'Não foi possível consultar os catálogos.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      cards: Array.from(cards.values()),
      total: cards.size,
      mode: searchByDex ? 'dex' : 'name'
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível pesquisar as cartas.' },
      { status: 502 }
    );
  }
}

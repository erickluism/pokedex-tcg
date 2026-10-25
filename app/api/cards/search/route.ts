
import { NextRequest, NextResponse } from 'next/server';

type TCGCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  language?: string;
};

const languages = ['pt', 'en', 'ja', 'zh-cn', 'zh-tw'];

async function searchLanguage(language: string, query: string) {
  const url = new URL(`https://api.tcgdex.net/v2/${language}/cards`);
  url.searchParams.set('name', query);

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
    return [] as TCGCard[];
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

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Digite pelo menos 2 caracteres.' },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.allSettled(
      languages.map(language => searchLanguage(language, query))
    );

    const cards = new Map<string, TCGCard>();
    const availableLanguages: string[] = [];

    results.forEach((result, index) => {
      if (result.status !== 'fulfilled') return;

      availableLanguages.push(languages[index]);

      for (const card of result.value) {
        // Mantém a primeira versão encontrada.
        // A ordem dos idiomas prioriza português.
        if (!cards.has(card.id)) {
          cards.set(card.id, card);
        }
      }
    });

    if (availableLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível consultar os catálogos.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      cards: Array.from(cards.values()),
      total: cards.size,
      availableLanguages
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível pesquisar as cartas.' },
      { status: 502 }
    );
  }
}

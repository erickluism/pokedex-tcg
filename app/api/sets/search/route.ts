
import { NextRequest, NextResponse } from 'next/server';

type TCGSet = {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
};

type SetResult = TCGSet & {
  language: string;
  languageName: string;
};

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'Inglês' },
  { code: 'ja', name: 'Japonês' },
  { code: 'zh-tw', name: 'Chinês tradicional' }
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function getSets(
  language: string,
  languageName: string
): Promise<SetResult[]> {
  const response = await fetch(
    `https://api.tcgdex.net/v2/${language}/sets`,
    {
      headers: {
        Accept: 'application/json'
      },
      next: {
        revalidate: 3600
      },
      signal: AbortSignal.timeout(15000)
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao consultar ${languageName}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (set): set is TCGSet =>
        typeof set?.id === 'string' &&
        typeof set?.name === 'string'
    )
    .map(set => ({
      ...set,
      language,
      languageName
    }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams
    .get('q')
    ?.trim() || '';

  if (query.length > 100) {
    return NextResponse.json(
      { error: 'Pesquisa muito longa.' },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.allSettled(
      languages.map(language =>
        getSets(language.code, language.name)
      )
    );

    if (
      results.every(result => result.status === 'rejected')
    ) {
      return NextResponse.json(
        { error: 'Não foi possível consultar as coleções.' },
        { status: 502 }
      );
    }

    const sets = new Map<string, SetResult>();

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;

      for (const set of result.value) {
        const key = `${set.language}:${set.id}`;
        sets.set(key, set);
      }
    }

    const normalizedQuery = normalizeText(query);

    const filteredSets = Array.from(sets.values())
      .filter(set => {
        if (!normalizedQuery) return true;

        return (
          normalizeText(set.name).includes(normalizedQuery) ||
          normalizeText(set.id).includes(normalizedQuery)
        );
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    return NextResponse.json({
      sets: filteredSets.slice(0, 30),
      total: filteredSets.length,
      languages: languages.map(language => language.code)
    });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao pesquisar coleções.' },
      { status: 502 }
    );
  }
}

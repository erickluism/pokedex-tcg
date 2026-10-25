
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Digite pelo menos 2 caracteres.' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://api.tcgdex.net/v2/pt/cards');
    url.searchParams.set('name', query);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'O catálogo externo está indisponível.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      cards: Array.isArray(data) ? data : []
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível consultar o catálogo.' },
      { status: 502 }
    );
  }
}

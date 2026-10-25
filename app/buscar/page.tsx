
'use client';

import { useState } from 'react';

type SearchCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

export default function BuscarCartas() {
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function buscar() {
    if (search.trim().length < 2) {
      setMessage('Digite pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    setMessage('');
    setCards([]);

    try {
      const response = await fetch(
        `/api/cards/search?q=${encodeURIComponent(search.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na pesquisa.');
      }

      setCards(data.cards || []);

      if (!data.cards?.length) {
        setMessage('Nenhuma carta encontrada.');
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Erro na pesquisa.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ paddingBottom: 60 }}>
      <h1>Buscar cartas Pokémon</h1>
      <p>Pesquise cartas disponíveis no catálogo TCGdex.</p>

      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 24
      }}>
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') buscar();
          }}
          placeholder="Ex.: Machop, Pikachu, Charizard"
          style={{ flex: 1, minWidth: 200, padding: 12 }}
        />

        <button onClick={buscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Pesquisar'}
        </button>
      </div>

      {message && <p role="status">{message}</p>}

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 20
      }}>
        {cards.map(card => (
          <article
            key={card.id}
            className="panel"
            style={{ padding: 14 }}
          >
            {card.image ? (
              <img
                src={`${card.image}/high.webp`}
                alt={card.name}
                style={{
                  width: '100%',
                  height: 260,
                  objectFit: 'contain'
                }}
              />
            ) : (
              <p>Imagem indisponível</p>
            )}

            <h3>{card.name}</h3>
            <p>Número: {card.localId}</p>
            <p style={{ fontSize: 12 }}>{card.id}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

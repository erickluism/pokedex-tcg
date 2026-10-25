
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type Card = {
  id: string;
  pokedex_number: number;
  name: string;
  set_name: string;
  set_code: string | null;
  collector_number: string;
  language: string;
  rarity: string | null;
  image_url: string | null;
};

type CollectionItem = {
  id: string;
  card_id: string;
  quantity: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase) {
        router.replace('/');
        return;
      }

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace('/');
        return;
      }

      setUserId(authData.user.id);
      setEmail(authData.user.email ?? '');

      const [catalogResult, collectionResult] = await Promise.all([
        supabase.from('catalog_cards').select('*').order('pokedex_number'),
        supabase.from('collection_items').select('id,card_id,quantity')
      ]);

      if (catalogResult.error || collectionResult.error) {
        setMessage(
          catalogResult.error?.message ||
          collectionResult.error?.message ||
          'Erro ao carregar a coleção.'
        );
      } else {
        setCards(catalogResult.data ?? []);
        setItems(collectionResult.data ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function changeQuantity(cardId: string, difference: number) {
    if (!supabase || !userId || busy) return;

    setBusy(true);
    setMessage('');

    const current = items.find(item => item.card_id === cardId);
    const nextQuantity = (current?.quantity ?? 0) + difference;

    let errorMessage = '';

    if (!current && difference > 0) {
      const { error } = await supabase
        .from('collection_items')
        .insert({
          user_id: userId,
          card_id: cardId,
          quantity: difference
        });

      errorMessage = error?.message ?? '';
    } else if (current && nextQuantity <= 0) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', current.id)
        .eq('user_id', userId);

      errorMessage = error?.message ?? '';
    } else if (current) {
      const { error } = await supabase
        .from('collection_items')
        .update({ quantity: nextQuantity })
        .eq('id', current.id)
        .eq('user_id', userId);

      errorMessage = error?.message ?? '';
    }

    if (errorMessage) {
      setMessage(errorMessage);
    } else {
      const { data, error } = await supabase
        .from('collection_items')
        .select('id,card_id,quantity');

      if (error) setMessage(error.message);
      else setItems(data ?? []);
    }

    setBusy(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace('/');
  }

  const totalCards = items.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const uniquePokemon = new Set(
    cards
      .filter(card => items.some(item => item.card_id === card.id))
      .map(card => card.pokedex_number)
  ).size;

  const duplicates = items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity - 1), 0
  );

  const filteredCards = cards.filter(card =>
    `${card.name} ${card.pokedex_number} ${card.set_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <main><p>Carregando sua coleção...</p></main>;
  }

  return (
    <main style={{ paddingBottom: 60 }}>
      <h1>Minha Pokédex TCG</h1>
      <p>Bem-vindo! {email}</p>

      <button onClick={signOut}>Sair da conta</button>

      <section style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        marginTop: 24,
        marginBottom: 30
      }}>
        {[
          ['Total de cartas', totalCards],
          ['Pokémon diferentes', uniquePokemon],
          ['Cartas repetidas', duplicates]
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="panel"
            style={{ minWidth: 170, flex: 1 }}
          >
            <p>{label}</p>
            <h2>{value}</h2>
          </div>
        ))}
      </section>

      <h2>Catálogo de cartas</h2>
      <p>
        Clique em Adicionar para incluir uma carta na sua coleção.
      </p>

      <input
        type="search"
        placeholder="Buscar Pokémon ou coleção..."
        value={search}
        onChange={event => setSearch(event.target.value)}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 24
        }}
      />

      {message && <p role="alert">{message}</p>}

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: 20
      }}>
        {filteredCards.map(card => {
          const owned = items.find(
            item => item.card_id === card.id
          );
          const quantity = owned?.quantity ?? 0;

          return (
            <article
              key={card.id}
              className="panel"
              style={{ padding: 16 }}
            >
              <div style={{
                minHeight: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#16243a',
                borderRadius: 10,
                marginBottom: 16
              }}>
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={`Carta ${card.name}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 280,
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <span>Imagem em preparação</span>
                )}
              </div>

              <h3>#{String(card.pokedex_number).padStart(3, '0')} — {card.name}</h3>
              <p>{card.set_name}</p>
              <p>Carta: {card.collector_number}</p>
              <p>Idioma: {card.language}</p>
              <p>Raridade: {card.rarity ?? 'Não informada'}</p>

              <p>
                <strong>Na minha coleção: {quantity}</strong>
              </p>

              {quantity > 1 && (
                <p>Repetidas: {quantity - 1}</p>
              )}

              <div style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <button
                  disabled={busy}
                  onClick={() => changeQuantity(card.id, 1)}
                >
                  + Adicionar
                </button>

                {quantity > 0 && (
                  <button
                    disabled={busy}
                    onClick={() => changeQuantity(card.id, -1)}
                  >
                    − Remover uma
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {filteredCards.length === 0 && (
        <p>Nenhuma carta encontrada no catálogo.</p>
      )}
    </main>
  );
}

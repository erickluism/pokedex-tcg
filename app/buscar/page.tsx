
'use client';

import { useEffect, useState } from 'react';

type SearchCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  language?: string;
};

type SearchSet = {
  id: string;
  name: string;
  language: string;
  languageName: string;
};

const firstGeneration = [
  'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon',
  'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie',
  'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill',
  'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate',
  'Spearow', 'Fearow', 'Ekans', 'Arbok', 'Pikachu',
  'Raichu', 'Sandshrew', 'Sandslash', 'Nidoran♀', 'Nidorina',
  'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Clefairy',
  'Clefable', 'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff',
  'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume',
  'Paras', 'Parasect', 'Venonat', 'Venomoth', 'Diglett',
  'Dugtrio', 'Meowth', 'Persian', 'Psyduck', 'Golduck',
  'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag',
  'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam',
  'Machop', 'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell',
  'Victreebel', 'Tentacool', 'Tentacruel', 'Geodude', 'Graveler',
  'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro',
  'Magnemite', 'Magneton', "Farfetch'd", 'Doduo', 'Dodrio',
  'Seel', 'Dewgong', 'Grimer', 'Muk', 'Shellder',
  'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Onix',
  'Drowzee', 'Hypno', 'Krabby', 'Kingler', 'Voltorb',
  'Electrode', 'Exeggcute', 'Exeggutor', 'Cubone', 'Marowak',
  'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Koffing', 'Weezing',
  'Rhyhorn', 'Rhydon', 'Chansey', 'Tangela', 'Kangaskhan',
  'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Staryu',
  'Starmie', 'Mr. Mime', 'Scyther', 'Jynx', 'Electabuzz',
  'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Gyarados',
  'Lapras', 'Ditto', 'Eevee', 'Vaporeon', 'Jolteon',
  'Flareon', 'Porygon', 'Omanyte', 'Omastar', 'Kabuto',
  'Kabutops', 'Aerodactyl', 'Snorlax', 'Articuno', 'Zapdos',
  'Moltres', 'Dratini', 'Dragonair', 'Dragonite', 'Mewtwo',
  'Mew'
];

const languageLabels: Record<string, string> = {
  pt: 'Português',
  en: 'Inglês',
  ja: 'Japonês',
  'zh-tw': 'Chinês tradicional'
};

function cardBelongsToSet(cardId: string, setId: string) {
  return cardId.startsWith(`${setId}-`);
}

export default function BuscarCartas() {
  const [search, setSearch] = useState('');
  const [dexNumber, setDexNumber] = useState('');

  const [setText, setSetText] = useState('');
  const [selectedSet, setSelectedSet] = useState<SearchSet | null>(null);
  const [setSuggestions, setSetSuggestions] = useState<SearchSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [cards, setCards] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchedPokemon, setSearchedPokemon] = useState('');

  useEffect(() => {
    if (!showSuggestions || selectedSet) {
      return;
    }

    const query = setText.trim();

    if (query.length < 2) {
      setSetSuggestions([]);
      setLoadingSets(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoadingSets(true);

      try {
        const response = await fetch(
          `/api/sets/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Erro ao consultar coleções.');
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setSetSuggestions(
            Array.isArray(data.sets) ? data.sets : []
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setSetSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSets(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [setText, selectedSet, showSuggestions]);

  function selectSet(set: SearchSet) {
    setSelectedSet(set);
    setSetText(set.name);
    setShowSuggestions(false);
    setSetSuggestions([]);
    setLoadingSets(false);
  }

  function clearSet() {
    setSelectedSet(null);
    setSetText('');
    setSetSuggestions([]);
    setShowSuggestions(false);
    setLoadingSets(false);
  }

  async function buscar() {
    const name = search.trim();
    const dex = dexNumber.trim().replace(/^0+(?=\d)/, '');

    if (setText.trim() && !selectedSet) {
      setMessage(
        'Selecione uma coleção nas sugestões antes de pesquisar.'
      );
      return;
    }

    if (!name && !dex && !selectedSet) {
      setMessage(
        'Informe o nome, número da Pokédex ou uma coleção.'
      );
      return;
    }

    let pokemonName = name;

    if (dex) {
      const number = Number(dex);

      if (
        !/^\d+$/.test(dex) ||
        !Number.isInteger(number) ||
        number < 1 ||
        number > firstGeneration.length
      ) {
        setMessage(
          'Por enquanto, o filtro aceita números de 1 a 151.'
        );
        return;
      }

      pokemonName = firstGeneration[number - 1];
    }

    if (pokemonName && pokemonName.length < 2) {
      setMessage('Digite pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    setMessage('');
    setCards([]);
    setSearchedPokemon(
      pokemonName || selectedSet?.name || ''
    );

    try {
      let foundCards: SearchCard[] = [];

      if (pokemonName) {
        const response = await fetch(
          `/api/cards/search?q=${encodeURIComponent(pokemonName)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro na pesquisa.');
        }

        foundCards = Array.isArray(data.cards)
          ? data.cards
          : [];
      } else if (selectedSet) {
        const response = await fetch(
          `https://api.tcgdex.net/v2/${selectedSet.language}/sets/${encodeURIComponent(selectedSet.id)}`
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar a coleção.');
        }

        const data = await response.json();

        foundCards = Array.isArray(data.cards)
          ? data.cards.map((card: SearchCard) => ({
              ...card,
              language: selectedSet.language
            }))
          : [];
      }

      if (selectedSet) {
        foundCards = foundCards.filter(card =>
          card.language === selectedSet.language &&
          cardBelongsToSet(card.id, selectedSet.id)
        );
      }

      setCards(foundCards);

      if (foundCards.length === 0) {
        setMessage(
          'Nenhuma carta encontrada para esses filtros.'
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro na pesquisa.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ paddingBottom: 60 }}>
      <h1>Buscar cartas Pokémon</h1>

      <p>
        Pesquise pelo nome, número da Pokédex ou coleção.
      </p>

      <section
        className="panel"
        style={{ padding: 20, marginBottom: 24 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 16
          }}
        >
          <label>
            <strong>Nome do Pokémon</strong>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') buscar();
              }}
              placeholder="Ex.: Gengar"
              style={{
                display: 'block',
                width: '100%',
                padding: 12,
                marginTop: 8,
                boxSizing: 'border-box'
              }}
            />
          </label>

          <label>
            <strong>Número da Pokédex</strong>
            <input
              value={dexNumber}
              onChange={event => setDexNumber(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') buscar();
              }}
              placeholder="Ex.: 94 ou 094"
              inputMode="numeric"
              style={{
                display: 'block',
                width: '100%',
                padding: 12,
                marginTop: 8,
                boxSizing: 'border-box'
              }}
            />
          </label>

          <div style={{ position: 'relative' }}>
            <label htmlFor="set-search">
              <strong>Coleção</strong>
            </label>

            <input
              id="set-search"
              value={setText}
              onChange={event => {
                setSetText(event.target.value);
                setSelectedSet(null);
                setSetSuggestions([]);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (!selectedSet) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  setShowSuggestions(false);
                }
                if (event.key === 'Enter' && selectedSet) {
                  buscar();
                }
              }}
              placeholder="Ex.: 30 Anos"
              autoComplete="off"
              style={{
                display: 'block',
                width: '100%',
                padding: 12,
                marginTop: 8,
                boxSizing: 'border-box'
              }}
            />

            {selectedSet && (
              <p style={{ fontSize: 12, marginTop: 6 }}>
                Selecionada: {selectedSet.name} —{' '}
                {selectedSet.languageName} ({selectedSet.language})
                {' '}
                <button
                  type="button"
                  onClick={clearSet}
                >
                  Limpar
                </button>
              </p>
            )}

            {showSuggestions && !selectedSet &&
              setText.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  maxHeight: 280,
                  overflowY: 'auto',
                  background: '#14213d',
                  border: '1px solid #64748b',
                  borderRadius: 8,
                  marginTop: 4
                }}
              >
                {loadingSets && (
                  <p style={{ padding: 12 }}>
                    Buscando coleções...
                  </p>
                )}

                {!loadingSets &&
                  setSuggestions.length === 0 && (
                    <p style={{ padding: 12 }}>
                      Nenhuma sugestão encontrada.
                    </p>
                  )}

                {!loadingSets &&
                  setSuggestions.map(set => (
                    <button
                      key={`${set.language}:${set.id}`}
                      type="button"
                      onClick={() => selectSet(set)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: 12,
                        background: 'transparent',
                        color: 'white',
                        border: 0,
                        borderBottom: '1px solid #334155',
                        cursor: 'pointer'
                      }}
                    >
                      <strong>{set.name}</strong>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: 4
                        }}
                      >
                        {set.languageName ||
                          languageLabels[set.language] ||
                          set.language}
                        {' '}— {set.id}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={buscar}
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Pesquisar cartas'}
        </button>
      </section>

      {message && <p role="status">{message}</p>}

      {searchedPokemon && !loading && cards.length > 0 && (
        <h2>
          {searchedPokemon} — {cards.length} resultados
        </h2>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 20
        }}
      >
        {cards.map(card => (
          <article
            key={`${card.language || 'unknown'}-${card.id}`}
            className="panel"
            style={{ padding: 14 }}
          >
            {card.image ? (
              <img
                src={`${card.image}/high.webp`}
                alt={card.name}
                onError={event => {
                  const image = event.currentTarget;

                  if (image.src.endsWith('/high.webp')) {
                    image.src = `${card.image}/low.webp`;
                  } else {
                    image.style.display = 'none';
                  }
                }}
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
            <p>Carta: {card.localId}</p>
            <p>
              Idioma:{' '}
              {languageLabels[card.language || ''] ||
                card.language ||
                'Não informado'}
            </p>
            <p style={{ fontSize: 12 }}>{card.id}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

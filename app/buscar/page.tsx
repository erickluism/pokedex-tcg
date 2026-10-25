
'use client';

import { useState } from 'react';

type SearchCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  language?: string;
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

export default function BuscarCartas() {
  const [search, setSearch] = useState('');
  const [dexNumber, setDexNumber] = useState('');
  const [cards, setCards] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchedPokemon, setSearchedPokemon] = useState('');

  async function buscar() {
    const name = search.trim();
    const dex = dexNumber.trim().replace(/^0+(?=\d)/, '');

    if (!name && !dex) {
      setMessage('Informe o nome ou número da Pokédex.');
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

    if (pokemonName.length < 2) {
      setMessage('Digite pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    setMessage('');
    setCards([]);
    setSearchedPokemon(pokemonName);

    try {
      const response = await fetch(
        `/api/cards/search?q=${encodeURIComponent(pokemonName)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na pesquisa.');
      }

      const foundCards: SearchCard[] = Array.isArray(data.cards)
        ? data.cards
        : [];

      setCards(foundCards);

      if (foundCards.length === 0) {
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

      <p>
        Pesquise pelo nome ou número da Pokédex Nacional.
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
        </div>

        <button onClick={buscar} disabled={loading}>
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
            <p>Idioma: {card.language || 'Não informado'}</p>
            <p style={{ fontSize: 12 }}>{card.id}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

    </main>
  );
}


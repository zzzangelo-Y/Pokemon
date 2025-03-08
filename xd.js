let player1Pokemon = null;
let player2Pokemon = null;

async function obtenerPokemon(input) {
  try {
    // Convertir el input a minúsculas para la búsqueda por nombre
    const searchTerm = input.toString().toLowerCase();
    const respuesta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
    );
    if (!respuesta.ok) {
      throw new Error("Pokémon no encontrado");
    }
    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + 'Tab').classList.add('active');
  document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

async function getRandomPokemonId() {
  const MIN_POKEMON_ID = 1;
  const MAX_POKEMON_ID = 1025;
  return Math.floor(Math.random() * (MAX_POKEMON_ID - MIN_POKEMON_ID + 1)) + MIN_POKEMON_ID;
}

async function randomPokemon(player) {
  const container = document.getElementById(`player${player}Pokemon`);
  container.innerHTML = `<div class="loading">Buscando Pokémon aleatorio...</div>`;
  let retries = 3;

  while (retries > 0) {
    try {
      const randomId = await getRandomPokemonId();
      const pokemon = await obtenerPokemon(randomId); // Pasa el ID directamente

      if (pokemon) {
        updatePlayerPokemon(player, pokemon);
        return;
      }
      retries--;
    } catch (error) {
      console.error("Error al intentar obtener Pokémon:", error);
      retries--;

      if (retries > 0) {
        container.innerHTML = `<div class="loading">Reintentando obtener Pokémon... (${retries} intentos restantes)</div>`;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  container.innerHTML = `
    <div class="error">
      <p>No se pudo obtener un Pokémon aleatorio.</p>
      <p>Por favor, inténtalo de nuevo.</p>
      <button onclick="randomPokemon(${player})" class="retry-button">Reintentar</button>
    </div>
  `;
}

async function selectPokemon(player) {
  const input = document.getElementById(`player${player}Input`).value.trim();
  if (input === "") return alert("Por favor, ingresa un nombre o número");

  const pokemon = await obtenerPokemon(input);
  if (pokemon) {
    updatePlayerPokemon(player, pokemon);
  } else {
    document.getElementById(`player${player}Pokemon`).innerHTML = `
      <div class="error">Pokémon no encontrado</div>
    `;
  }
}

function updatePlayerPokemon(player, pokemon) {
  const container = document.getElementById(`player${player}Pokemon`);
  const stats = calculateTotalStats(pokemon);
  
  if (player === 1) player1Pokemon = { pokemon, stats };
  else player2Pokemon = { pokemon, stats };

  container.innerHTML = `
    <div class="pokemon-card">
      <h2>${pokemon.name.toUpperCase()}</h2>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-image">
      <div class="pokemon-details">
        <p><strong>HP:</strong> ${pokemon.stats[0].base_stat}</p>
        <p><strong>Ataque:</strong> ${pokemon.stats[1].base_stat}</p>
        <p><strong>Defensa:</strong> ${pokemon.stats[2].base_stat}</p>
        <p><strong>Total:</strong> ${stats}</p>
      </div>
    </div>
  `;

  checkBattleReady();
}

function calculateTotalStats(pokemon) {
  return pokemon.stats.slice(0, 3).reduce((total, stat) => total + stat.base_stat, 0);
}

function checkBattleReady() {
  const startButton = document.getElementById('startBattle');
  startButton.disabled = !(player1Pokemon && player2Pokemon);
}

function startBattle() {
  const result = document.getElementById('battleResult');
  const player1Total = player1Pokemon.stats;
  const player2Total = player2Pokemon.stats;
  
  let winner, loser;
  if (player1Total > player2Total) {
    winner = player1Pokemon;
    loser = player2Pokemon;
  } else if (player2Total > player1Total) {
    winner = player2Pokemon;
    loser = player1Pokemon;
  }

  const winnerCard = winner ? 
    document.querySelector(`#player${winner === player1Pokemon ? '1' : '2'}Pokemon .pokemon-card`) : null;
  
  if (winnerCard) winnerCard.classList.add('winner-animation');

  result.innerHTML = winner ? `
    <h2>${winner.pokemon.name.toUpperCase()} es el ganador!</h2>
    <p>Puntuación total: ${winner.stats} vs ${loser.stats}</p>
  ` : `
    <h2>¡Es un empate!</h2>
    <p>Ambos Pokémon tienen ${player1Total} puntos</p>
  `;
}

async function buscarPokemon() {
  const pokemonInfo = document.getElementById("pokemonInfo");
  const input = document.getElementById("pokemonInput").value.trim();
  if (input === "") return alert("Por favor, ingresa un nombre o número");

  pokemonInfo.innerHTML = `<div class="loading">Buscando Pokémon...</div>`;

  const pokemon = await obtenerPokemon(input);
  if (!pokemon) {
    pokemonInfo.innerHTML = `
      <div class="error">
        <p>Pokémon no encontrado. Por favor, verifica el nombre o número.</p>
        <p>Asegúrate de que esté escrito correctamente.</p>
      </div>`;
    return;
  }

  const sprites = {
    'Normal': pokemon.sprites.front_default,
    'Shiny': pokemon.sprites.front_shiny,
    'Back Normal': pokemon.sprites.back_default,
    'Back Shiny': pokemon.sprites.back_shiny
  };

  const nombre = pokemon.name.toUpperCase();
  const tipos = pokemon.types.map((type) => type.type.name).join(", ");
  const habilidades = pokemon.abilities
    .map((abil) => abil.ability.name)
    .join(", ");
  const peso = pokemon.weight / 10 + " kg";
  const altura = pokemon.height / 10 + " m";
  const stats = pokemon.stats
    .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
    .join("");

  const spriteButtons = Object.entries(sprites)
    .filter(([_, url]) => url !== null)
    .map(([type, url]) => `
      <button class="sprite-button" data-sprite="${url}">
        ${type}
      </button>
    `).join("");

  pokemonInfo.innerHTML = `
    <div class="pokemon-card">
      <h2>${nombre}</h2>
      <div class="sprite-container">
        <img src="${sprites['Normal'] || 'https://via.placeholder.com/150'}" 
             alt="${nombre}" 
             class="pokemon-image" 
             id="currentSprite">
        <div class="sprite-buttons">
          ${spriteButtons}
        </div>
      </div>
      <div class="pokemon-details">
        <p><strong>Tipos:</strong> ${tipos}</p>
        <p><strong>Peso:</strong> ${peso}</p>
        <p><strong>Altura:</strong> ${altura}</p>
        <p><strong>Habilidades:</strong> ${habilidades}</p>
        <div class="stats-container">
          <h3>Estadísticas:</h3>
          <ul class="stats-list">${stats}</ul>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.sprite-button').forEach(button => {
    button.addEventListener('click', () => {
      const spriteUrl = button.dataset.sprite;
      const currentSprite = document.getElementById('currentSprite');
      currentSprite.style.opacity = '0';
      setTimeout(() => {
        currentSprite.src = spriteUrl;
        currentSprite.style.opacity = '1';
      }, 300);
    });
  });
}

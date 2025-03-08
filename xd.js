async function obtenerPokemon(nombre) {
  try {
    const respuesta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`
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

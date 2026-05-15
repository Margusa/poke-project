const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1000";
let offset = 0;
let allPokemons = [];
let currentPokemons = [];

const typeColors = {
  fire: "red",
  water: "blue",
  grass: "green",
  electric: "yellow"
};
async function fetchPokemon() {

  document.getElementById("loader").style.display = "block";

  try {

    const response = await fetch(`${API_URL}?limit=1000`);
    const data = await response.json();

    allPokemons = data.results;
    currentPokemons = allPokemons.slice(offset, offset + 20);
    renderPokemon(currentPokemons);

  } catch (error) {
    console.log(error);

    showError("Error al cargar Pokémon");

  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

//create card
function createPokemonCard(pokemon) {
  const id = pokemon.url.split("/").filter(Boolean).pop();

  const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const favorite = isFavorite(pokemon.url);

  return `
    <div class="col-md-3">
      <div class="card p-2 mb-3">
        
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0">${pokemon.name}</h5>
          <img src="${image}" width="50" />
        </div>

        <button onclick="getPokemonDetail('${pokemon.url}')" class="btn btn-info mb-2 mt-2">
          Ver detalle
        </button>

        ${favorite
      ? `<button onclick="removeFavoriteByUrl('${pokemon.url}')" class="btn btn-danger">
                ❌ Quitar
              </button>`
      : `<button onclick="addFavorite('${pokemon.url}')" class="btn btn-warning">
                ❤️ Guardar
              </button>`
    }
      </div>
    </div>
  `;
}

// button next 
document.getElementById("next").addEventListener("click", () => {
  const searchValue = document.getElementById("search").value.trim();

  if (searchValue) return;
  offset += 20;
  currentPokemons = allPokemons.slice(offset, offset + 20);
  renderPokemon(currentPokemons);
});

// button prev
document.getElementById("prev").addEventListener("click", () => {
  const searchValue = document.getElementById("search").value.trim();

  if (searchValue) return;
  if (offset >= 20) {
    offset -= 20;
  }

  currentPokemons = allPokemons.slice(offset, offset + 20);
  renderPokemon(currentPokemons);
});

// show list
function renderPokemon(pokemons) {
  const container = document.getElementById("pokemon-list");
  container.innerHTML = pokemons.map(createPokemonCard).join("");
  data.results
}

// details pokemon
async function getPokemonDetail(url) {
  const response = await fetch(url);
  const data = await response.json();

  const detail = document.getElementById("pokemon-detail");

  detail.innerHTML = `
    <h2>${data.name}</h2>
    <img src="${data.sprites.front_default}" />
    <p>#${data.id}</p>
    <p>
    Tipo: ${data.types.map(t => `
        <span style="color:${typeColors[t.type.name] || 'white'}">
        ${t.type.name}
        </span>
    `).join(", ")}
    </p>
    <p>Altura: ${data.height}</p>
    <p>Peso: ${data.weight}</p>
    <button class="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
  `;
  const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
  modal.show();
}

//serch bar
document.getElementById("search").addEventListener("input", (e) => {

  const value = e.target.value.toLowerCase().trim();

  if (!value) {
    currentPokemons = allPokemons.slice(offset, offset + 20);
    renderPokemon(currentPokemons);
    return;
  }

  const filtered = allPokemons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(value)
  );

  if (!filtered.length) {
    document.getElementById("pokemon-list").innerHTML =
      "<p>No encontrado</p>";
    return;
  }
  renderPokemon(filtered);
});

//LocalStorage
function getFavorites() {
  try {
    const data = localStorage.getItem("favorites");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error leyendo favoritos:", error);
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

//add favorites
async function addFavorite(url) {
  const response = await fetch(url);
  const data = await response.json();
  const favorites = getFavorites();

  if (favorites.find(p => p.id === data.id)) return;

  const pokemon = {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default
  };

  favorites.push(pokemon);
  saveFavorites(favorites);

  renderFavorites();
  fetchPokemon();
};

//favorites imagen
function renderFavorites() {
  const container = document.getElementById("favorites");
  const favorites = getFavorites();

  container.innerHTML = favorites.map(pokemon => `
    <div class="col-md-2 text-center position-relative mb-3">

      <button 
        onclick="removeFavorite(${pokemon.id})"
        class="btn btn-sm btn-danger position-absolute top-0 end-0"
        style="font-size:10px; padding:2px 6px;"
      >
        ❌
      </button>

      <img src="${pokemon.image}" width="80" />

      <p class="mt-2 text-capitalize">
        ${pokemon.name}
      </p>

    </div>
  `).join("");
}

// // // removeFavorites
window.removeFavoriteByUrl = async function (url) {
  const response = await fetch(url);
  const data = await response.json();

  removeFavorite(data.id);
};

// //validate favorites
function isFavorite(url) {
  const favorites = getFavorites();
  return favorites.some(p => url.includes(`/pokemon/${p.id}`));
}

function removeFavorite(id) {
  let favorites = getFavorites();

  favorites = favorites.filter(p => p.id !== id);

  saveFavorites(favorites);

  renderFavorites();
  fetchPokemon();
}

fetchPokemon()

window.addFavorite = addFavorite;
window.removeFavorite = removeFavorite;
window.getPokemonDetail = getPokemonDetail;
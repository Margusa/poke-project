const API_URL = "https://pokeapi.co/api/v2/pokemon";
let offset = 0;

const typeColors = {
  fire: "red",
  water: "blue",
  grass: "green",
  electric: "yellow"
};
async function fetchPokemon() {
  document.getElementById("loader").style.display = "block";

  try {
    const response = await fetch(`${API_URL}?limit=20&offset=${offset}`);
    const data = await response.json();
    console.log(data)
    renderPokemon(data.results);
  } catch (error) {
    console.log(error)
    showError("Error al cargar Pokémon");
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

//create card
function createPokemonCard(pokemon) {
  return `
    <div class="col-md-3">
      <div class="card p-2 mb-3">
        <h5>${pokemon.name}</h5>
        <button onclick="getPokemonDetail('${pokemon.url}')" class="btn btn-info">
          Ver detalle
        </button>
      </div>
    </div>
  `;
}

// show list
function renderPokemon(pokemons) {
  const container = document.getElementById("pokemon-list");
  container.innerHTML = pokemons.map(createPokemonCard).join("");
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

//serch
document.getElementById("search").addEventListener("input", async (e) => {
  const value = e.target.value.toLowerCase();

  if (!value) {
    //fetchPokemon();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${value}`);
    const data = await response.json();

    renderPokemon([{ name: data.name, url: `${API_URL}/${data.id}` }]);
  } catch {
    document.getElementById("pokemon-list").innerHTML = "<p>No encontrado</p>";
  }
});

// pagination
document.getElementById("next").addEventListener("click", () => {
  offset += 20;
  fetchPokemon();
});

document.getElementById("prev").addEventListener("click", () => {
  if (offset >= 20) {
    offset -= 20;
    fetchPokemon();
  }
});

//errors 
function showError(message) {
  document.getElementById("pokemon-list").innerHTML = `
    <div class="alert alert-danger">${message}</div>
    `;
}

//LocalStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
// buttons
function createPokemonCard(pokemon) {
  return `
    <div class="col-md-3">
      <div class="card p-2 mb-3">
        <h5>${pokemon.name}</h5>

        <button onclick="getPokemonDetail('${pokemon.url}')" class="btn btn-info mb-2">
          Ver detalle
        </button>

        <button onclick="addFavorite('${pokemon.url}')" class="btn btn-warning">
          ❤️ Guardar
        </button>
      </div>
    </div>
  `;
}

//save imagen
async function addFavorite(url) {
  const response = await fetch(url);
  const data = await response.json();

  const favorites = getFavorites();

  const exists = favorites.find(p => p.id === data.id);
  if (exists) return;

  const pokemon = {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default
  };

  favorites.push(pokemon);
  saveFavorites(favorites);

  renderFavorites();
}

//favorites imagen
function renderFavorites() {
  const container = document.getElementById("favorites");
  const favorites = getFavorites();

  container.innerHTML = favorites.map(pokemon => `
    <div class="col-md-2 text-center">
      <img src="${pokemon.image}" width="80" />
      <p>${pokemon.name}</p>
    </div>
  `).join("");
}

fetchPokemon()